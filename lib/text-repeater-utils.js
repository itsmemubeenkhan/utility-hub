/* Pure text-repeater helpers (no DOM, so they run in both browser and node).
   Repetition is grapheme-cluster safe: the text is never sliced by code
   unit or code point, only concatenated whole, and every count we show is
   measured in grapheme clusters via Intl.Segmenter with a code-point
   fallback. That matters because a single visible character can be several
   UTF-16 units: the family emoji 👨‍👩‍👧 is 8 UTF-16 units and 5 code
   points but 1 grapheme, the flag 🇵🇰 is 4 units and 2 code points but 1
   grapheme, and 👍🏽 (thumb plus skin-tone modifier) is 4 units and 2 code
   points but 1 grapheme. A repeater that counts or slices by .length
   splits those in half; this one never does. Output is capped at 500,000
   characters: when a request exceeds the cap, whole copies are produced
   up to the cap and the caller is told exactly how many were made. */

export const MAX_REPEAT_COUNT = 10000;
export const MAX_OUTPUT_CHARS = 500000;

export const SAMPLE_TEXT = 'Happy Birthday! 🎉';

export const SEPARATORS = {
  none: '',
  space: ' ',
  newline: '\n',
  comma: ', ',
  custom: null,
};

/* Split a string into grapheme clusters. Falls back to code points when
   Intl.Segmenter is unavailable (very old runtimes). */
export function splitGraphemes(text) {
  const s = String(text ?? '');
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...seg.segment(s)].map((part) => part.segment);
  }
  return [...s];
}

/* How many visible characters the text has (grapheme clusters). */
export function countGraphemes(text) {
  return splitGraphemes(text).length;
}

/* Clamp a requested repeat count to the 0..10000 range. Non-numeric input
   becomes 1 (the default); 0 stays 0 so an explicit zero repeats nothing. */
export function clampCount(raw) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return 1;
  if (n <= 0) return 0;
  return Math.min(MAX_REPEAT_COUNT, n);
}

/* Resolve a separator key to its string. 'custom' uses the custom string. */
export function resolveSeparator(key, customSeparator = '') {
  if (key === 'custom') return String(customSeparator ?? '');
  if (key === 'space') return ' ';
  if (key === 'newline') return '\n';
  if (key === 'comma') return ', ';
  return '';
}

/* Measure a text: UTF-16 length, grapheme count, words, lines, UTF-8 bytes. */
export function measureText(text) {
  const s = String(text ?? '');
  const words = s.trim() ? s.trim().split(/\s+/).length : 0;
  const lines = s === '' ? 0 : s.split('\n').length;
  let bytes = 0;
  if (typeof TextEncoder !== 'undefined') {
    bytes = new TextEncoder().encode(s).length;
  } else {
    bytes = Buffer.byteLength(s, 'utf8');
  }
  return {
    chars: s.length,
    graphemes: countGraphemes(s),
    words,
    lines,
    bytes,
  };
}

/* Exact output size for a requested repeat, before the cap is applied.
   Numbering prefixes ('1. ', '2. ', ...) are included per copy. */
export function outputSizeMath(text, count, separator = 'none', customSeparator = '', numberEach = false) {
  const s = String(text ?? '');
  const n = clampCount(count);
  const sep = resolveSeparator(separator, customSeparator);
  let numberedChars = 0;
  if (numberEach) {
    for (let i = 1; i <= n; i += 1) numberedChars += String(i).length + 2;
  }
  const totalChars = n * s.length + numberedChars + Math.max(0, n - 1) * sep.length;
  return {
    textChars: s.length,
    textGraphemes: countGraphemes(s),
    separatorChars: sep.length,
    copies: n,
    totalChars,
    formula:
      s.length +
      ' chars x ' +
      n +
      ' copies + ' +
      sep.length +
      ' char separator x ' +
      Math.max(0, n - 1) +
      (numberEach ? ' + numbering prefixes' : '') +
      ' = ' +
      totalChars.toLocaleString('en-US') +
      ' chars',
  };
}

/* Repeat text count times with the chosen separator. Never splits a
   grapheme: copies are whole strings joined by the separator. When the
   result would pass MAX_OUTPUT_CHARS, as many whole copies as fit are
   produced and capped is true. A trailing separator is added only if it
   still fits inside the cap. Returns the output plus exact counts. */
export function repeatText({
  text = '',
  count = 1,
  separator = 'none',
  customSeparator = '',
  numberEach = false,
  trailingSeparator = false,
} = {}) {
  const s = String(text ?? '');
  const n = clampCount(count);
  const sep = resolveSeparator(separator, customSeparator);
  if (s === '' || n === 0) {
    return {
      output: '',
      copiesProduced: 0,
      requestedCopies: n,
      capped: false,
      totalChars: 0,
      totalBytes: 0,
      totalGraphemes: 0,
    };
  }
  const parts = [];
  let length = 0;
  let produced = 0;
  let capped = false;
  for (let i = 1; i <= n; i += 1) {
    const prefix = numberEach ? String(i) + '. ' : '';
    const copy = prefix + s;
    const joinLen = produced > 0 ? sep.length : 0;
    if (length + joinLen + copy.length > MAX_OUTPUT_CHARS) {
      capped = true;
      break;
    }
    if (produced > 0) {
      parts.push(sep);
      length += sep.length;
    }
    parts.push(copy);
    length += copy.length;
    produced += 1;
  }
  if (trailingSeparator && produced > 0 && length + sep.length <= MAX_OUTPUT_CHARS) {
    parts.push(sep);
    length += sep.length;
  }
  const output = parts.join('');
  const measured = measureText(output);
  return {
    output,
    copiesProduced: produced,
    requestedCopies: n,
    capped,
    totalChars: measured.chars,
    totalBytes: measured.bytes,
    totalGraphemes: measured.graphemes,
  };
}
