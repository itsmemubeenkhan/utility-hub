/* Pure JS minify / beautify helpers (no DOM, so they run in both browser
   and node). The safe-mode minifier is a small string-aware scanner: it
   understands quoted strings, template literals (including ${} nesting),
   regex literals and comments, so it never strips a space that changes
   meaning. Newlines are kept wherever ASI (automatic semicolon insertion)
   could change the program: after return / throw / break / continue, and
   before (, [, template literals, ++ / -- and / when the previous line
   could end a statement. The primary engine is Terser (used by the
   component via dynamic import); this scanner is the honest fallback
   when Terser cannot load, and it never renames variables. */

export const SAMPLE_JS =
  '// Greet every user on the page\n' +
  'function greetUser(firstName, lastName) {\n' +
  '  const fullName = firstName + " " + lastName;\n' +
  '  const message = `Hello, ${fullName}! Welcome back.`;\n' +
  '  console.log(message);\n' +
  '  return message;\n' +
  '}\n' +
  '\n' +
  'const users = ["Ada", "Grace", "Linus"];\n' +
  'const admins = users.filter(function (name) {\n' +
  '  return /^A/.test(name);\n' +
  '});\n' +
  '\n' +
  'users.forEach((user) => {\n' +
  '  const greeting = greetUser(user, "Smith");\n' +
  '  document.title = greeting;\n' +
  '});\n' +
  '\n' +
  'const total = users.length + admins.length;\n' +
  'console.log("Total users:", total);\n';

const ASI_WORDS = new Set(['return', 'throw', 'break', 'continue', 'yield', 'await', 'typeof', 'void', 'delete', 'case']);
const REGEX_AFTER_KEYWORDS = new Set([
  'return', 'typeof', 'case', 'delete', 'void', 'in', 'of', 'instanceof', 'new', 'throw', 'else', 'do',
]);

/* Scan the input once, returning segments of type 'code', 'string',
   'template', 'regex' or 'comment' (comments include their delimiters).
   Regex literals are detected with the classic heuristic: a slash starts
   a regex when the previous significant token cannot end an expression. */
