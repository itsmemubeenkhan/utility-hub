/* Pure XML helpers (no DOM, so they run in both browser and node).
   A small hand-written parser validates well-formedness, pretty-prints,
   minifies, converts to JSON and counts nodes. DOCTYPE is refused outright:
   it is the only place external entities (XXE) can be declared, so any
   input containing <!DOCTYPE is rejected before parsing. */

export const SAMPLE_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101" lang="en">\n    <title>XML Guide</title>\n    <author>Jane Doe</author>\n    <price currency="USD">29.99</price>\n  </book>\n  <book id="bk102" lang="es">\n    <title>Guia XML</title>\n    <author>Juan Perez</author>\n    <price currency="EUR">24.99</price>\n  </book>\n</catalog>';

const NAME_RE = /^[^0-9\s<>/="'][\S]*$/;
const ENTITY_RE = /^&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z_][A-Za-z0-9_.-]*);/;

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
   text { value }, comment { value }, cdata { value }, pi { target, data }. */
export function parseXml(input) {
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
      attrs.push({ name, value });
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
      if (text.length) children.push({ kind: 'text', value: text });
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

/* Validate XML. Returns { valid, error, stats } where stats counts
   elements, attributes, comments and max depth when valid. */
export function validateXml(input) {
  const parsed = parseXml(input);
  if (!parsed.ok) return { valid: false, error: parsed.error, stats: null };
  return { valid: true, error: null, stats: countTree(parsed.root) };
}

function countTree(root) {
  let elements = 0;
  let attributes = 0;
  let comments = 0;
  let maxDepth = 0;
  const walk = (node, depth) => {
    if (node.kind === 'element') {
      elements += 1;
      attributes += node.attributes.length;
      if (depth > maxDepth) maxDepth = depth;
      node.children.forEach((c) => walk(c, depth + 1));
    } else if (node.kind === 'comment') {
      comments += 1;
    }
  };
  walk(root, 1);
  return { elements, attributes, comments, maxDepth };
}

function serialize(node, mode, indentStr, depth) {
  if (node.kind === 'text') {
    if (mode === 'minify') return node.value.trim();
    return node.value;
  }
  if (node.kind === 'comment') return '<!--' + node.value + '-->';
  if (node.kind === 'cdata') return '<![CDATA[' + node.value + ']]>';
  if (node.kind === 'pi') return '<?' + node.target + (node.data ? ' ' + node.data : '') + '?>';
  const attrs = node.attributes.map((a) => ' ' + a.name + '="' + a.value + '"').join('');
  const open = '<' + node.name + attrs;
  if (node.children.length === 0) return open + '/>';
  const kids = node.children.filter((c) => !(c.kind === 'text' && !c.value.trim()));
  if (kids.length === 0) return open + '></' + node.name + '>';
  const onlyText = kids.every((c) => c.kind === 'text' || c.kind === 'cdata');
  if (onlyText) {
    const text = kids.map((c) => (c.kind === 'cdata' ? '<![CDATA[' + c.value + ']]>' : c.value)).join('');
    if (mode === 'minify') return open + '>' + text.trim() + '</' + node.name + '>';
    return open + '>' + text + '</' + node.name + '>';
  }
  if (mode === 'minify') {
    return open + '>' + kids.map((c) => serialize(c, mode, indentStr, depth + 1)).join('') + '</' + node.name + '>';
  }
  const pad = indentStr.repeat(depth + 1);
  const closePad = indentStr.repeat(depth);
  const inner = kids
    .map((c) => {
      const s = serialize(c, mode, indentStr, depth + 1);
      if (c.kind === 'text') return pad + s.trim();
      return pad + s;
    })
    .join('\n');
  return open + '>\n' + inner + '\n' + closePad + '</' + node.name + '>';
}

/* Pretty-print XML with the given indent ('  ', '    ' or '\t').
   Returns { ok, output, error }. */
export function formatXml(input, indent = '  ') {
  const parsed = parseXml(input);
  if (!parsed.ok) return { ok: false, output: '', error: parsed.error };
  const body = serialize(parsed.root, 'pretty', indent, 0);
  return { ok: true, output: (parsed.declaration ? parsed.declaration + '\n' : '') + body, error: null };
}

/* Minify XML: drop insignificant whitespace between tags.
   Returns { ok, output, error }. */
export function minifyXml(input) {
  const parsed = parseXml(input);
  if (!parsed.ok) return { ok: false, output: '', error: parsed.error };
  const body = serialize(parsed.root, 'minify', '  ', 0);
  return { ok: true, output: (parsed.declaration ? parsed.declaration : '') + body, error: null };
}

/* Convert XML to a JSON object. Attributes become @name keys, text becomes
   #text, repeated child elements become arrays, CDATA becomes #cdata.
   Returns { ok, value, error }. */
export function xmlToJson(input) {
  const parsed = parseXml(input);
  if (!parsed.ok) return { ok: false, value: null, error: parsed.error };
  return { ok: true, value: { [parsed.root.name]: elementToJson(parsed.root) }, error: null };
}

function elementToJson(el) {
  const obj = {};
  for (const a of el.attributes) obj['@' + a.name] = a.value;
  const textParts = [];
  for (const c of el.children) {
    if (c.kind === 'text') {
      const t = c.value.trim();
      if (t) textParts.push(t);
    } else if (c.kind === 'cdata') {
      obj['#cdata'] = c.value;
    } else if (c.kind === 'element') {
      const v = elementToJson(c);
      if (c.name in obj) {
        if (Array.isArray(obj[c.name])) obj[c.name].push(v);
        else obj[c.name] = [obj[c.name], v];
      } else {
        obj[c.name] = v;
      }
    }
  }
  const keys = Object.keys(obj);
  if (textParts.length) {
    const text = textParts.join(' ');
    if (keys.length === 0) return text;
    obj['#text'] = text;
  }
  return obj;
}

/* Count characters, elements, attributes and depth of valid XML.
   Returns null when the input is invalid. */
export function countXml(input) {
  const parsed = parseXml(input);
  if (!parsed.ok) return null;
  const stats = countTree(parsed.root);
  return { chars: String(input ?? '').length, ...stats };
}

/* Tokenize XML for syntax highlighting. Returns [{ type, text }] with
   types: decl, tag, attr, value, text, comment, cdata, pi. Malformed
   stretches fall back to plain text tokens. */
export function tokenizeXml(input) {
  const src = String(input ?? '');
  const tokens = [];
  let i = 0;
  const len = src.length;
  const push = (type, text) => {
    if (text) tokens.push({ type, text });
  };
  while (i < len) {
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      const stop = end === -1 ? len : end + 3;
      push('comment', src.slice(i, stop));
      i = stop;
      continue;
    }
    if (src.startsWith('<![CDATA[', i)) {
      const end = src.indexOf(']]>', i + 9);
      const stop = end === -1 ? len : end + 3;
      push('cdata', src.slice(i, stop));
      i = stop;
      continue;
    }
    if (src.startsWith('<?', i)) {
      const end = src.indexOf('?>', i + 2);
      const stop = end === -1 ? len : end + 2;
      push(src.startsWith('<?xml', i) ? 'decl' : 'pi', src.slice(i, stop));
      i = stop;
      continue;
    }
    if (src[i] === '<') {
      const gt = src.indexOf('>', i);
      const stop = gt === -1 ? len : gt + 1;
      const raw = src.slice(i, stop);
      const m = /^<\/?([^\s/>]+)/.exec(raw);
      if (m) {
        push('tag', raw.slice(0, m[0].length));
        let rest = raw.slice(m[0].length);
        const attrRe = /(\s+[^\s=/>]+)(\s*=\s*)("[^"]*"|'[^']*')?/g;
        let last = 0;
        let am;
        while ((am = attrRe.exec(rest)) !== null) {
          if (am.index > last) push('tag', rest.slice(last, am.index));
          push('attr', am[1]);
          if (am[2]) push('tag', am[2]);
          if (am[3]) push('value', am[3]);
          last = am.index + am[0].length;
        }
        if (last < rest.length) push('tag', rest.slice(last));
      } else {
        push('tag', raw);
      }
      i = stop;
      continue;
    }
    const next = src.indexOf('<', i);
    const stop = next === -1 ? len : next;
    push('text', src.slice(i, stop));
    i = stop;
  }
  return tokens;
}
