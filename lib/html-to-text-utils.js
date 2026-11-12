/* Pure HTML-to-text helpers (no DOM, so they run in both browser and
   node). The converter is a small tag-aware scanner plus a tree walk,
   not a blind regex strip: it understands tags (quote-aware, so a >
   inside an attribute value never ends a tag), comments, the doctype,
   and the raw-text elements whose inner text is content, not markup
   (<script>, <style>, <textarea>, <title>). <script>, <style> and the
   whole <head> are dropped, so scripts never run and nothing is
   fetched: the input is treated as inert text throughout.
   Block elements start on new lines, paragraphs and headings are
   separated by a blank line, <br> is a line break, lists get bullet or
   number markers with nesting indents, table rows land on new lines
   with tab-separated cells, and <pre> content keeps its line breaks
   verbatim. Options: show link URLs as "text (url)", keep image alt
   text as [alt text], uppercase headings. HTML entities (named,
   decimal and hex) are decoded. */

export const SAMPLE_HTML =
  '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '<head>\n' +
  '  <meta charset="UTF-8">\n' +
  '  <title>Sample Page</title>\n' +
  '  <style>\n' +
  '    body { font-family: sans-serif; }\n' +
  '  </style>\n' +
  '  <script>console.log("this never runs");</script>\n' +
  '</head>\n' +
  '<body>\n' +
  '  <h1>Welcome to UtilityHub</h1>\n' +
  '  <p>This is <b>bold</b> and <i>italic</i> text with a <a href="https://example.com">link</a>.</p>\n' +
  '  <p>Entities: &amp; &copy; &nbsp; &#169; &#x2014; and a non-breaking&nbsp;space.</p>\n' +
  '  <ul>\n' +
  '    <li>First item</li>\n' +
  '    <li>Second item\n' +
  '      <ul>\n' +
  '        <li>Nested item</li>\n' +
  '      </ul>\n' +
  '    </li>\n' +
  '  </ul>\n' +
  '  <ol>\n' +
  '    <li>Step one</li>\n' +
  '    <li>Step two</li>\n' +
  '  </ol>\n' +
  '  <table>\n' +
  '    <tr><th>Name</th><th>Price</th></tr>\n' +
  '    <tr><td>Widget</td><td>$10</td></tr>\n' +
  '  </table>\n' +
  '  <pre>\n' +
  '  Keep   this\n' +
  '    spacing exactly.\n' +
  '</pre>\n' +
  '  <p><img src="logo.png" alt="Company logo"> with alt text.</p>\n' +
  '</body>\n' +
  '</html>\n';

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

/* Raw-text elements: everything up to the matching close tag is text,
   never markup, and (for script/style/title) never rendered. */
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);

/* Elements whose content is dropped entirely. */
const SKIP_TAGS = new Set(['script', 'style', 'head', 'title', 'noscript', 'template']);

const BLOCK_TAGS = new Set([
  'html', 'body', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'dl', 'dt', 'dd', 'section', 'article', 'aside', 'header',
  'footer', 'nav', 'main', 'figure', 'figcaption', 'blockquote', 'pre',
  'hr', 'form', 'fieldset', 'legend', 'details', 'summary', 'dialog',
  'menu', 'search', 'address', 'table', 'thead', 'tbody', 'tfoot', 'tr',
]);

