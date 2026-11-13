/* Pure JSON-to-XML helpers (no DOM, no imports, so they run in both
   browser and node). One direction only: JSON in, well-formed XML out.
   Conventions follow the common XML/JSON mapping used by the sibling
   XML Formatter's XML-to-JSON mode, so the two tools round-trip:
   keys starting with @ become attributes, #text is element text
   content, repeated elements become arrays. Extra rules:
   - null handling is configurable: empty element (<k/>), omit the
     element entirely, or xsi:nil="true" (adds xmlns:xsi to the root).
   - Keys that are not valid XML names (start with a digit, contain
     spaces or other illegal characters) are sanitized and reported
     as warnings instead of failing the conversion.
   - Text is escaped (& < >) and attribute values are escaped too
     (& < > " '), so the output is always well-formed XML.
   - The root element name and the array item element name are
     configurable; the XML declaration and the indent (2 spaces,
     4 spaces or tab) are toggles. */

export const SAMPLE_JSON =
  '{\n' +
  '  "catalog": {\n' +
  '    "@version": "1.0",\n' +
  '    "store": {\n' +
  '      "@name": "Corner Books",\n' +
  '      "book": [\n' +
  '        { "@id": "bk101", "title": "XML Guide", "price": 44.95, "inStock": true },\n' +
  '        { "@id": "bk102", "title": "Tom & Jerry <Tales>", "price": 5.95, "inStock": false }\n' +
  '      ],\n' +
  '      "note": { "#text": "Open daily 9 to 5", "@lang": "en" },\n' +
  '      "2nd place": "runner up",\n' +
  '      "discount": null\n' +
  '    }\n' +
  '  }\n' +
  '}\n';

export const DEFAULT_OPTIONS = {
  rootName: 'root',
  itemName: 'item',
  declaration: true,
  indent: '  ',
  nullMode: 'empty',
};

const XML_NAME_RE = /^[A-Za-z_][A-Za-z0-9_.\-]*$/;

/* Sanitize a key into a valid XML element or attribute name. Returns
   { name, repaired } where repaired is true when the key changed. */
export function sanitizeXmlName(key) {
  if (XML_NAME_RE.test(key)) return { name: key, repaired: false };
  let name = String(key).replace(/[^A-Za-z0-9_.\-]/g, '_');
  if (/^[0-9.\-]/.test(name)) name = '_' + name;
  if (!name) name = 'element';
  return { name, repaired: true };
}

