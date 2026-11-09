/* Pure CSS minify / beautify helpers (no DOM, so they run in both browser
   and node). The minifier is a small string-aware scanner: it understands
   quoted strings, url() values and comments, so it never strips a space
   that changes meaning (calc() keeps its spaces, content strings keep
   theirs, and /*! license comments can be kept on request). */

export const SAMPLE_CSS =
  '/* Main layout for the blog cards */\n.card {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 24px 16px;\n  margin: 0px auto;\n  background-color: #ffffff;\n  border: 1px solid #e5e7eb;\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n}\n\n.card h2 {\n  margin: 0px;\n  font-size: 20px;\n  line-height: 1.4;\n  color: #112233;\n}\n\n.card p {\n  margin: 0px;\n  color: #6b7280;\n}\n\n/* Buttons */\n.btn {\n  padding: 10px 20px;\n  background: #2563eb;\n  color: #ffffff;\n  border-radius: 8px;\n}\n\n.btn:hover {\n  background: #1d4ed8;\n}\n\n@media (max-width: 640px) {\n  .card {\n    padding: 16px 12px;\n    width: calc(100% - 32px);\n  }\n}\n\n.empty-rule {\n}';

const ZERO_UNITS = ['px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'pt', 'pc', 'in', 'cm', 'mm', 'ex', 'ch', 's', 'ms', 'deg', 'fr'];

/* Scan the input once, returning segments of type 'code' or 'string' so
   callers never transform inside quotes. Comments are returned as 'comment'
   segments (including their delimiters) when keepComments is true. */
function scanCss(input, keepComments) {
  const segments = [];
  let buf = '';
  let type = 'code';
  let quote = '';
  let i = 0;
  const flush = (t) => {
    if (buf) segments.push({ type: t, text: buf });
    buf = '';
  };
  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1] || '';
    if (type === 'code') {
      if (ch === '"' || ch === "'") {
        flush('code');
        type = 'string';
        quote = ch;
        buf = ch;
        i += 1;
      } else if (ch === '/' && next === '*') {
        flush('code');
        const end = input.indexOf('*/', i + 2);
        const comment = end === -1 ? input.slice(i) : input.slice(i, end + 2);
        if (keepComments) segments.push({ type: 'comment', text: comment });
        i = end === -1 ? input.length : end + 2;
      } else {
        buf += ch;
        i += 1;
      }
    } else {
      buf += ch;
      if (ch === '\\' && i + 1 < input.length) {
        buf += input[i + 1];
        i += 2;
      } else if (ch === quote) {
        i += 1;
        flush('string');
        type = 'code';
      } else {
        i += 1;
      }
    }
  }
  flush(type);
  return segments;
}

function isHexDigit(c) {
  return /[0-9a-fA-F]/.test(c);
}

/* Shorten #rrggbb to #rgb when each pair matches, and 0px/0em/... to 0.
   Only applied to code segments, never inside strings. */
function optimizeCode(code, opts) {
  let out = code;
  if (opts.shortenHex) {
    out = out.replace(/#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, (m, hex) => {
      if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
        return '#' + hex[0] + hex[2] + hex[4];
      }
      return m;
    });
  }
  if (opts.zeroUnits) {
    const units = ZERO_UNITS.join('|');
    out = out.replace(new RegExp('(^|[:\\s,\\(\\-])0(?:' + units + ')(?![0-9a-zA-Z])', 'g'), '$10');
  }
  return out;
}

/* Collapse whitespace in code segments: strip spaces around punctuation,
   collapse runs to one space, but keep spaces around + and - inside
   parentheses (calc() needs them) and never touch strings. */
function collapseCode(code) {
  let out = '';
  let depth = 0;
  let pendingSpace = false;
  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
      pendingSpace = true;
      continue;
    }
    if (pendingSpace) {
      const prev = out[out.length - 1] || '';
      /* Inside parens, + and - are calc() operators: their spaces are
         required. Everywhere else, spaces around punctuation go. */
      const calcOp = depth > 0 && (ch === '+' || ch === '-' || prev === '+' || prev === '-');
      let keep = false;
      if (calcOp) {
        keep = prev !== '(' && ch !== ')';
      } else if (prev && !'{};:,>(+~=/'.includes(prev) && !'};:,)<+~={/>'.includes(ch)) {
        keep = true;
      }
      if (keep) out += ' ';
      pendingSpace = false;
    }
    out += ch;
  }
  return out;
}

