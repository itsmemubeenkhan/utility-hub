/* Pure binary to text helpers (no DOM, so they run in both browser and node).
   Text is encoded as UTF-8, not ASCII: every character becomes one or more
   8-bit bytes, so accents, other alphabets and emoji survive the round trip
   instead of turning into question marks. A 7-bit ASCII mode is offered for
   the classic textbook form, and it rejects any character above 127 with a
   named error instead of silently mangling it. Binary input is forgiving
   about separators (spaces, commas, newlines, 0b prefixes) and strict about
   content: a stray digit or an incomplete final group is reported with its
   exact position, never guessed. */

export const SAMPLE_TEXT = 'Hello, World!';
export const SAMPLE_BINARY = '01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001';

const utf8Encode = (text) => [...new TextEncoder().encode(String(text ?? ''))];

function byteToBits(byte) {
  return byte.toString(2).padStart(8, '0');
}

/* Encode text as binary. Options: separator ('space', 'none' or 'comma'),
   bits (8 for UTF-8, 7 for ASCII). Returns { ok, output, error }. */
export function textToBinary(text, options = {}) {
  const { separator = 'space', bits = 8 } = options;
  const src = String(text ?? '');
  if (!src) {
    return { ok: false, output: '', error: { code: 'empty', message: 'No text found. Type something first.', position: 0 } };
  }
  if (bits === 7) {
    const bad = [...src].find((ch) => ch.codePointAt(0) > 127);
    if (bad) {
      return { ok: false, output: '', error: { code: 'non-ascii', message: '7-bit ASCII cannot encode "' + bad + '" (U+' + bad.codePointAt(0).toString(16).toUpperCase().padStart(4, '0') + '). Switch to 8-bit UTF-8.', position: src.indexOf(bad) } };
    }
    const groups = [...src].map((ch) => ch.codePointAt(0).toString(2).padStart(7, '0'));
    return { ok: true, output: joinGroups(groups, separator), error: null };
  }
  const bytes = utf8Encode(src);
  const groups = bytes.map(byteToBits);
  return { ok: true, output: joinGroups(groups, separator), error: null };
}

function joinGroups(groups, separator) {
  if (separator === 'none') return groups.join('');
  if (separator === 'comma') return groups.join(',');
  return groups.join(' ');
}

/* Decode binary back to text. Accepts spaced, comma-separated, newline
   separated or continuous groups, with optional 0b prefixes. Returns
   { ok, output, error }. Errors name the exact spot: 'invalid-digit' gives
   the character position, 'incomplete' gives the short final group,
   'invalid-utf8' gives the byte index that breaks UTF-8 decoding. */
export function binaryToText(input, options = {}) {
  const { bits = 8 } = options;
  const src = String(input ?? '');
  const cleaned = src.replace(/0b/gi, '');
  const digitsOnly = cleaned.replace(/[\s,;|]+/g, '');
  if (!digitsOnly) {
    return { ok: false, output: '', error: { code: 'empty', message: 'No binary found. Paste 0s and 1s first.', position: 0 } };
  }
  const badAt = [...digitsOnly].findIndex((ch) => ch !== '0' && ch !== '1');
  if (badAt !== -1) {
    return { ok: false, output: '', error: { code: 'invalid-digit', message: '"' + digitsOnly[badAt] + '" is not a binary digit. Binary uses only 0 and 1.', position: badAt } };
  }
  if (digitsOnly.length % bits !== 0) {
    const leftover = digitsOnly.length % bits;
    return { ok: false, output: '', error: { code: 'incomplete', message: 'The last group has only ' + leftover + ' of ' + bits + ' bits. Each group needs exactly ' + bits + ' bits.', position: digitsOnly.length - leftover } };
  }
  const groups = [];
  for (let i = 0; i < digitsOnly.length; i += bits) groups.push(digitsOnly.slice(i, i + bits));
  if (bits === 7) {
    try {
      const chars = groups.map((g) => String.fromCodePoint(parseInt(g, 2)));
      return { ok: true, output: chars.join(''), error: null };
    } catch {
      return { ok: false, output: '', error: { code: 'invalid-ascii', message: 'A 7-bit group is out of range.', position: 0 } };
    }
  }
  const bytes = new Uint8Array(groups.map((g) => parseInt(g, 2)));
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, output: text, error: null };
  } catch {
    let badByte = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(0, i + 1));
      } catch {
        badByte = i;
        break;
      }
    }
    return { ok: false, output: '', error: { code: 'invalid-utf8', message: 'The bytes are not valid UTF-8 text (first bad byte at position ' + (badByte + 1) + ' of ' + bytes.length + '). Check for a missing or extra group.', position: badByte } };
  }
}

/* True when the input looks like binary: only 0s, 1s, separators and
   optional 0b prefixes, with at least one digit. Anything else is text. */
export function detectBinary(input) {
  const src = String(input ?? '').trim();
  if (!src) return false;
  const cleaned = src.replace(/0b/gi, '').replace(/[\s,;|]+/g, '');
  return cleaned.length > 0 && /^[01]+$/.test(cleaned);
}

/* One row per character of the text: the character itself, its Unicode
   code point, and every UTF-8 byte it becomes, in binary, hex and decimal.
   Used by the byte table under the converter. */
export function byteTable(text) {
  const src = String(text ?? '');
  const rows = [];
  for (const ch of src) {
    const bytes = utf8Encode(ch);
    rows.push({
      char: ch,
      codePoint: 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
      binary: bytes.map(byteToBits).join(' '),
      hex: bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
      dec: bytes.map((b) => String(b)).join(' '),
      bytes: bytes.length,
    });
  }
  return rows;
}

/* Live counts for the stats line: input characters, UTF-8 bytes and
   8-bit groups the text becomes. */
export function countBinary(text) {
  const src = String(text ?? '');
  const bytes = utf8Encode(src);
  return { chars: [...src].length, bytes: bytes.length, groups: bytes.length };
}
