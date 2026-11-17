/* Pure hash helpers (no DOM, so they run in both browser and node).
   MD5 is implemented here from RFC 1321 because Web Crypto does not
   offer it; the SHA family comes from crypto.subtle in the component.
   Everything runs client-side: text and files never leave the device.
   MD5 and SHA-1 are broken for security use and only fit checksums. */

export const HASH_ALGOS = [
  { id: 'MD5', bits: 128, hexLength: 32, broken: true },
  { id: 'SHA-1', bits: 160, hexLength: 40, broken: true },
  { id: 'SHA-256', bits: 256, hexLength: 64, broken: false },
  { id: 'SHA-384', bits: 384, hexLength: 96, broken: false },
  { id: 'SHA-512', bits: 512, hexLength: 128, broken: false },
];

export const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

/* Per-round left-rotate amounts, RFC 1321. */
const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

/* K[i] = floor(abs(sin(i + 1)) * 2^32), computed instead of transcribed
   so no constant can be mistyped. */
const K = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0
);

export function toUint8Array(input) {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  throw new TypeError('md5 input must be a string, Uint8Array or ArrayBuffer');
}

export function utf8ByteLength(str) {
  return new TextEncoder().encode(String(str || '')).length;
}

/* MD5 digest as 16 raw bytes. Accepts a string (UTF-8), a Uint8Array
   or an ArrayBuffer. */
export function md5(input) {
  const bytes = toUint8Array(input);
  const bitLenLow = (bytes.length << 3) >>> 0;
  const bitLenHigh = Math.floor(bytes.length / 536870912) >>> 0;
  const totalLen = (((bytes.length + 8) >> 6) + 1) << 6;
  const msg = new Uint8Array(totalLen);
  msg.set(bytes);
  msg[bytes.length] = 0x80;
  const view = new DataView(msg.buffer);
  view.setUint32(totalLen - 8, bitLenLow, true);
  view.setUint32(totalLen - 4, bitLenHigh, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let off = 0; off < totalLen; off += 64) {
    const m = new Uint32Array(16);
    for (let i = 0; i < 16; i += 1) m[i] = view.getUint32(off + i * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i += 1) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (f + a + K[i] + m[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      const s = S[i];
      b = (b + ((f << s) | (f >>> (32 - s)))) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return out;
}

export function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  if (typeof btoa === 'function') return btoa(binary);
  return Buffer.from(binary, 'binary').toString('base64');
}

export function md5Hex(input) {
  return bytesToHex(md5(input));
}

export function md5Base64(input) {
  return bytesToBase64(md5(input));
}

/* HMAC-MD5, RFC 2104: H((K xor opad) || H((K xor ipad) || text)).
   Keys longer than the 64-byte block are hashed first. */
export function hmacMd5(key, input) {
  let keyBytes = toUint8Array(key);
  if (keyBytes.length > 64) keyBytes = md5(keyBytes);
  const block = new Uint8Array(64);
  block.set(keyBytes);
  const oPad = new Uint8Array(64);
  const iPad = new Uint8Array(64);
  for (let i = 0; i < 64; i += 1) {
    oPad[i] = block[i] ^ 0x5c;
    iPad[i] = block[i] ^ 0x36;
  }
  const msgBytes = toUint8Array(input);
  const inner = new Uint8Array(64 + msgBytes.length);
  inner.set(iPad);
  inner.set(msgBytes, 64);
  const innerHash = md5(inner);
  const outer = new Uint8Array(64 + 16);
  outer.set(oPad);
  outer.set(innerHash, 64);
  return md5(outer);
}

/* Guess the algorithm from a pasted hex hash by its length.
   Returns the algorithm id or null when the length matches nothing. */
export function detectHashAlgorithm(hash) {
  const cleaned = String(hash || '').trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(cleaned)) return null;
  const found = HASH_ALGOS.find((a) => a.hexLength === cleaned.length);
  return found ? found.id : null;
}

export function formatBytes(n) {
  if (!n) return '0 B';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB';
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
