/* XML to JSON Converter: pure helpers (no DOM, no imports, so they run in
   both browser and node). A small hand-written XML parser validates
   well-formedness, decodes entities and builds a tree, then a mapper turns
   the tree into JSON with configurable conventions:
   - attributes: '@name' keys (prefix style) or grouped under '@attributes'
   - text content: '#text' key (configurable)
   - repeated sibling elements become arrays
   - CDATA sections become plain text
   - optional type inference: '42' -> 42, 'true' -> true, otherwise strings
   - optional root unwrap: output the root's content without the root name
   - optional namespace stripping: 'ns:tag' -> 'tag'
   - comments and processing instructions are validated but never carried
     into the JSON output
   DOCTYPE is refused outright (XXE safety), same as the XML Formatter:
   it is the only place external entities can be declared, so any input
   containing <!DOCTYPE is rejected before parsing. */

export const SAMPLE_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- Book catalog, 2026: comments are checked but never appear in the JSON -->\n' +
  '<catalog version="2.0">\n' +
  '  <store name="Corner Books" city="Portland">\n' +
  '    <book id="bk101" lang="en">\n' +
  '      <title>XML Guide</title>\n' +
  '      <author>Jane Doe</author>\n' +
  '      <price currency="USD">29.99</price>\n' +
  '      <inStock>true</inStock>\n' +
  '      <description><![CDATA[The <b>definitive</b> guide & reference.]]></description>\n' +
  '    </book>\n' +
  '    <book id="bk102" lang="es">\n' +
  '      <title>Guia XML</title>\n' +
  '      <author>Juan Perez</author>\n' +
  '      <price currency="EUR">24.99</price>\n' +
  '      <inStock>false</inStock>\n' +
  '      <description>Una guia clara para principiantes.</description>\n' +
  '    </book>\n' +
  '    <note>Open daily <b>9 to 5</b>, holidays excepted.</note>\n' +
  '  </store>\n' +
  '</catalog>';

export const DEFAULT_OPTIONS = {
  attrStyle: 'prefix', // 'prefix' | 'grouped'
  textKey: '#text',
  unwrapRoot: false,
  inferTypes: false,
  namespaces: 'keep', // 'keep' | 'strip'
  indent: 2, // 2 | 4 | 0 (minified)
};

const NAME_RE = /^[^0-9\s<>/="'][\S]*$/;
const ENTITY_RE = /^&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z_][A-Za-z0-9_.-]*);/;
const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/* Decode the five predefined XML entities plus numeric references.
   Unknown named entities are left as written: the parser already
   validated the reference shape, and leaving it untouched keeps the
   value faithful instead of inventing a decoding. */
export function decodeEntities(value) {
  return String(value).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z_][A-Za-z0-9_.-]*);/g, (match, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
        try { return String.fromCodePoint(code); } catch { return match; }
      }
      return match;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body)
      ? NAMED_ENTITIES[body]
      : match;
  });
}

function lineCol(src, offset) {
  let line = 1;
  let lastNl = -1;
  for (let i = 0; i < offset && i < src.length; i += 1) {
    if (src[i] === '\n') {
      line += 1;
      lastNl = i;
    }
  }
  return { line, column: offset - lastNl };
}

function err(src, offset, code, message) {
  const { line, column } = lineCol(src, offset);
  return { code, message, line, column, offset };
}

/* True when the input contains a DOCTYPE declaration (any case), which is
   refused for XXE safety. External entity declarations only live there. */
export function findDoctype(src) {
  const m = /<!DOCTYPE[\s>]/i.exec(String(src ?? ''));
  return m ? m.index : -1;
}

