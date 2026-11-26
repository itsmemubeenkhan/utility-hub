/* Pure ISBN helpers (no DOM, so they run in both browser and node).
   An ISBN-10 is 10 characters: the first 9 are digits and the last is a
   check digit that may be X (meaning 10). Its checksum weights the digits
   10 down to 1 and the total must be a multiple of 11. An ISBN-13 is 13
   digits starting with 978 or 979; its checksum weights the digits 1 and
   3 alternating and the total must be a multiple of 10. Hyphens and
   spaces are display only and are stripped before any check. Conversion
   ISBN-10 to ISBN-13 prefixes 978 and recomputes the check digit;
   ISBN-13 to ISBN-10 only works for the 978 prefix, because a 979 book
   has no ISBN-10 form. The registration-group table below is a small
   honest subset: any group not listed is reported as unknown, never
   guessed. Full hyphenation needs the publisher range table, which this
   tool does not ship, so it shows the canonical digit string plus the
   prefix/group split only. */

export const SAMPLE_ISBN13 = '9780061120084';
export const SAMPLE_ISBN10 = '0306406152';
export const SAMPLE_ISBN10_X = '080442957X';
export const SAMPLE_BULK =
  '9780061120084\n0306406152\n9780134685991\n080442957X\n9780061120085';

/* Registration groups we know. key is the group element as it appears
   after the 978/979 prefix (ISBN-13) or at the start (ISBN-10). */
export const REGISTRATION_GROUPS = {
  '0': 'English language',
  '1': 'English language',
  '2': 'French language',
  '3': 'German language',
  '4': 'Japan',
  '5': 'Russian language',
  '7': 'China',
  '89': 'Korea',
  '979-10': 'France',
  '979-11': 'Korea',
  '979-12': 'Italy',
  '979-8': 'United States',
};

/* Strip hyphens and spaces, uppercase X. */
export function cleanIsbn(raw) {
  return String(raw ?? '').replace(/[-\s]/g, '').toUpperCase();
}

/* 'isbn10' for 10 characters, 'isbn13' for 13, null otherwise. */
export function detectType(cleaned) {
  if (cleaned.length === 10) return 'isbn10';
  if (cleaned.length === 13) return 'isbn13';
  return null;
}

/* Check digit for the first 9 digits of an ISBN-10. Returns '0' to '9'
   or 'X', or null when the input is not exactly 9 digits. */
export function computeIsbn10CheckDigit(first9) {
  const s = String(first9 ?? '');
  if (!/^[0-9]{9}$/.test(s)) return null;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(s[i]) * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? 'X' : String(check);
}

/* Check digit for the first 12 digits of an ISBN-13. Returns '0' to '9',
   or null when the input is not exactly 12 digits. */