function dropEmptyRules(css) {
  let prev = '';
  let cur = css;
  while (cur !== prev) {
    prev = cur;
    cur = cur.replace(/[^{};]+\{\}/g, '');
  }
  return cur;
}

/* Minify CSS. Options: removeComments (default true), keepImportant
   (keep /*! ... *\/ comments, default true), shortenHex (default true),
   zeroUnits (default true), dropEmpty (default true). Returns the
   minified string. */
export function minifyCss(input, opts = {}) {
  const o = {
    removeComments: opts.removeComments !== false,
    keepImportant: opts.keepImportant !== false,
    shortenHex: opts.shortenHex !== false,
    zeroUnits: opts.zeroUnits !== false,
    dropEmpty: opts.dropEmpty !== false,
  };
  const segments = scanCss(input, !o.removeComments || o.keepImportant);
  let out = '';
  for (const seg of segments) {
    if (seg.type === 'comment') {
      if (!o.removeComments || (o.keepImportant && seg.text.startsWith('/*!'))) {
        out += seg.text;
      }
    } else if (seg.type === 'string') {
      out += seg.text;
    } else {
      out += collapseCode(optimizeCode(seg.text, o));
    }
  }
  out = out.replace(/;}/g, '}');
  if (o.dropEmpty) out = dropEmptyRules(out);
  return out.trim();
}

/* Beautify CSS: one declaration per line, 2-space indent per brace depth,
   a space after the colon in declarations (but not in selectors like
   :hover, media queries, or url(http://...) values).
   Strings and comments pass through untouched. */
export function beautifyCss(input, indent = '  ') {
  const segments = scanCss(input, true);
  let out = '';
  let depth = 0;
  let parenDepth = 0;
  let atLineStart = true;
  let inSelector = true;
  let skipSpaces = false;
  const newline = () => {
    out = out.replace(/[ \t]+$/, '');
    out += '\n';
    atLineStart = true;
  };
  const writeIndent = () => {
    if (atLineStart) {
      out += indent.repeat(depth);
      atLineStart = false;
    }
  };
  for (const seg of segments) {
    if (seg.type !== 'code') {
      writeIndent();
      out += seg.text;
      skipSpaces = false;
      continue;
    }
    for (let i = 0; i < seg.text.length; i += 1) {
      const ch = seg.text[i];
      const next = seg.text[i + 1] || '';
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        if (skipSpaces || atLineStart) continue;
        out += ' ';
        continue;
      }
      skipSpaces = false;
      if (ch === '(') parenDepth += 1;
      if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
      if (ch === '{') {
        out = out.replace(/[ \t]+$/, '');
        out += ' {';
        depth += 1;
        inSelector = false;
        newline();
      } else if (ch === '}') {
        depth = Math.max(0, depth - 1);
        newline();
        writeIndent();
        out += '}';
        inSelector = true;
        newline();
      } else if (ch === ';') {
        out += ';';
        newline();
      } else if (ch === ':' && !inSelector && parenDepth === 0 && next !== ':' && seg.text[i - 1] !== ':') {
        writeIndent();
        out += ': ';
        skipSpaces = true;
      } else {
        writeIndent();
        out += ch;
      }
    }
  }
  return out.replace(/\n[ \t]*\n/g, '\n').replace(/^\n+/, '').replace(/[ \t]+\n/g, '\n').trim() + '\n';
}

/* Count rules, selectors, declarations, comments and at-rules. */
export function countCss(input) {
  const segments = scanCss(input, true);
  let code = '';
  let comments = 0;
  for (const seg of segments) {
    if (seg.type === 'comment') comments += 1;
    else if (seg.type === 'code') code += seg.text;
  }
  const rules = (code.match(/\{/g) || []).length;
  const declarations = (code.match(/;/g) || []).length;
  const atRules = (code.match(/@[a-z-]+/gi) || []).length;
  const selectors = code
    .split('{')
    .slice(0, -1)
    .map((part) => part.split('}').pop().trim())
    .filter((s) => s && !s.startsWith('@')).length;
  return { rules, selectors, declarations, comments, atRules, chars: input.length };
}

/* Percentage saved by minifying, as a whole-number string. */
export function savedPercent(original, minified) {
  if (!original) return '0';
  return String(Math.max(0, Math.round((1 - minified.length / original.length) * 100)));
}