export function scanJs(input) {
  const segments = [];
  let buf = '';
  let type = 'code';
  let quote = '';
  let i = 0;
  /* Last significant code token, for regex detection: 'value' means the
     previous token can end an expression (identifier, number, string,
     template, regex, ), ], }, ++, --). Anything else allows a regex. */
  let prevKind = 'start';
  let prevWord = '';
  const flush = (t) => {
    if (buf) segments.push({ type: t, text: buf });
    buf = '';
  };
  const isWordChar = (c) => /[A-Za-z0-9_$]/.test(c);
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
      } else if (ch === '`') {
        flush('code');
        type = 'template';
        buf = ch;
        i += 1;
      } else if (ch === '/' && next === '/') {
        flush('code');
        const end = input.indexOf('\n', i + 2);
        const comment = end === -1 ? input.slice(i) : input.slice(i, end);
        segments.push({ type: 'comment', text: comment });
        i = end === -1 ? input.length : end;
      } else if (ch === '/' && next === '*') {
        flush('code');
        const end = input.indexOf('*/', i + 2);
        const comment = end === -1 ? input.slice(i) : input.slice(i, end + 2);
        segments.push({ type: 'comment', text: comment });
        i = end === -1 ? input.length : end + 2;
      } else if (ch === '/' && prevKind !== 'value') {
        /* Regex literal: scan it, honouring escapes and [...] classes. */
        flush('code');
        type = 'regex';
        buf = ch;
        i += 1;
      } else {
        if (isWordChar(ch)) {
          if (prevKind !== 'word') prevWord = '';
          prevWord += ch;
          prevKind = 'word';
        } else if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
          if (prevKind === 'word') {
            prevKind = REGEX_AFTER_KEYWORDS.has(prevWord) ? 'keyword' : 'value';
          }
        } else {
          if (prevKind === 'word') {
            prevKind = REGEX_AFTER_KEYWORDS.has(prevWord) ? 'keyword' : 'value';
          }
          if (')]}'.includes(ch)) prevKind = 'value';
          else if (ch === '+' && next === '+') { prevKind = 'value'; }
          else if (ch === '-' && next === '-') { prevKind = 'value'; }
          else prevKind = 'operator';
          prevWord = '';
        }
        buf += ch;
        i += 1;
      }
    } else if (type === 'string') {
      buf += ch;
      if (ch === '\\' && i + 1 < input.length) {
        buf += input[i + 1];
        i += 2;
      } else if (ch === quote) {
        i += 1;
        flush('string');
        type = 'code';
        prevKind = 'value';
        prevWord = '';
      } else {
        i += 1;
      }
    } else if (type === 'template') {
      buf += ch;
      if (ch === '\\' && i + 1 < input.length) {
        buf += input[i + 1];
        i += 2;
      } else if (ch === '$' && next === '{') {
        /* ${ ... } interpolation: scan the nested code until its matching
           brace, honouring nested strings, templates and braces. */
        buf += next;
        i += 2;
        let depth = 1;
        while (i < input.length && depth > 0) {
          const c = input[i];
          buf += c;
          if (c === "'" || c === '"') {
            const q = c;
            i += 1;
            while (i < input.length) {
              buf += input[i];
              if (input[i] === '\\' && i + 1 < input.length) { buf += input[i + 1]; i += 2; continue; }
              if (input[i] === q) { i += 1; break; }
              i += 1;
            }
            continue;
          }
          if (c === '`') {
            /* Nested template inside ${}: reuse the template scanner by
               treating it as an opaque run until its closing backtick. */
            i += 1;
            let innerDepth = 0;
            while (i < input.length) {
              buf += input[i];
              if (input[i] === '\\' && i + 1 < input.length) { buf += input[i + 1]; i += 2; continue; }
              if (input[i] === '$' && input[i + 1] === '{') innerDepth += 1;
              if (input[i] === '}' && innerDepth > 0) innerDepth -= 1;
              if (input[i] === '`' && innerDepth === 0) { i += 1; break; }
              i += 1;
            }
            continue;
          }
          if (c === '{') depth += 1;
          if (c === '}') depth -= 1;
          i += 1;
        }
      } else if (ch === '`') {
        i += 1;
        flush('template');
        type = 'code';
        prevKind = 'value';
        prevWord = '';
      } else {
        i += 1;
      }
    } else if (type === 'regex') {
      buf += ch;
      if (ch === '\\' && i + 1 < input.length) {
        buf += input[i + 1];
        i += 2;
      } else if (ch === '[') {
        /* Character class: a / inside [...] does not end the regex. */
        i += 1;
        while (i < input.length) {
          buf += input[i];
          if (input[i] === '\\' && i + 1 < input.length) { buf += input[i + 1]; i += 2; continue; }
          if (input[i] === ']') { i += 1; break; }
          i += 1;
        }
      } else if (ch === '/') {
        /* Consume trailing flags (g, i, m, s, u, y, d, v). */
        i += 1;
        while (i < input.length && /[a-z]/i.test(input[i])) {
          buf += input[i];
          i += 1;
        }
        flush('regex');
        type = 'code';
        prevKind = 'value';
        prevWord = '';
      } else if (ch === '\n') {
        /* Unterminated regex (invalid JS): stop here so the rest is code. */
        i += 1;
        flush('regex');
        type = 'code';
        prevKind = 'operator';
        prevWord = '';
      } else {
        i += 1;
      }
    }
  }
  flush(type);
  return segments;
}

/* Collapse whitespace in a code segment. A whitespace run containing a
   newline becomes a real newline when ASI could change meaning, otherwise
   it becomes a single space only when two word characters (or an operator
   pair that would merge, like + +) need separating. */
function collapseCode(code) {
  let out = '';
  let i = 0;
  const isWordChar = (c) => /[A-Za-z0-9_$]/.test(c);
  const lastWord = () => {
    const m = out.match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
    return m ? m[0] : '';
  };
  while (i < code.length) {
    const ch = code[i];
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
      let hasNewline = false;
      let j = i;
      while (j < code.length && (code[j] === ' ' || code[j] === '\n' || code[j] === '\t' || code[j] === '\r')) {
        if (code[j] === '\n') hasNewline = true;
        j += 1;
      }
      const prev = out[out.length - 1] || '';
      const next = code[j] || '';
      const prev2 = out[out.length - 2] || '';
      if (hasNewline) {
        const word = lastWord();
        /* prev can end a statement: identifier / number / string close /
           ) ] } or a postfix ++ / --. A newline after it is only safe to
           drop when the next token plainly continues the expression
           (. , ; : ? * % = < > & | ^ ) ] }). Anything else (a new
           statement, or an ambiguous + - / continuation) keeps the
           newline: dropping it could turn two statements into one
           broken one, e.g. `1\nvar b = 2` must never become `1 var b`. */
        const prevValueish =
          isWordChar(prev) || prev === ')' || prev === ']' || prev === '}' ||
          prev === '"' || prev === "'" || prev === '`' ||
          (prev === '+' && prev2 === '+') || (prev === '-' && prev2 === '-');
        const nextContinues =
          next === '.' || next === ',' || next === ';' || next === ':' ||
          next === '?' || next === '*' || next === '%' || next === '=' ||
          next === '<' || next === '>' || next === '&' || next === '|' ||
          next === '^' || next === ')' || next === ']' || next === '}';
        const asiRisk = ASI_WORDS.has(word) || (prevValueish && !nextContinues);
        if (asiRisk) {
          out = out.replace(/[ \t]+$/, '');
          out += '\n';
        } else if (prev && next && (isWordChar(prev) && isWordChar(next))) {
          out += ' ';
        } else if ((prev === '+' || prev === '-') && (next === '+' || next === '-')) {
          out += ' ';
        }
      } else if (prev && next && isWordChar(prev) && isWordChar(next)) {
        out += ' ';
      } else if ((prev === '+' || prev === '-') && (next === '+' || next === '-')) {
        out += ' ';
      }
      i = j;
    } else {
      out += ch;
      i += 1;
    }
  }
  return out;
}