export function computeIsbn13CheckDigit(first12) {
  const s = String(first12 ?? '');
  if (!/^[0-9]{12}$/.test(s)) return null;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

/* Checksum-only validity for an already-cleaned string, without
   conversion (keeps validateIsbn and the converters recursion-free). */
function checksumValid(cleaned) {
  const type = detectType(cleaned);
  if (type === 'isbn10') {
    if (/[^0-9X]/.test(cleaned)) return false;
    const xPos = cleaned.indexOf('X');
    if (xPos !== -1 && xPos !== 9) return false;
    return computeIsbn10CheckDigit(cleaned.slice(0, 9)) === cleaned[9];
  }
  if (type === 'isbn13') {
    if (/[^0-9]/.test(cleaned)) return false;
    if (!cleaned.startsWith('978') && !cleaned.startsWith('979')) return false;
    return computeIsbn13CheckDigit(cleaned.slice(0, 12)) === cleaned[12];
  }
  return false;
}

/* Validate one ISBN string. Returns an object with:
   raw, cleaned, type ('isbn10' | 'isbn13' | null), valid (bool),
   reason (null when valid, else one of 'empty', 'wrong-length',
   'illegal-character', 'illegal-x-position', 'wrong-prefix',
   'checksum'), expectedCheck and actualCheck (checksum failures only),
   and converted (the converted form when the input is valid). */
export function validateIsbn(raw) {
  const cleaned = cleanIsbn(raw);
  const base = { raw: String(raw ?? ''), cleaned, type: null, valid: false, reason: null, expectedCheck: null, actualCheck: null, converted: null };
  if (!cleaned) return { ...base, reason: 'empty' };
  const type = detectType(cleaned);
  if (!type) return { ...base, reason: 'wrong-length' };
  if (type === 'isbn10') {
    if (/[^0-9X]/.test(cleaned)) return { ...base, type, reason: 'illegal-character' };
    const xPos = cleaned.indexOf('X');
    if (xPos !== -1 && xPos !== 9) return { ...base, type, reason: 'illegal-x-position' };
    const expected = computeIsbn10CheckDigit(cleaned.slice(0, 9));
    const actual = cleaned[9];
    if (expected !== actual) {
      return { ...base, type, reason: 'checksum', expectedCheck: expected, actualCheck: actual };
    }
    return { ...base, type, valid: true, converted: convertIsbn10To13(cleaned) };
  }
  if (/[^0-9]/.test(cleaned)) return { ...base, type, reason: 'illegal-character' };
  if (!cleaned.startsWith('978') && !cleaned.startsWith('979')) {
    return { ...base, type, reason: 'wrong-prefix' };
  }
  const expected = computeIsbn13CheckDigit(cleaned.slice(0, 12));
  const actual = cleaned[12];
  if (expected !== actual) {
    return { ...base, type, reason: 'checksum', expectedCheck: expected, actualCheck: actual };
  }
  return { ...base, type, valid: true, converted: convertIsbn13To10(cleaned) };
}

/* ISBN-10 to ISBN-13: prefix 978, recompute the check digit. Returns the
   13-digit string, or null when the input is not a valid ISBN-10. */
export function convertIsbn10To13(isbn10) {
  const cleaned = cleanIsbn(isbn10);
  if (!checksumValid(cleaned) || detectType(cleaned) !== 'isbn10') return null;
  const body = '978' + cleaned.slice(0, 9);
  return body + computeIsbn13CheckDigit(body);
}

/* ISBN-13 to ISBN-10: only for the 978 prefix. Returns the 10-digit
   string (with X when the check digit is 10), or null for 979 books or
   invalid input. A 979 ISBN has no ISBN-10 form. */
export function convertIsbn13To10(isbn13) {
  const cleaned = cleanIsbn(isbn13);
  if (!checksumValid(cleaned) || detectType(cleaned) !== 'isbn13') return null;
  if (!cleaned.startsWith('978')) return null;
  const body = cleaned.slice(3, 12);
  return body + computeIsbn10CheckDigit(body);
}

/* Convert either way: returns the converted form, or null when the input
   is invalid or (for 979) has no ISBN-10 form. */
export function convertIsbn(raw) {
  const v = validateIsbn(raw);
  return v.valid ? v.converted : null;
}

/* Look up the registration group (language area) of a valid ISBN.
   Returns { group, area } or null when the group is not in our table.
   For ISBN-13 the key includes the 978/979 prefix for 979 groups. */
export function lookupGroup(raw) {
  const cleaned = cleanIsbn(raw);
  const v = validateIsbn(cleaned);
  if (!v.valid) return null;
  if (v.type === 'isbn13') {
    const prefix = cleaned.slice(0, 3);
    if (prefix === '979') {
      for (const len of [2, 1]) {
        const key = prefix + '-' + cleaned.slice(3, 3 + len);
        if (REGISTRATION_GROUPS[key]) return { group: key, area: REGISTRATION_GROUPS[key] };
      }
      return null;
    }
    for (const len of [2, 1]) {
      const key = cleaned.slice(3, 3 + len);
      if (REGISTRATION_GROUPS[key]) return { group: key, area: REGISTRATION_GROUPS[key] };
    }
    return null;
  }
  for (const len of [2, 1]) {
    const key = cleaned.slice(0, len);
    if (REGISTRATION_GROUPS[key]) return { group: key, area: REGISTRATION_GROUPS[key] };
  }
  return null;
}

/* Split a valid ISBN-13 into prefix and group for display. Returns
   { prefix, group, groupArea, remainder } or null. This is the
   prefix/group split only, not full hyphenation. */
export function splitIsbn13(raw) {
  const cleaned = cleanIsbn(raw);
  const v = validateIsbn(cleaned);
  if (!v.valid || v.type !== 'isbn13') return null;
  const g = lookupGroup(cleaned);
  const groupLen = g ? g.group.replace('979-', '').length : 1;
  const prefix = cleaned.slice(0, 3);
  const group = cleaned.slice(3, 3 + groupLen);
  return {
    prefix,
    group,
    groupArea: g ? g.area : null,
    remainder: cleaned.slice(3 + groupLen),
  };
}

/* Validate a bulk paste: one ISBN per line, up to 100 lines. Returns
   { results: [{ line, ...validateIsbn }], valid, invalid, total }. */
export function validateBulk(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 100);
  const results = lines.map((line) => ({ line, ...validateIsbn(line) }));
  return {
    results,
    total: results.length,
    valid: results.filter((r) => r.valid).length,
    invalid: results.filter((r) => !r.valid).length,
  };
}