/* Paragraph-like blocks get a blank line after them. */
const PARA_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'table', 'figure']);

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/* Common named entities. Numeric (decimal and hex) entities are handled
   separately, and &nbsp; maps to a plain space. */
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  bull: '•', middot: '·', times: '×', divide: '÷', plusmn: '±', deg: '°',
  frac12: '½', frac14: '¼', frac34: '¾', euro: '€', pound: '£', yen: '¥',
  cent: '¢', curren: '¤', sect: '§', para: '¶', dagger: '†', Dagger: '‡',
  permil: '‰', prime: '′', Prime: '″', oline: '‾', frasl: '⁄', lowast: '∗',
  sbquo: '‚', bdquo: '„', circ: 'ˆ', tilde: '˜', ensp: ' ', emsp: ' ',
  thinsp: ' ', zwnj: '', zwj: '', lrm: '', rlm: '', shy: '',
  Agrave: 'À', Aacute: 'Á', Acirc: 'Â', Atilde: 'Ã', Auml: 'Ä', Aring: 'Å',
  AElig: 'Æ', Ccedil: 'Ç', Egrave: 'È', Eacute: 'É', Ecirc: 'Ê', Euml: 'Ë',
  Igrave: 'Ì', Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï', Ntilde: 'Ñ', Ograve: 'Ò',
  Oacute: 'Ó', Ocirc: 'Ô', Otilde: 'Õ', Ouml: 'Ö', Oslash: 'Ø', Ugrave: 'Ù',
  Uacute: 'Ú', Ucirc: 'Û', Uuml: 'Ü', Yacute: 'Ý', THORN: 'Þ', szlig: 'ß',
  agrave: 'à', aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å',
  aelig: 'æ', ccedil: 'ç', egrave: 'è', eacute: 'é', ecirc: 'ê', euml: 'ë',
  igrave: 'ì', iacute: 'í', icirc: 'î', iuml: 'ï', ntilde: 'ñ', ograve: 'ò',
  oacute: 'ó', ocirc: 'ô', otilde: 'õ', ouml: 'ö', oslash: 'ø', ugrave: 'ù',
  uacute: 'ú', ucirc: 'û', uuml: 'ü', yacute: 'ý', thorn: 'þ', yuml: 'ÿ',
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε', Zeta: 'Ζ',
  Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ',
  Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ',
  Tau: 'Τ', Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
  eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', rho: 'ρ', sigmaf: 'ς',
  sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ',
  omega: 'ω', thetasym: 'ϑ', upsih: 'ϒ', piv: 'ϖ', infin: '∞', ne: '≠',
  le: '≤', ge: '≥', minus: '−', lowast2: '∗', radic: '√', prop: '∝',
  empty: '∅', isin: '∈', notin: '∉', ni: '∋', prod: '∏', sum: '∑',
  and: '∧', or: '∨', cap: '∩', cup: '∪', int: '∫', there4: '∴',
  sim: '∼', cong: '≅', asymp: '≈', equiv: '≡', sub: '⊂', sup: '⊃',
  nsub: '⊄', sube: '⊆', supe: '⊇', oplus: '⊕', otimes: '⊗', perp: '⊥',
  sdot: '⋅', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋',
  lang: '〈', rang: '〉', loz: '◊', spades: '♠', clubs: '♣', hearts: '♥',
  diams: '♦', OElig: 'Œ', oelig: 'œ', Scaron: 'Š', scaron: 'š', Yuml: 'Ÿ',
  fnof: 'ƒ', harr: '↔', larr: '←', uarr: '↑', rarr: '→', darr: '↓',
  crarr: '↵',
};

/* Decode &name; &#123; and &#x1F600; in a text run. Unknown entities are
   left as-is rather than silently dropped. */
export function decodeEntities(text) {
  return String(text).replace(/&(#x[0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g, (m, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      if (Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff) {
        try { return String.fromCodePoint(cp); } catch { return m; }
      }
      return m;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body)
      ? NAMED_ENTITIES[body]
      : m;
  });
}

/* Parse an attribute string into a lowercase-keyed map. Quote-aware so
   a > inside a value never ends the tag. */
function parseAttrs(s) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] !== undefined ? m[2]
      : m[3] !== undefined ? m[3]
      : m[4] !== undefined ? m[4] : '';
  }
  return attrs;
}

/* Tokenize HTML into a flat token list. Text tokens are entity-decoded
   here so the tree walk works on plain text. */
