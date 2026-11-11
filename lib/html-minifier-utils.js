/* Pure HTML minify / beautify helpers (no DOM, so they run in both browser
   and node). The minifier is a small tag-aware scanner, not a blind text
   replacer: it understands tags (quote-aware, so a > inside an attribute
   value never ends a tag), comments, the doctype, CDATA, and the four
   raw-content elements whose inner text is content, not markup
   (<pre>, <textarea>, <script>, <style>). Whitespace between two block
   tags is dropped, whitespace between inline elements collapses to one
   space so words never join, and text next to a block tag is trimmed.
   Optional end tags are only dropped where the HTML spec allows it
   (</html>, </head>, </body> always; </li>, </p>, </td>, </tr>, </option>
   and friends only when the next tag makes them redundant). Attribute
   quotes are only removed when the value is safe unquoted (letters,
   digits, - . _ : and no slash, so URLs keep their quotes). Inline CSS
   and JavaScript are preserved verbatim: shrink them first with the CSS
   and JavaScript minifiers, then paste the result back. */

export const SAMPLE_HTML =
  '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '<head>\n' +
  '  <meta charset="UTF-8">\n' +
  '  <title>Sample Page</title>\n' +
  '  <!-- This comment will be removed -->\n' +
  '  <style>\n' +
  '    body { font-family: sans-serif; }\n' +
  '  </style>\n' +
  '</head>\n' +
  '<body>\n' +
  '  <main class="page">\n' +
  '    <h1>Hello, world</h1>\n' +
  '    <p>This is <b>bold</b> and <i>italic</i> text with a <a href="https://example.com">link</a>.</p>\n' +
  '    <ul>\n' +
  '      <li>First item</li>\n' +
  '      <li>Second item</li>\n' +
  '    </ul>\n' +
  '    <pre>\n' +
  '  Keep   this\n' +
  '    spacing exactly.\n' +
  '</pre>\n' +
  '    <script>\n' +
  '      // This script stays untouched\n' +
  '      const x = 1 < 2;\n' +
  '      console.log("Hello <b>world</b>");\n' +
  '    </script>\n' +
  '  </main>\n' +
  '</body>\n' +
  '</html>\n';

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

const BLOCK_TAGS = new Set([
  'html', 'head', 'body', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot',
  'tr', 'td', 'th', 'caption', 'colgroup', 'col', 'section', 'article',
  'aside', 'header', 'footer', 'nav', 'main', 'figure', 'figcaption',
  'blockquote', 'pre', 'hr', 'form', 'fieldset', 'legend', 'details',
  'summary', 'dialog', 'menu', 'search', 'address',
]);

/* Head and metadata elements: whitespace around them never renders, so a
   text node next to one is trimmed like next to a block tag. */
const HEAD_TAGS = new Set([
  'title', 'meta', 'link', 'base', 'script', 'style', 'noscript', 'template',
  'option', 'optgroup',
]);

const RAW_TAGS = new Set(['pre', 'textarea', 'script', 'style']);

const BOOLEAN_ATTRS = new Set([
  'checked', 'selected', 'disabled', 'readonly', 'required', 'multiple',
  'async', 'defer', 'autoplay', 'controls', 'loop', 'muted', 'open',
  'hidden', 'autofocus', 'novalidate', 'formnovalidate', 'reversed',
  'scoped', 'itemscope', 'playsinline', 'default', 'ismap', 'truespeed',
]);

/* A value is safe unquoted when it has no whitespace and none of
   " ' ` = < > or / (a slash would end the value early in a URL). */
const SAFE_UNQUOTED = /^[A-Za-z0-9\-._:]+$/;

/* Scan a tag starting at i (input[i] === '<'), honouring quoted attribute
   values, and return the index just past the closing '>'. */
function findTagEnd(input, i) {
  let quote = '';
  for (let j = i + 1; j < input.length; j += 1) {
    const c = input[j];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j + 1;
    }
  }
  return input.length;
}

/* Split the input into segments: 'doctype', 'comment' (with a
   .conditional flag for <!--[if ...]>...<![endif]-->), 'cdata', 'tag',
   'text', or 'raw' (a whole <pre>/<textarea>/<script>/<style> element,
   tags and content together, preserved verbatim). */