function isName(s) {
  return NAME_RE.test(s) && !/[<>/="']/.test(s);
}

/* Validate entity references inside a text or attribute-value slice.
   Returns the offset of the first bad '&', or -1. */
function badEntityOffset(s, base) {
  let i = 0;
  while (i < s.length) {
    if (s[i] === '&') {
      const m = ENTITY_RE.exec(s.slice(i));
      if (!m) return base + i;
      i += m[0].length;
    } else {
      i += 1;
    }
  }
  return -1;
}

/* Parse XML into a small tree. Returns { ok, root, declaration, error }.
   Node kinds: element { name, attributes: [{name, value}], children },
   text { value }, comment { value }, cdata { value }, pi { target, data }.
   Attribute values and text are entity-decoded; comments, CDATA and PIs
   are kept as nodes so the mapper can decide what to drop. */
export function parseXmlTree(input) {
  const src = String(input ?? '').replace(/^\uFEFF/, '');
  if (findDoctype(src) !== -1) {
    const at = findDoctype(src);
    return { ok: false, error: err(src, at, 'doctype', 'DOCTYPE declarations are not allowed, because they can define external entities (XXE). Remove the DOCTYPE and try again.') };
  }
  if (!src.trim()) {
    return { ok: false, error: err(src, 0, 'no-root', 'No XML found. Paste an XML document first.') };
  }

  let i = 0;
  const len = src.length;
  let declaration = null;

  const skipWs = () => {
    while (i < len && /\s/.test(src[i])) i += 1;
  };

  function parseComment() {
    const start = i;
    const end = src.indexOf('-->', i + 4);
    if (end === -1) return { error: err(src, start, 'unclosed-comment', 'Comment starting here is never closed with -->') };
    const value = src.slice(i + 4, end);
    if (value.includes('--')) {
      return { error: err(src, start, 'invalid-comment', 'Comments must not contain -- inside them') };
    }
    i = end + 3;
    return { node: { kind: 'comment', value } };
  }

  function parseCdata() {
    const start = i;
    const end = src.indexOf(']]>', i + 9);
    if (end === -1) return { error: err(src, start, 'unclosed-cdata', 'CDATA section starting here is never closed with ]]>') };
    const node = { kind: 'cdata', value: src.slice(i + 9, end) };
    i = end + 3;
    return { node };
  }

  function parsePi() {
    const start = i;
    const end = src.indexOf('?>', i + 2);
    if (end === -1) return { error: err(src, start, 'unclosed-pi', 'Processing instruction starting here is never closed with ?>') };
    const inner = src.slice(i + 2, end).trim();
    const target = inner.split(/\s+/)[0] || '';
    if (!isName(target)) return { error: err(src, start, 'invalid-pi', 'Processing instruction has an invalid target name') };
    if (target.toLowerCase() === 'xml') {
      return { error: err(src, start, 'decl-not-first', 'An <?xml ...?> declaration is only allowed at the very start of the document') };
    }
    const node = { kind: 'pi', target, data: inner.slice(target.length).trim() };
    i = end + 2;
    return { node };
  }

  function parseAttributes() {
    const attrs = [];
    const seen = new Set();
    for (;;) {
      skipWs();
      if (i >= len) return { error: err(src, i, 'unexpected-eof', 'Document ends inside a start tag') };
      if (src[i] === '>' || src.startsWith('/>', i)) return { attrs };
      const nameStart = i;
      while (i < len && !/[\s=/>]/.test(src[i])) i += 1;
      const name = src.slice(nameStart, i);
      if (!isName(name)) return { error: err(src, nameStart, 'invalid-name', 'Invalid attribute name "' + name + '"') };
      if (seen.has(name)) return { error: err(src, nameStart, 'duplicate-attr', 'Attribute "' + name + '" appears twice on the same element') };
      seen.add(name);
      skipWs();
      if (src[i] !== '=') return { error: err(src, i, 'missing-eq', 'Attribute "' + name + '" needs an = sign and a quoted value') };
      i += 1;
      skipWs();
      const quote = src[i];
      if (quote !== '"' && quote !== "'") {
        return { error: err(src, i, 'missing-quote', 'Attribute "' + name + '" needs its value in single or double quotes') };
      }
      const valStart = i + 1;
      const valEnd = src.indexOf(quote, valStart);
      if (valEnd === -1) return { error: err(src, i, 'unclosed-attr', 'Attribute "' + name + '" is never closed with a matching quote') };
      const value = src.slice(valStart, valEnd);
      if (value.includes('<')) return { error: err(src, valStart, 'invalid-char', 'Attribute values must not contain <') };
      const bad = badEntityOffset(value, valStart);
      if (bad !== -1) return { error: err(src, bad, 'invalid-entity', 'Invalid entity reference in attribute value. Use &amp; &lt; &gt; &quot; &apos; or a numeric reference like &#169;') };
      attrs.push({ name, value: decodeEntities(value) });
      i = valEnd + 1;
    }
  }

  function parseElement(depth) {
    const openStart = i;
    i += 1; // consume <
    const nameStart = i;
    while (i < len && !/[\s/>]/.test(src[i])) i += 1;
    const name = src.slice(nameStart, i);
    if (!isName(name)) return { error: err(src, nameStart, 'invalid-name', 'Invalid element name "' + (name || '(empty)') + '"') };
    const attrRes = parseAttributes();
    if (attrRes.error) return attrRes;
    if (src.startsWith('/>', i)) {
      i += 2;
      return { node: { kind: 'element', name, attributes: attrRes.attrs, children: [] } };
    }
    if (src[i] !== '>') return { error: err(src, i, 'invalid-markup', 'Expected > to close the start tag of <' + name + '>') };
    i += 1;
    const children = [];
    for (;;) {
      if (i >= len) {
        return { error: err(src, openStart, 'unclosed-tag', 'Element <' + name + '> opened here is never closed') };
      }
      if (src.startsWith('</', i)) {
        const closeStart = i;
        i += 2;
        const cStart = i;
        while (i < len && !/[\s>]/.test(src[i])) i += 1;
        const closeName = src.slice(cStart, i);
        skipWs();
        if (src[i] !== '>') return { error: err(src, i, 'invalid-markup', 'Expected > to close the tag </' + closeName + '>') };
        i += 1;
        if (closeName !== name) {
          return { error: err(src, closeStart, 'mismatched-close', 'Closing tag </' + closeName + '> does not match opening tag <' + name + '>') };
        }
        return { node: { kind: 'element', name, attributes: attrRes.attrs, children } };
      }
      if (src.startsWith('<!--', i)) {
        const r = parseComment();
        if (r.error) return r;
        children.push(r.node);
        continue;
      }
      if (src.startsWith('<![CDATA[', i)) {
        const r = parseCdata();
        if (r.error) return r;
        children.push(r.node);
        continue;
      }
      if (src.startsWith('<?', i)) {
        const r = parsePi();
        if (r.error) return r;
        children.push(r.node);
        continue;
      }
      if (src.startsWith('<!', i)) {
        return { error: err(src, i, 'invalid-markup', 'Markup starting with <! is not allowed here. Only comments <!-- --> and CDATA <![CDATA[ ]]> are valid.') };
      }
      if (src[i] === '<') {
        const r = parseElement(depth + 1);
        if (r.error) return r;
        children.push(r.node);
        continue;
      }
      const textStart = i;
      while (i < len && src[i] !== '<') i += 1;
      const text = src.slice(textStart, i);
      if (text.includes(']]>')) {
        return { error: err(src, textStart + text.indexOf(']]>'), 'cdata-end', 'The sequence ]]> is not allowed in character content') };
      }
      const bad = badEntityOffset(text, textStart);
      if (bad !== -1) {
        return { error: err(src, bad, 'invalid-entity', 'Invalid entity reference. A bare & must be written as &amp;, or use a named or numeric reference like &#169;') };
      }
      if (text.length) children.push({ kind: 'text', value: decodeEntities(text) });
    }
  }

  function parseMisc() {
    for (;;) {
      skipWs();
      if (src.startsWith('<!--', i)) {
        const r = parseComment();
        if (r.error) return r;
        continue;
      }
      if (src.startsWith('<?', i)) {
        const r = parsePi();
        if (r.error) return r;
        continue;
      }
      return {};
    }
  }

  // Optional XML declaration, only at the very start.
  skipWs();
  if (src.startsWith('<?xml', i) && /[\s?]/.test(src[i + 5] || '')) {
    const end = src.indexOf('?>', i + 2);
    if (end === -1) return { ok: false, error: err(src, i, 'unclosed-pi', 'XML declaration is never closed with ?>') };
    declaration = src.slice(i, end + 2);
    i = end + 2;
  }

  const misc1 = parseMisc();
  if (misc1.error) return { ok: false, error: misc1.error };
  if (i >= len || src[i] !== '<' || src.startsWith('</', i) || src.startsWith('<!', i) || src.startsWith('<?', i)) {
    return { ok: false, error: err(src, i, 'no-root', 'No root element found. An XML document needs exactly one root element.') };
  }
  const rootRes = parseElement(0);
  if (rootRes.error) return { ok: false, error: rootRes.error };
  const misc2 = parseMisc();
  if (misc2.error) return { ok: false, error: misc2.error };
  if (i < len) {
    return { ok: false, error: err(src, i, 'multiple-roots', 'Content after the root element is not allowed. An XML document has exactly one root element.') };
  }
  return { ok: true, root: rootRes.node, declaration };
}

/* Count elements, attributes and max depth of a parsed tree. */
export function countTree(root) {
  let elements = 0;
  let attributes = 0;
  let maxDepth = 0;
  const walk = (node, depth) => {
    if (node.kind === 'element') {
      elements += 1;
      attributes += node.attributes.length;
      if (depth > maxDepth) maxDepth = depth;
      node.children.forEach((c) => walk(c, depth + 1));
    }
  };
  walk(root, 1);
  return { elements, attributes, depth: maxDepth };
}

const NUMBER_RE = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/;

/* Apply type inference to a text value when enabled. Numbers keep their
   shape: '007' and '0123' stay strings, '29.99' becomes 29.99, and only
   the exact words true and false become booleans. */
export function inferType(value, enabled) {
  if (!enabled) return value;
  const s = String(value);
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (NUMBER_RE.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }
  return s;
}

/* Strip a namespace prefix: 'ns:tag' -> 'tag'. Names without a prefix
   pass through unchanged. */
export function stripNamespace(name) {
  const idx = String(name).indexOf(':');
  return idx === -1 ? name : String(name).slice(idx + 1);
}

function localName(name, opts) {
  return opts.namespaces === 'strip' ? stripNamespace(name) : name;
}

/* Map one element node to a JSON value. Returns a string for text-only
   elements, '' for empty elements, and an object otherwise. */
export function elementToJson(el, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const textKey = opts.textKey && String(opts.textKey).trim() ? String(opts.textKey) : '#text';
  const obj = {};
  if (opts.attrStyle === 'grouped') {
    if (el.attributes.length) {
      const grouped = {};
      for (const a of el.attributes) {
        grouped[localName(a.name, opts)] = inferType(a.value, opts.inferTypes);
      }
      obj['@attributes'] = grouped;
    }
  } else {
    for (const a of el.attributes) {
      obj['@' + localName(a.name, opts)] = inferType(a.value, opts.inferTypes);
    }
  }
  const textParts = [];
  for (const c of el.children) {
    if (c.kind === 'text') {
      const t = c.value.trim();
      if (t) textParts.push(t);
    } else if (c.kind === 'cdata') {
      /* CDATA is text: keep it verbatim, even when it looks like markup. */
      if (c.value.trim()) textParts.push(c.value);
    } else if (c.kind === 'element') {
      const key = localName(c.name, opts);
      const v = elementToJson(c, opts);
      if (key in obj) {
        if (Array.isArray(obj[key])) obj[key].push(v);
        else obj[key] = [obj[key], v];
      } else {
        obj[key] = v;
      }
    }
    /* comments and processing instructions are validated by the parser
       but never carried into the JSON. */
  }
  const keys = Object.keys(obj);
  if (textParts.length) {
    const text = textParts.join(' ');
    if (keys.length === 0) return inferType(text, opts.inferTypes);
    obj[textKey] = inferType(text, opts.inferTypes);
  }
  if (keys.length === 0) return '';
  return obj;
}

/* Convert XML text to a JSON value. Returns { ok, value, stats, error }
   where stats is { elements, attributes, depth } and error carries the
   exact line and column of the first well-formedness problem. */
export function xmlToJsonValue(input, options = {}) {
  const parsed = parseXmlTree(input);
  if (!parsed.ok) return { ok: false, value: null, stats: null, error: parsed.error };
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const rootValue = elementToJson(parsed.root, opts);
  const value = opts.unwrapRoot
    ? rootValue
    : { [localName(parsed.root.name, opts)]: rootValue };
  return { ok: true, value, stats: countTree(parsed.root), error: null };
}

/* One-call helper for the component: parse, map and stringify.
   indent 0 produces minified JSON. Returns { ok, json, value, stats, error }. */
export function convertXmlToJson(input, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = xmlToJsonValue(input, opts);
  if (!result.ok) return { ok: false, json: '', value: null, stats: null, error: result.error };
  const indent = opts.indent === 4 ? 4 : opts.indent === 0 ? 0 : 2;
  const json = indent === 0
    ? JSON.stringify(result.value)
    : JSON.stringify(result.value, null, indent);
  return { ok: true, json, value: result.value, stats: result.stats, error: null };
}
