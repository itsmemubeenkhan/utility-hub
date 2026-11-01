/* Regex Tester helpers: pure functions, no DOM, no imports, so they can be
   unit-tested in node. All matching uses the JavaScript RegExp engine, the
   same engine the browser runs, so a pattern that works here works in code. */

export const VALID_FLAGS = ['g', 'i', 'm', 's', 'u', 'y'];

export const FLAG_DESCRIPTIONS = {
  g: 'global: find every match, not just the first',
  i: 'case-insensitive: A matches a',
  m: 'multiline: ^ and $ match line boundaries',
  s: 'dotAll: . matches newlines too',
  u: 'unicode: full Unicode mode, enables \\p{...} escapes',
  y: 'sticky: matches only at lastIndex, no searching ahead',
};

/* Validate flag letters: only gimsuy, no duplicates. Returns an error string
   or null. */
export function validateFlags(flags) {
  const seen = new Set();
  for (const ch of flags) {
    if (!VALID_FLAGS.includes(ch)) return 'invalid-flag:' + ch;
    if (seen.has(ch)) return 'duplicate-flag:' + ch;
    seen.add(ch);
  }
  return null;
}

/* Run pattern against text and return every match with its index and capture
   groups. The g flag is forced on for enumeration (the user's own flags are
   still honoured for case, multiline and the rest). Empty matches advance
   lastIndex by one code unit so a pattern like a* can never loop forever.
   Matches are capped at 500 to keep pathological patterns responsive. */
export function testPattern(pattern, flags, text) {
  const flagError = validateFlags(flags);
  if (flagError) return { matches: [], error: flagError };
  let re;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], error: e.message || 'Invalid regular expression' };
  }
  const enumFlags = flags.includes('g') ? flags : flags + 'g';
  let enumRe;
  try {
    enumRe = new RegExp(pattern, enumFlags);
  } catch (e) {
    return { matches: [], error: e.message || 'Invalid regular expression' };
  }
  const matches = [];
  let m;
  while ((m = enumRe.exec(text)) !== null) {
    matches.push({
      index: m.index,
      text: m[0],
      groups: Array.prototype.slice.call(m, 1),
      named: m.groups ? { ...m.groups } : {},
    });
    if (m[0] === '') enumRe.lastIndex += 1;
    if (matches.length >= 500) break;
    if (enumRe.lastIndex > text.length) break;
  }
  return { matches, error: null, sourceFlags: flags, usedFlags: enumFlags };
}

/* Split text into alternating unmatched/matched segments for highlighting.
   Matches must be sorted by index and non-overlapping (as testPattern gives). */
export function highlightSegments(text, matches) {
  const parts = [];
  let pos = 0;
  for (const m of matches) {
    if (m.index > pos) parts.push({ matched: false, text: text.slice(pos, m.index) });
    if (m.text !== '') parts.push({ matched: true, text: m.text });
    pos = Math.max(pos, m.index + m.text.length);
  }
  if (pos < text.length) parts.push({ matched: false, text: text.slice(pos) });
  if (parts.length === 0) parts.push({ matched: false, text });
  return parts;
}

/* Preview a find-and-replace with the user's flags exactly as typed (no
   forced g: without g, JavaScript replaces only the first match, and the
   preview should show that honestly). Returns { result, error }. */
export function applyReplacement(pattern, flags, text, replacement) {
  const flagError = validateFlags(flags);
  if (flagError) return { result: '', error: flagError };
  let re;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { result: '', error: e.message || 'Invalid regular expression' };
  }
  try {
    return { result: text.replace(re, replacement), error: null };
  } catch (e) {
    return { result: '', error: e.message || 'Replacement failed' };
  }
}

/* Ready-made patterns for the library row. Each entry is a pattern plus the
   flags that make it behave as users expect. */
export const COMMON_PATTERNS = [
  { name: 'Email address', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+', flags: 'g' },
  { name: 'URL', pattern: 'https?://[^\\s/$.?#].[^\\s]*', flags: 'gi' },
  { name: 'US phone number', pattern: '\\(?\\d{3}\\)?[-.\\s]\\d{3}[-.\\s]\\d{4}', flags: 'g' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { name: 'Hex color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
  { name: 'UUID', pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', flags: 'gi' },
  { name: 'IPv4 address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { name: 'Hashtag', pattern: '#[\\w]+', flags: 'g' },
];

export const DEFAULT_PATTERN = '(\\w+)@([\\w.-]+\\.[a-z]{2,})';
export const DEFAULT_TEXT =
  'Contact ada@example.com or help+regexkit@mail.co.uk for support.\n' +
  'Orders go to sales@shop-example.org, but not to not-an-email@.';