export function scanHtml(input) {
  const segments = [];
  let buf = '';
  let i = 0;
  const flushText = () => {
    if (buf) segments.push({ type: 'text', text: buf });
    buf = '';
  };
  while (i < input.length) {
    if (input.startsWith('<!--', i)) {
      flushText();
      const end = input.indexOf('-->', i + 4);
      const text = end === -1 ? input.slice(i) : input.slice(i, end + 3);
      const conditional = /^\s*\[if[^\]]*\]/i.test(text.slice(4)) ||
        /<!\[endif\]/i.test(text) || /^\s*>/.test(text.slice(4));
      segments.push({ type: 'comment', text, conditional });
      i = end === -1 ? input.length : end + 3;
    } else if (input.slice(i, i + 9).toLowerCase() === '<!doctype') {
      flushText();
      const end = findTagEnd(input, i);
      segments.push({ type: 'doctype', text: input.slice(i, end) });
      i = end;
    } else if (input.startsWith('<![CDATA[', i)) {
      flushText();
      const end = input.indexOf(']]>', i + 9);
      const text = end === -1 ? input.slice(i) : input.slice(i, end + 3);
      segments.push({ type: 'cdata', text });
      i = end === -1 ? input.length : end + 3;
    } else if (input[i] === '<' && /[A-Za-z/!?]/.test(input[i + 1] || '')) {
      const m = input.slice(i).match(/^<\/?([A-Za-z][A-Za-z0-9-]*)/);
      const name = m ? m[1].toLowerCase() : '';
      if (name && RAW_TAGS.has(name) && input[i + 1] !== '/') {
        flushText();
        const openEnd = findTagEnd(input, i);
        const closeRe = new RegExp(`</${name}\\s*>`, 'i');
        const rest = input.slice(openEnd);
        const cm = rest.match(closeRe);
        if (cm) {
          segments.push({ type: 'raw', text: input.slice(i, openEnd + cm.index + cm[0].length), tagName: name });
          i = openEnd + cm.index + cm[0].length;
        } else {
          /* Unclosed raw element: the rest of the file is its content. */
          segments.push({ type: 'raw', text: input.slice(i), tagName: name });
          i = input.length;
        }
      } else {
        flushText();
        const end = findTagEnd(input, i);
        const tagText = input.slice(i, end);
        segments.push({
          type: 'tag',
          text: tagText,
          tagName: name,
          isEnd: tagText.startsWith('</'),
          selfClosing: /\/\s*>$/.test(tagText),
        });
        i = end;
      }
    } else {
      buf += input[i];
      i += 1;
    }
  }
  flushText();
  return segments;
}

/* Parse one tag's attributes (quote-aware) and rebuild it with collapsed
   whitespace, optional quote removal and boolean shortening. Tag names
   and attribute values are never case-folded: case matters in SVG and
   foreign content. */
export function processTag(tagText, opts = {}) {
  const o = {
    removeAttributeQuotes: opts.removeAttributeQuotes !== false,
    shortenBooleans: opts.shortenBooleans !== false,
  };
  const isEnd = tagText.startsWith('</');
  const m = tagText.match(/^<\/?([^\s/>]+)/);
  if (!m) return tagText;
  const name = m[1];
  if (isEnd) return `</${name}>`;
  let rest = tagText.slice(m[0].length);
  const selfClosing = /\/\s*>$/.test(rest);
  if (selfClosing) rest = rest.replace(/\/\s*>$/, '');
  else rest = rest.replace(/\s*>$/, '');
  const attrs = [];
  let j = 0;
  while (j < rest.length) {
    while (j < rest.length && /\s/.test(rest[j])) j += 1;
    if (j >= rest.length) break;
    const nameStart = j;
    while (j < rest.length && !/[\s=/>]/.test(rest[j])) j += 1;
    const attrName = rest.slice(nameStart, j);
    if (!attrName) { j += 1; continue; }
    while (j < rest.length && /\s/.test(rest[j])) j += 1;
    if (rest[j] !== '=') {
      attrs.push(attrName);
      continue;
    }
    j += 1;
    while (j < rest.length && /\s/.test(rest[j])) j += 1;
    let value = '';
    let quoted = false;
    if (rest[j] === '"' || rest[j] === "'") {
      quoted = true;
      const q = rest[j];
      j += 1;
      const start = j;
      while (j < rest.length && rest[j] !== q) j += 1;
      value = rest.slice(start, j);
      if (rest[j] === q) j += 1;
    } else {
      const start = j;
      while (j < rest.length && !/\s/.test(rest[j])) j += 1;
      value = rest.slice(start, j);
    }
    if (o.shortenBooleans && BOOLEAN_ATTRS.has(attrName.toLowerCase()) &&
      (value === '' || value.toLowerCase() === attrName.toLowerCase())) {
      attrs.push(attrName);
    } else if (o.removeAttributeQuotes && SAFE_UNQUOTED.test(value)) {
      attrs.push(`${attrName}=${value}`);
    } else if (quoted || value === '') {
      attrs.push(`${attrName}="${value}"`);
    } else {
      attrs.push(`${attrName}="${value}"`);
    }
  }
  return `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}${selfClosing ? ' /' : ''}>`;
}

/* A segment whose neighbouring whitespace never renders: block tags,
   head/metadata tags, raw elements, the doctype. */