function tokenize(html) {
  const tokens = [];
  const src = String(html || '');
  let i = 0;
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) {
      if (i < n) tokens.push({ type: 'text', value: decodeEntities(src.slice(i)) });
      break;
    }
    if (lt > i) tokens.push({ type: 'text', value: decodeEntities(src.slice(i, lt)) });
    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<![CDATA[', lt)) {
      const end = src.indexOf(']]>', lt + 9);
      tokens.push({ type: 'text', value: end === -1 ? src.slice(lt + 9) : src.slice(lt + 9, end) });
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<!', lt) || src.startsWith('<?', lt)) {
      /* Doctype, processing instructions and other declarations. */
      const end = src.indexOf('>', lt + 2);
      i = end === -1 ? n : end + 1;
      continue;
    }
    /* Find the tag end, skipping > inside single or double quotes. */
    let j = lt + 1;
    let quote = null;
    while (j < n) {
      const c = src[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
      j += 1;
    }
    if (j >= n) {
      /* Unterminated tag: treat the rest as text. */
      tokens.push({ type: 'text', value: decodeEntities(src.slice(lt)) });
      break;
    }
    const inner = src.slice(lt + 1, j);
    i = j + 1;
    if (inner.startsWith('/')) {
      const name = inner.slice(1).trim().split(/\s+/)[0].toLowerCase();
      if (name) tokens.push({ type: 'close', name });
      continue;
    }
    const selfClosing = inner.endsWith('/');
    const body = selfClosing ? inner.slice(0, -1) : inner;
    const m = body.match(/^\s*([A-Za-z][A-Za-z0-9-]*)/);
    if (!m) continue;
    const name = m[1].toLowerCase();
    const attrs = parseAttrs(body.slice(m[0].length));
    if (RAW_TAGS.has(name) && !selfClosing) {
      /* Raw-text element: swallow everything up to its close tag. */
      const closeRe = new RegExp(`</${name}\\s*>`, 'i');
      const rest = src.slice(i);
      const cm = closeRe.exec(rest);
      const raw = cm ? rest.slice(0, cm.index) : rest;
      tokens.push({ type: 'open', name, attrs });
      if (raw) tokens.push({ type: 'text', value: decodeEntities(raw) });
      tokens.push({ type: 'close', name });
      i = cm ? i + cm.index + cm[0].length : n;
      continue;
    }
    tokens.push({ type: 'open', name, attrs, selfClosing });
  }
  return tokens;
}

/* Build a small tree from the token list. <p> and <li> close implicitly
   the way browsers do, so unclosed markup still renders sensibly. */
