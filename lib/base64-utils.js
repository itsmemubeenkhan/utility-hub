/* Pure Base64 helpers (no btoa/atob, so UTF-8 text round-trips correctly
   in both browser and node). Standard alphabet + URL-safe variant,
   optional padding strip, data-URI prefix handling, auto-detect hint. */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes, urlSafe, noPadding) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (b0 << 16) | (b1 << 8) | b2;
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63];
    out += i + 1 < bytes.length ? ALPHABET[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? ALPHABET[n & 63] : '=';
  }
  if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_');
  if (noPadding) out = out.replace(/=+$/g, '');
  return out;
}

function base64ToBytes(str) {
  const clean = str.replace(/[\s\r\n]/g, '');
  const normalized = clean.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(padded)) {
    throw new Error('invalid');
  }
  const bytes = [];
  for (let i = 0; i < padded.length; i += 4) {
    const vals = [0, 1, 2, 3].map((k) => {
      const ch = padded[i + k];
      if (ch === '=') return 0;
      return ALPHABET.indexOf(ch);
    });
    if (vals.some((v) => v < 0)) throw new Error('invalid');
    const n = (vals[0] << 18) | (vals[1] << 12) | (vals[2] << 6) | vals[3];
    bytes.push((n >> 16) & 255);
    if (padded[i + 2] !== '=') bytes.push((n >> 8) & 255);
    if (padded[i + 3] !== '=') bytes.push(n & 255);
  }
  return new Uint8Array(bytes);
}

export function encodeText(text, { urlSafe = false, noPadding = false } = {}) {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes, urlSafe, noPadding);
}

export function encodeBytes(bytes, { urlSafe = false, noPadding = false } = {}) {
  return bytesToBase64(bytes, urlSafe, noPadding);
}

/* Accepts a bare string or a data: URI (uses the part after the comma). */
export function stripDataUri(input) {
  const s = String(input).trim();
  if (/^data:[^,]*;base64,/.test(s)) return s.slice(s.indexOf(',') + 1);
  return s;
}

export function decodeText(input) {
  const bytes = base64ToBytes(stripDataUri(input));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/* Conservative hint only (never auto-switches): plain words like "hello"
   are valid base64 charset, so require length plus a tell: a digit,
   padding, a + / - _ character, or mixed upper/lower case. */
export function looksLikeBase64(input) {
  const s = stripDataUri(input).replace(/[\s\r\n]/g, '');
  if (s.length < 8) return false;
  if (!/^[A-Za-z0-9+/=_-]+$/.test(s)) return false;
  return /[0-9=+\/_-]/.test(s) || (/[a-z]/.test(s) && /[A-Z]/.test(s));
}