function isTrimmable(seg) {
  if (!seg) return true;
  if (seg.type === 'doctype' || seg.type === 'raw') return true;
  if (seg.type === 'tag') return BLOCK_TAGS.has(seg.tagName) || HEAD_TAGS.has(seg.tagName);
  return false;
}

/* Optional end tags that are always safe to drop, and the contextual
   ones that are safe only when the next kept segment is one of the
   listed tags. */
const ALWAYS_OPTIONAL_END = new Set(['html', 'head', 'body']);
const CONTEXT_OPTIONAL_END = {
  p: { start: BLOCK_TAGS, end: '*' },
  li: { start: new Set(['li']), end: new Set(['ul', 'ol']) },
  dt: { start: new Set(['dt', 'dd']), end: new Set(['dl']) },
  dd: { start: new Set(['dt', 'dd']), end: new Set(['dl']) },
  td: { start: new Set(['td', 'th']), end: new Set(['tr']) },
  th: { start: new Set(['td', 'th']), end: new Set(['tr']) },
  tr: { start: new Set(['tr']), end: new Set(['table', 'tbody', 'thead', 'tfoot']) },
  option: { start: new Set(['option', 'optgroup']), end: new Set(['select']) },
  thead: { start: new Set([]), end: new Set(['tbody', 'tfoot']) },
  tbody: { start: new Set(['tbody', 'tfoot']), end: new Set(['table']) },
  tfoot: { start: new Set([]), end: new Set(['table']) },
  colgroup: { start: new Set([]), end: new Set(['table']) },
};

export function minifyHtml(input, opts = {}) {
  const o = {
    removeComments: opts.removeComments !== false,
    collapseWhitespace: opts.collapseWhitespace !== false,
    removeOptionalTags: opts.removeOptionalTags !== false,
    removeAttributeQuotes: opts.removeAttributeQuotes !== false,
    shortenBooleans: opts.shortenBooleans !== false,
  };
  const raw = scanHtml(input);
  /* Pass 1: drop comments, process tags, normalise the doctype. */
  const kept = [];
  for (const seg of raw) {
    if (seg.type === 'comment') {
      if (!o.removeComments || seg.conditional) kept.push(seg);
    } else if (seg.type === 'tag') {
      kept.push({ ...seg, text: processTag(seg.text, o) });
    } else if (seg.type === 'doctype') {
      kept.push({ ...seg, text: seg.text.replace(/\s+/g, ' ').trim() });
    } else {
      kept.push(seg);
    }
  }
  /* Pass 2: drop optional end tags. Contextual ones look at the next
     significant segment, skipping whitespace-only text (pass 3 drops it
     anyway) and comments already removed above. */
  const nextSignificant = (from) => {
    for (let k = from; k < kept.length; k += 1) {
      const s = kept[k];
      if (s.type === 'text' && /^\s*$/.test(s.text)) continue;
      return s;
    }
    return null;
  };
  const filtered = [];
  for (let idx = 0; idx < kept.length; idx += 1) {
    const seg = kept[idx];
    if (o.removeOptionalTags && seg.type === 'tag' && seg.isEnd) {
      if (ALWAYS_OPTIONAL_END.has(seg.tagName)) continue;
      const rule = CONTEXT_OPTIONAL_END[seg.tagName];
      if (rule) {
        const next = nextSignificant(idx + 1);
        if (next && next.type === 'tag') {
          if (!next.isEnd && rule.start.has(next.tagName)) continue;
          if (next.isEnd && (rule.end === '*' || rule.end.has(next.tagName))) continue;
        }
        if (!next) continue;
      }
    }
    filtered.push(seg);
  }
  /* Pass 3: collapse and trim text nodes. Neighbours are the nearest
     significant segment, skipping whitespace-only text (several of
     those can sit side by side after dropped end tags, and each one
     alone would look like a real neighbour). */
  const prevSig = (from) => {
    for (let k = from; k >= 0; k -= 1) {
      const s = filtered[k];
      if (s.type === 'text' && /^\s*$/.test(s.text)) continue;
      return s;
    }
    return null;
  };
  const nextSig = (from) => {
    for (let k = from; k < filtered.length; k += 1) {
      const s = filtered[k];
      if (s.type === 'text' && /^\s*$/.test(s.text)) continue;
      return s;
    }
    return null;
  };
  const out = [];
  for (let idx = 0; idx < filtered.length; idx += 1) {
    const seg = filtered[idx];
    if (seg.type !== 'text') {
      out.push(seg.text);
      continue;
    }
    let text = seg.text;
    if (o.collapseWhitespace) {
      text = text.replace(/\s+/g, ' ');
      const prev = prevSig(idx - 1);
      const next = nextSig(idx + 1);
      if (!prev || isTrimmable(prev)) text = text.replace(/^ /, '');
      if (!next || isTrimmable(next)) text = text.replace(/ $/, '');
    }
    if (text) out.push(text);
  }
  return out.join('');
}