export function escapeXmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeXmlAttr(value) {
  return escapeXmlText(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* A small JSON parser used only to locate the error position when
   JSON.parse fails: V8's message sometimes carries "at position N"
   or "(line X column Y)", and sometimes neither, so this scanner
   walks the text and throws the index of the first bad token. It
   never runs on valid input, so a false positive here only moves
   the reported position, never a good document. */
function findJsonErrorIndex(text) {
  let i = 0;
  const fail = (at) => { throw { index: at }; };
  const skipWs = () => {
    while (i < text.length && ' \t\n\r'.includes(text[i])) i += 1;
  };
  const parseString = () => {
    /* text[i] is the opening quote. */
    i += 1;
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"') { i += 1; return; }
      if (ch === '\\') {
        const esc = text[i + 1];
        if (!esc || !'"\\/bfnrtu'.includes(esc)) fail(i + 1);
        if (esc === 'u') {
          for (let k = 2; k <= 5; k += 1) {
            if (!text[i + k] || !/[0-9A-Fa-f]/.test(text[i + k])) fail(i + k);
          }
          i += 6;
        } else {
          i += 2;
        }
        continue;
      }
      if (ch < ' ') fail(i);
      i += 1;
    }
    fail(text.length);
  };
  const parseNumber = () => {
    const start = i;
    if (text[i] === '-') i += 1;
    if (text[i] === '0') {
      i += 1;
    } else if (/[1-9]/.test(text[i] || '')) {
      while (/[0-9]/.test(text[i] || '')) i += 1;
    } else {
      fail(i);
    }
    if (text[i] === '.') {
      i += 1;
      if (!/[0-9]/.test(text[i] || '')) fail(i);
      while (/[0-9]/.test(text[i] || '')) i += 1;
    }
    if (text[i] === 'e' || text[i] === 'E') {
      i += 1;
      if (text[i] === '+' || text[i] === '-') i += 1;
      if (!/[0-9]/.test(text[i] || '')) fail(i);
      while (/[0-9]/.test(text[i] || '')) i += 1;
    }
    if (i === start || (text[start] === '-' && i === start + 1)) fail(start);
  };
  const parseLiteral = (word) => {
    if (!text.startsWith(word, i)) fail(i);
    i += word.length;
  };
  const parseValue = () => {
    skipWs();
    if (i >= text.length) fail(text.length);
    const ch = text[i];
    if (ch === '{') {
      i += 1;
      skipWs();
      if (text[i] === '}') { i += 1; return; }
      for (;;) {
        skipWs();
        if (text[i] !== '"') fail(i);
        parseString();
        skipWs();
        if (text[i] !== ':') fail(i);
        i += 1;
        parseValue();
        skipWs();
        if (text[i] === ',') { i += 1; continue; }
        if (text[i] === '}') { i += 1; return; }
        fail(i);
      }
    }
    if (ch === '[') {
      i += 1;
      skipWs();
      if (text[i] === ']') { i += 1; return; }
      for (;;) {
        parseValue();
        skipWs();
        if (text[i] === ',') { i += 1; continue; }
        if (text[i] === ']') { i += 1; return; }
        fail(i);
      }
    }
    if (ch === '"') { parseString(); return; }
    if (ch === '-' || /[0-9]/.test(ch)) { parseNumber(); return; }
    if (ch === 't') { parseLiteral('true'); return; }
    if (ch === 'f') { parseLiteral('false'); return; }
    if (ch === 'n') { parseLiteral('null'); return; }
    fail(i);
  };
  parseValue();
  skipWs();
  if (i < text.length) fail(i);
  return -1;
}

/* Parse JSON and, on failure, report the exact line and column.
   V8's JSON.parse error message sometimes carries "at position N"
   or "(line X column Y)"; when it carries neither, the scanner
   above finds the first bad token. */
export function validateJson(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (err) {
    let pos = 0;
    let line = 0;
    let column = 0;
    const posMatch = /at position (\d+)/.exec(err.message || '');
    const lcMatch = /\(line (\d+) column (\d+)\)/.exec(err.message || '');
    if (lcMatch) {
      line = Number(lcMatch[1]);
      column = Number(lcMatch[2]);
    } else {
      if (posMatch) pos = Number(posMatch[1]);
      else {
        try {
          const found = findJsonErrorIndex(text);
          if (found >= 0) pos = found;
        } catch (scanErr) {
          pos = scanErr && typeof scanErr.index === 'number' ? scanErr.index : 0;
        }
      }
      line = 1;
      column = 1;
      for (let i = 0; i < pos && i < text.length; i += 1) {
        if (text[i] === '\n') { line += 1; column = 1; } else { column += 1; }
      }
    }
    return {
      ok: false,
      value: null,
      error: { message: err.message || 'Invalid JSON', position: pos, line, column },
    };
  }
}

function scalarText(value) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/* Convert one JSON value into XML lines for element `name` at the
   given depth. Mutates the shared state (lines, stats, warnings,
   needsXsi). Returns nothing; nothing is emitted for omitted nulls. */
function writeValue(name, value, depth, indent, opts, state) {
  const pad = indent.repeat(depth);
  const childPad = indent.repeat(depth + 1);

  if (value === null) {
    if (opts.nullMode === 'omit') return;
    if (opts.nullMode === 'nil') {
      state.needsXsi = true;
      state.lines.push(pad + '<' + name + ' xsi:nil="true"/>');
    } else {
      state.lines.push(pad + '<' + name + '/>');
    }
    state.stats.elements += 1;
    state.stats.depth = Math.max(state.stats.depth, depth + 1);
    return;
  }

  if (value === undefined) return;

  if (Array.isArray(value)) {
    /* An array under a key repeats the item element name, not the
       key itself: { "book": [a, b] } becomes two <item> elements
       when itemName is "item", or two <book> elements when the
       caller passes the key as the item name. Handled by the
       object writer below; a bare top-level array is wrapped by
       the root writer. */
    value.forEach((entry) => writeValue(name, entry, depth, indent, opts, state));
    return;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const attrParts = [];
    const textParts = [];
    const childKeys = [];
    keys.forEach((key) => {
      if (key.startsWith('@')) {
        const raw = key.slice(1);
        const val = value[key];
        if (val === null || typeof val === 'object') {
          state.warnings.push('Attribute "' + key + '" needs a text value, so it was written as an element instead.');
          childKeys.push(key);
          return;
        }
        const fixed = sanitizeXmlName(raw);
        if (fixed.repaired) {
          state.warnings.push('Attribute name "' + raw + '" is not a valid XML name, so it was written as "' + fixed.name + '".');
        }
        attrParts.push(fixed.name + '="' + escapeXmlAttr(scalarText(val)) + '"');
        state.stats.attributes += 1;
      } else if (key === '#text') {
        textParts.push(escapeXmlText(scalarText(value[key])));
      } else {
        childKeys.push(key);
      }
    });

    const attrs = attrParts.length ? ' ' + attrParts.join(' ') : '';
    state.stats.elements += 1;
    state.stats.depth = Math.max(state.stats.depth, depth + 1);

    if (childKeys.length === 0) {
      if (textParts.length) {
        state.lines.push(pad + '<' + name + attrs + '>' + textParts.join('') + '</' + name + '>');
      } else {
        state.lines.push(pad + '<' + name + attrs + '/>');
      }
      return;
    }

    /* Mixed content (#text plus child elements) is rare; keep the
       text first, then the children, so the output stays readable. */
    state.lines.push(pad + '<' + name + attrs + '>');
    if (textParts.length) state.lines.push(childPad + textParts.join(''));
    childKeys.forEach((key) => {
      writeChild(key, value[key], depth + 1, indent, opts, state);
    });
    state.lines.push(pad + '</' + name + '>');
    return;
  }

  /* Scalar: string, number or boolean. */
  state.stats.elements += 1;
  state.stats.depth = Math.max(state.stats.depth, depth + 1);
  state.lines.push(pad + '<' + name + '>' + escapeXmlText(scalarText(value)) + '</' + name + '>');
}

/* Write a child key of an object: arrays repeat the item element,
   everything else uses the (sanitized) key name. */
function writeChild(key, value, depth, indent, opts, state) {
  const fixed = sanitizeXmlName(key);
  if (fixed.repaired) {
    state.warnings.push('Key "' + key + '" is not a valid XML element name, so it was written as "' + fixed.name + '".');
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => writeValue(opts.itemName, entry, depth, indent, opts, state));
    return;
  }
  writeValue(fixed.name, value, depth, indent, opts, state);
}