/* Safe-mode minify: strip comments (keeping /*! license comments when
   requested), collapse whitespace with ASI safety, drop the space after
   keywords only where safe. Never renames variables, never folds code. */
export function minifyJsSafe(input, opts = {}) {
  const o = {
    removeComments: opts.removeComments !== false,
    keepImportant: opts.keepImportant !== false,
  };
  const segments = scanJs(input);
  let out = '';
  for (const seg of segments) {
    if (seg.type === 'comment') {
      if (!o.removeComments || (o.keepImportant && seg.text.startsWith('/*!'))) {
        out += seg.text;
      }
    } else if (seg.type === 'code') {
      /* Spacing cleanup runs on code only: a kept license comment or a
         string must never be touched (its spaces are content). */
      out += collapseCode(seg.text)
        .replace(/ ([{}();,:[\]])/g, '$1')
        .replace(/([{(:,;{])\s+/g, '$1')
        .replace(/\s+([.])/g, '$1')
        .replace(/([.])\s+/g, '$1');
    } else {
      out += seg.text;
    }
  }
  /* A newline kept for ASI safety is only needed when the next token
     starts a continuation; a trailing newline at the very end goes. */
  return out.replace(/\n /g, '\n').trim();
}

/* Light indent-based beautifier for the safe mode: one statement per
   line, 2-space indent per brace depth, strings / templates / regex /
   comments pass through untouched. */
export function beautifyJsSafe(input, indent = '  ') {
  const segments = scanJs(input);
  let out = '';
  let depth = 0;
  let parenDepth = 0;
  let atLineStart = true;
  let lineHasContent = false;
  const newline = () => {
    out = out.replace(/[ \t]+$/, '');
    if (lineHasContent) out += '\n';
    atLineStart = true;
    lineHasContent = false;
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
      lineHasContent = true;
      continue;
    }
    for (let i = 0; i < seg.text.length; i += 1) {
      const ch = seg.text[i];
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        if (atLineStart || !lineHasContent) continue;
        if (!/[ \t]$/.test(out)) out += ' ';
        continue;
      }
      if (ch === '(') parenDepth += 1;
      if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
      if (ch === '{') {
        out = out.replace(/[ \t]+$/, '');
        out += ' {';
        depth += 1;
        lineHasContent = true;
        newline();
      } else if (ch === '}') {
        depth = Math.max(0, depth - 1);
        if (lineHasContent) newline();
        writeIndent();
        out += '}';
        lineHasContent = true;
        newline();
      } else if (ch === ';' && parenDepth === 0) {
        out = out.replace(/[ \t]+$/, '');
        out += ';';
        lineHasContent = true;
        newline();
      } else if (ch === ',' && parenDepth === 0) {
        out = out.replace(/[ \t]+$/, '');
        out += ', ';
        lineHasContent = true;
      } else {
        writeIndent();
        out += ch;
        lineHasContent = true;
      }
    }
  }
  return out.replace(/\n[ \t]*\n/g, '\n').replace(/^\n+/, '').replace(/[ \t]+\n/g, '\n').trim() + '\n';
}

/* Count lines, statements, functions and comments (code segments only
   for the counts, so strings never inflate them). */
export function countJs(input) {
  const segments = scanJs(input);
  let code = '';
  let comments = 0;
  for (const seg of segments) {
    if (seg.type === 'comment') comments += 1;
    else if (seg.type === 'code') code += seg.text;
  }
  const lines = input ? input.split('\n').length : 0;
  const statements = (code.match(/;/g) || []).length;
  const functions = (code.match(/\bfunction\b/g) || []).length + (code.match(/=>/g) || []).length;
  return { lines, statements, functions, comments, chars: input.length };
}

/* Percentage saved by minifying, as a whole-number string. */
export function savedPercent(original, minified) {
  if (!original) return '0';
  return String(Math.max(0, Math.round((1 - minified.length / original.length) * 100)));
}