/* Light indent-based beautifier: block tags get their own line at the
   current depth, inline tags and text share a line, raw elements
   (<pre>, <script>, <style>, <textarea>) are emitted verbatim on their
   own lines so their content is never re-indented. End tags dropped by
   the minifier (</head>, </p>, </li> ...) are handled by an implicit
   close table, so the indent depth never drifts. */
export function beautifyHtml(input, indent = '  ') {
  const segs = scanHtml(input);
  const lines = [];
  const stack = [];
  let line = '';
  const flushLine = () => {
    const t = line.trim();
    if (t) lines.push(indent.repeat(stack.length) + t);
    line = '';
  };
  const blockish = (name) => BLOCK_TAGS.has(name) || name === 'meta' || name === 'link' || name === 'base';
  /* Does opening `incoming` implicitly close the element on top of the
     stack? Mirrors the optional-end-tag rules the minifier uses. */
  const implicitlyCloses = (incoming, top) => {
    if (top === 'head' && incoming !== 'head' && !HEAD_TAGS.has(incoming)) return true;
    if (top === 'p' && BLOCK_TAGS.has(incoming)) return true;
    if (top === 'li' && incoming === 'li') return true;
    if ((top === 'dt' || top === 'dd') && (incoming === 'dt' || incoming === 'dd')) return true;
    if (top === 'tr' && incoming === 'tr') return true;
    if ((top === 'td' || top === 'th') && (incoming === 'td' || incoming === 'th' || incoming === 'tr')) return true;
    if (top === 'option' && (incoming === 'option' || incoming === 'optgroup')) return true;
    if (top === 'optgroup' && incoming === 'optgroup') return true;
    if ((top === 'thead' || top === 'tbody') && (incoming === 'tbody' || incoming === 'tfoot')) return true;
    return false;
  };
  for (const seg of segs) {
    if (seg.type === 'doctype' || seg.type === 'comment' || seg.type === 'cdata') {
      flushLine();
      lines.push(indent.repeat(stack.length) + seg.text.trim());
    } else if (seg.type === 'raw') {
      flushLine();
      const parts = seg.text.split('\n');
      lines.push(indent.repeat(stack.length) + parts[0].trimEnd());
      /* Inner lines stay byte-for-byte verbatim (a closing </pre> or
         </style> line keeps its original indent): re-indenting them
         would change the raw content, so minify(beautify(x)) would no
         longer equal minify(x). */
      for (let k = 1; k < parts.length; k += 1) lines.push(parts[k].replace(/\s+$/, ''));
    } else if (seg.type === 'tag') {
      const name = seg.tagName;
      const isBlock = blockish(name);
      if (seg.isEnd) {
        if (isBlock) {
          flushLine();
          /* Pop until the matching open tag: parents the minifier
             closed implicitly (</head>, </p> ...) are skipped. */
          while (stack.length && stack[stack.length - 1] !== name) stack.pop();
          if (stack.length) stack.pop();
          lines.push(indent.repeat(stack.length) + seg.text);
        } else {
          line += seg.text;
        }
      } else if (VOID_TAGS.has(name) || seg.selfClosing) {
        if (isBlock) {
          flushLine();
          lines.push(indent.repeat(stack.length) + seg.text);
        } else {
          line += seg.text;
        }
      } else if (isBlock) {
        flushLine();
        while (stack.length && implicitlyCloses(name, stack[stack.length - 1])) stack.pop();
        lines.push(indent.repeat(stack.length) + seg.text);
        stack.push(name);
      } else {
        line += seg.text;
      }
    } else {
      /* Text keeps its own spacing (collapsed to single spaces) so
         words around inline tags stay separated exactly as typed. */
      let text = seg.text.replace(/\s+/g, ' ');
      if (!line) text = text.replace(/^ /, '');
      line += text;
    }
  }
  flushLine();
  return lines.join('\n').trim() + '\n';
}

/* Count lines, tags and comments (code segments only for the counts, so
   strings inside <script> never inflate them). */
export function countHtml(input) {
  const segments = scanHtml(input);
  let tags = 0;
  let comments = 0;
  for (const seg of segments) {
    if (seg.type === 'tag') tags += 1;
    else if (seg.type === 'comment') comments += 1;
    else if (seg.type === 'raw') tags += 2;
  }
  const lines = input ? input.split('\n').length : 0;
  return { lines, tags, comments, chars: input.length };
}

/* Percentage saved by minifying, as a whole-number string. */
export function savedPercent(original, minified) {
  if (!original) return '0';
  return String(Math.max(0, Math.round((1 - minified.length / original.length) * 100)));
}