/* Convert a parsed JSON value to XML. Returns { xml, stats, warnings }
   where stats is { elements, attributes, depth } and warnings lists
   every key repair or attribute fallback, in order. */
export function jsonToXml(value, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const indent = opts.indent === '\t' ? '\t' : opts.indent === '    ' ? '    ' : '  ';
  const state = {
    lines: [],
    stats: { elements: 0, attributes: 0, depth: 0 },
    warnings: [],
    needsXsi: false,
  };

  const rootFixed = sanitizeXmlName(opts.rootName || 'root');
  if (rootFixed.repaired) {
    state.warnings.push('Root name "' + opts.rootName + '" is not a valid XML element name, so it was written as "' + rootFixed.name + '".');
  }
  const rootName = rootFixed.name;

  if (Array.isArray(value)) {
    state.stats.elements += 1;
    state.stats.depth = Math.max(state.stats.depth, 1);
    state.lines.push('<' + rootName + '>');
    value.forEach((entry) => writeValue(opts.itemName, entry, 1, indent, opts, state));
    state.lines.push('</' + rootName + '>');
  } else if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value);
    const attrParts = [];
    const textParts = [];
    const childKeys = [];
    keys.forEach((key) => {
      if (key.startsWith('@')) {
        const raw = key.slice(1);
        const val = value[key];
        if (val === null || typeof val === 'object') {
          state.warnings.push('Attribute "' + key + '" needs a text value, so it was written as an element instead.');
          childKeys.push(key);
          return;
        }
        const fixed = sanitizeXmlName(raw);
        if (fixed.repaired) {
          state.warnings.push('Attribute name "' + raw + '" is not a valid XML name, so it was written as "' + fixed.name + '".');
        }
        attrParts.push(fixed.name + '="' + escapeXmlAttr(scalarText(val)) + '"');
        state.stats.attributes += 1;
      } else if (key === '#text') {
        textParts.push(escapeXmlText(scalarText(value[key])));
      } else {
        childKeys.push(key);
      }
    });
    const attrs = attrParts.length ? ' ' + attrParts.join(' ') : '';
    state.stats.elements += 1;
    state.stats.depth = Math.max(state.stats.depth, 1);
    if (childKeys.length === 0 && textParts.length === 0) {
      state.lines.push('<' + rootName + attrs + '/>');
    } else if (childKeys.length === 0) {
      state.lines.push('<' + rootName + attrs + '>' + textParts.join('') + '</' + rootName + '>');
    } else {
      state.lines.push('<' + rootName + attrs + '>');
      if (textParts.length) state.lines.push(indent + textParts.join(''));
      childKeys.forEach((key) => {
        writeChild(key, value[key], 1, indent, opts, state);
      });
      state.lines.push('</' + rootName + '>');
    }
  } else if (value === null) {
    if (opts.nullMode === 'omit') {
      state.lines.push('<' + rootName + '/>');
      state.stats.elements += 1;
      state.stats.depth = 1;
    } else if (opts.nullMode === 'nil') {
      state.needsXsi = true;
      state.lines.push('<' + rootName + ' xsi:nil="true"/>');
      state.stats.elements += 1;
      state.stats.depth = 1;
    } else {
      state.lines.push('<' + rootName + '/>');
      state.stats.elements += 1;
      state.stats.depth = 1;
    }
  } else {
    state.stats.elements += 1;
    state.stats.depth = 1;
    state.lines.push('<' + rootName + '>' + escapeXmlText(scalarText(value)) + '</' + rootName + '>');
  }

  /* xsi:nil needs the namespace on the root element. Patch the first
     line only: the root open tag is always lines[0] here. */
  if (state.needsXsi) {
    state.lines[0] = state.lines[0].replace(
      '<' + rootName,
      '<' + rootName + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    );
  }

  const body = state.lines.join('\n');
  const xml = opts.declaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' + body : body;
  return { xml, stats: state.stats, warnings: state.warnings };
}

/* One-call helper for the component: validate, then convert. */
export function convertJsonToXml(text, options = {}) {
  const parsed = validateJson(text);
  if (!parsed.ok) return { ok: false, xml: '', stats: null, warnings: [], error: parsed.error };
  const result = jsonToXml(parsed.value, options);
  return { ok: true, xml: result.xml, stats: result.stats, warnings: result.warnings, error: null };
}