function buildTree(tokens) {
  const root = { name: '#root', children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  for (const tok of tokens) {
    if (tok.type === 'text') {
      if (tok.value) top().children.push({ name: '#text', value: tok.value });
    } else if (tok.type === 'open') {
      if (tok.name === 'p' && top().name === 'p') stack.pop();
      if (tok.name === 'li' && top().name === 'li') stack.pop();
      const node = { name: tok.name, attrs: tok.attrs || {}, children: [] };
      top().children.push(node);
      if (!tok.selfClosing && !VOID_TAGS.has(tok.name)) stack.push(node);
    } else if (tok.type === 'close') {
      for (let k = stack.length - 1; k >= 1; k -= 1) {
        if (stack[k].name === tok.name) { stack.length = k; break; }
      }
    }
  }
  return root;
}

/* Render the tree to plain text. Output is a list of lines; inline text
   accumulates in the current line, blocks flush it. */
function render(root, opts) {
  const lines = [];
  let cur = '';

  const flush = () => {
    const line = cur.replace(/[ \t]+$/g, '');
    if (line !== '') lines.push(line);
    cur = '';
  };
  const blank = () => {
    flush();
    if (lines.length && lines[lines.length - 1] !== '') lines.push('');
  };
  const appendInline = (text) => {
    const collapsed = String(text).replace(/\s+/g, ' ');
    if (!collapsed.trim()) {
      if (cur && !/[ \t]$/.test(cur)) cur += ' ';
      return;
    }
    const trimmed = collapsed.replace(/^\s+/, '');
    /* No separator space before trailing punctuation, so a full stop
       after a link or a bold span stays attached to the word. */
    if (cur && !/[ \t]$/.test(cur) && !/^[.,;:!?%)\]}]/.test(trimmed)) cur += ' ';
    cur += trimmed;
  };
  const appendPre = (text) => {
    /* Verbatim: split on newlines, keep every line including blanks. */
    const parts = String(text).split('\n');
    parts.forEach((part, idx) => {
      if (idx === 0) {
        cur += part.replace(/\r$/, '');
      } else {
        lines.push(cur.replace(/[ \t]+$/g, ''));
        cur = part.replace(/\r$/, '');
      }
    });
  };

  /* Render an element's children into a single inline string (used for
     table cells and list items). */
  const inlineText = (node) => {
    const saved = { lines: lines.length, cur };
    const keepLines = lines.splice(0);
    const keepCur = cur;
    cur = '';
    lines.length = 0;
    walkChildren(node, { listDepth: 0, listStack: [], inPre: false });
    const text = [...lines, cur].filter((l) => l !== '').join(' ').replace(/\s+/g, ' ').trim();
    lines.length = 0;
    lines.push(...keepLines);
    cur = keepCur;
    void saved;
    return text;
  };

  function walkChildren(node, ctx) {
    for (const child of node.children || []) walk(child, ctx);
  }

  function walk(node, ctx) {
    if (node.name === '#text') {
      if (ctx.inPre) appendPre(node.value);
      else appendInline(node.value);
      return;
    }
    const name = node.name;
    if (SKIP_TAGS.has(name)) return;
    if (name === 'br') { flush(); return; }
    if (name === 'hr') { flush(); lines.push('---'); return; }
    if (name === 'img') {
      if (opts.keepAltText && node.attrs.alt) appendInline('[' + node.attrs.alt.trim() + ']');
      return;
    }
    if (name === 'a') {
      const before = cur;
      walkChildren(node, ctx);
      if (opts.showLinkUrls && node.attrs.href) {
        const href = node.attrs.href.trim();
        if (href) appendInline('(' + href + ')');
      }
      void before;
      return;
    }
    if (name === 'li') {
      flush();
      /* The enclosing list is already on the stack, so depth 0 is the
         top level: no indent there, 2 spaces per nesting level. */
      const depth = Math.max(0, ctx.listStack.length - 1);
      const indent = '  '.repeat(depth);
      const parent = ctx.listStack[ctx.listStack.length - 1];
      let marker;
      if (parent && parent.type === 'ol') {
        parent.count += 1;
        marker = parent.count + '. ';
      } else {
        marker = '• ';
      }
      cur = indent + marker;
      walkChildren(node, ctx);
      flush();
      return;
    }
    if (name === 'ul' || name === 'ol') {
      flush();
      ctx.listStack.push({ type: name, count: 0 });
      walkChildren(node, ctx);
      ctx.listStack.pop();
      flush();
      return;
    }
    if (name === 'tr') {
      flush();
      const cells = [];
      for (const cell of node.children || []) {
        if (cell.name === 'td' || cell.name === 'th') cells.push(inlineText(cell));
      }
      if (cells.length) lines.push(cells.join('\t'));
      return;
    }
    if (name === 'table') {
      flush();
      walkChildren(node, ctx);
      blank();
      return;
    }
    if (name === 'pre') {
      flush();
      walkChildren(node, { ...ctx, inPre: true });
      flush();
      blank();
      return;
    }
    if (BLOCK_TAGS.has(name)) {
      flush();
      if (HEADING_TAGS.has(name) && opts.uppercaseHeadings) {
        const savedLines = lines.splice(0);
        const savedCur = cur;
        cur = '';
        lines.length = 0;
        walkChildren(node, ctx);
        const text = [...lines, cur].filter((l) => l !== '').join(' ').replace(/\s+/g, ' ').trim().toUpperCase();
        lines.length = 0;
        lines.push(...savedLines);
        cur = savedCur;
        if (text) { cur = text; flush(); }
      } else {
        walkChildren(node, ctx);
        flush();
      }
      if (PARA_TAGS.has(name)) blank();
      return;
    }
    /* Inline element: just render its children in place. */
    walkChildren(node, ctx);
  }

  walkChildren(root, { listDepth: 0, listStack: [], inPre: false });
  flush();
  /* Collapse 3+ blank lines to one, trim leading/trailing blanks. */
  const out = [];
  let blanks = 0;
  for (const line of lines) {
    if (line === '') {
      blanks += 1;
      if (blanks <= 1 && out.length) out.push('');
    } else {
      blanks = 0;
      out.push(line);
    }
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

export function htmlToText(html, options = {}) {
  const opts = {
    showLinkUrls: options.showLinkUrls !== false,
    keepAltText: options.keepAltText !== false,
    uppercaseHeadings: !!options.uppercaseHeadings,
  };
  if (!html || !String(html).trim()) return '';
  return render(buildTree(tokenize(html)), opts);
}

/* Live counts for the tool UI. tagsRemoved counts opening/closing tags
   plus comments and declarations the scanner consumed. */
export function countHtmlToText(input, output) {
  const src = String(input || '');
  const tags = (src.match(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/?[A-Za-z][^>]*>/g) || []).length;
  const out = String(output || '');
  const words = out.trim() ? out.trim().split(/\s+/).length : 0;
  return {
    chars: out.length,
    words,
    lines: out ? out.split('\n').length : 0,
    tagsRemoved: tags,
  };
}
