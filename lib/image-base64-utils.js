/* Pure image-to-Base64 helpers (no DOM, no imports, so they run in
   both browser and node). Everything here is string and byte math:
   data URI parsing and building, Base64 encode and decode, MIME
   sniffing from magic bytes, size and overhead stats, and the
   HTML, CSS and Markdown snippets the component outputs. The
   component does the browser-only work (FileReader, canvas
   re-encode, clipboard) and calls these helpers for the rest. */

export const SUPPORTED_FORMATS = [
  { mime: 'image/png', ext: 'png', label: 'PNG' },
  { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG' },
  { mime: 'image/gif', ext: 'gif', label: 'GIF' },
  { mime: 'image/webp', ext: 'webp', label: 'WebP' },
  { mime: 'image/svg+xml', ext: 'svg', label: 'SVG' },
  { mime: 'image/bmp', ext: 'bmp', label: 'BMP' },
  { mime: 'image/x-icon', ext: 'ico', label: 'ICO' },
];

export const SUPPORTED_MIMES = SUPPORTED_FORMATS.map((f) => f.mime);

export const ACCEPT_ATTR = SUPPORTED_FORMATS.map((f) => '.' + f.ext).join(',');

/* Raster formats the canvas re-encode path can handle. SVG and ICO
   are left untouched: browsers cannot reliably draw them to canvas. */
export const REENCODABLE_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];

export function isSupportedMime(mime) {
  return SUPPORTED_MIMES.includes(String(mime || '').toLowerCase());
}

export function isReencodableMime(mime) {
  return REENCODABLE_MIMES.includes(String(mime || '').toLowerCase());
}

export function mimeToExt(mime) {
  const found = SUPPORTED_FORMATS.find((f) => f.mime === String(mime || '').toLowerCase());
  return found ? found.ext : 'bin';
}

export function extToMime(ext) {
  const found = SUPPORTED_FORMATS.find((f) => f.ext === String(ext || '').toLowerCase().replace(/^\./, ''));
  return found ? found.mime : null;
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

/* Base64 text is about 4/3 the size of the bytes it carries. */
export function base64ByteLength(b64) {
  const clean = String(b64 || '').replace(/\s/g, '');
  if (!clean) return 0;
  const padding = (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0);
  return Math.floor((clean.length * 3) / 4) - padding;
}

export function base64OverheadPct(originalBytes, base64Length) {
  const orig = Number(originalBytes) || 0;
  if (orig <= 0) return 0;
  return ((Number(base64Length) - orig) / orig) * 100;
}

/* Stats line for one encoded file: original size, Base64 size and
   the overhead percentage, rounded to one decimal. */
export function computeStats(originalBytes, base64Length) {
  const b64 = Number(base64Length) || 0;
  const overhead = base64OverheadPct(originalBytes, b64);
  return {
    originalBytes: Number(originalBytes) || 0,
    base64Length: b64,
    overheadPct: Math.round(overhead * 10) / 10,
  };
}

export function buildDataUri(mime, base64) {
  return 'data:' + mime + ';base64,' + base64;
}

/* Parse a data URI that carries Base64. Returns
   { ok: true, mime, base64 } or { ok: false, error } where error is
   one of 'not-data-uri', 'not-base64' or 'empty-payload'. */
export function parseDataUri(text) {
  const input = String(text || '').trim();
  if (!input.toLowerCase().startsWith('data:')) return { ok: false, error: 'not-data-uri' };
  const comma = input.indexOf(',');
  if (comma < 0) return { ok: false, error: 'not-data-uri' };
  const header = input.slice(5, comma);
  const payload = input.slice(comma + 1).replace(/\s/g, '');
  if (!/;base64$/i.test(header)) return { ok: false, error: 'not-base64' };
  const mime = header.replace(/;base64$/i, '').trim() || 'application/octet-stream';
  if (!payload) return { ok: false, error: 'empty-payload' };
  return { ok: true, mime, base64: payload };
}

/* Accept either a raw Base64 string or a full data URI and normalize
   it to { mime, base64 }. mime is null for raw input, the caller
   sniffs it from the decoded bytes. */
export function normalizeBase64Input(text) {
  const input = String(text || '').trim();
  if (!input) return { ok: false, error: 'empty' };
  if (input.toLowerCase().startsWith('data:')) {
    const parsed = parseDataUri(input);
    if (!parsed.ok) return parsed;
    if (!isValidBase64(parsed.base64)) return { ok: false, error: 'invalid-base64' };
    return { ok: true, mime: parsed.mime, base64: parsed.base64 };
  }
  const cleaned = input.replace(/\s/g, '');
  if (!isValidBase64(cleaned)) return { ok: false, error: 'invalid-base64' };
  return { ok: true, mime: null, base64: cleaned };
}

const B64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

export function isValidBase64(str) {
  const clean = String(str || '').replace(/\s/g, '');
  if (!clean || clean.length % 4 !== 0) return false;
  if (!B64_RE.test(clean)) return false;
  /* Padding, when present, is only allowed at the very end. */
  const firstPad = clean.indexOf('=');
  if (firstPad >= 0 && firstPad < clean.length - 2) return false;
  return true;
}

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/* Manual Base64 encode and decode, so the same code runs in node
   tests and in the browser without Buffer or atob. */
export function encodeBytesToBase64(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let out = '';
  for (let i = 0; i < data.length; i += 3) {
    const b0 = data[i];
    const b1 = i + 1 < data.length ? data[i + 1] : 0;
    const b2 = i + 2 < data.length ? data[i + 2] : 0;
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < data.length ? B64_ALPHABET[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < data.length ? B64_ALPHABET[b2 & 63] : '=';
  }
  return out;
}

export function decodeBase64ToBytes(b64) {
  const clean = String(b64 || '').replace(/\s/g, '');
  if (!isValidBase64(clean)) return null;
  const lookup = new Map();
  for (let i = 0; i < B64_ALPHABET.length; i += 1) lookup.set(B64_ALPHABET[i], i);
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = lookup.get(clean[i]);
    const c1 = lookup.get(clean[i + 1]);
    const c2 = clean[i + 2] === '=' ? 0 : lookup.get(clean[i + 2]);
    const c3 = clean[i + 3] === '=' ? 0 : lookup.get(clean[i + 3]);
    if (c0 === undefined || c1 === undefined || c2 === undefined || c3 === undefined) return null;
    out.push((c0 << 2) | (c1 >> 4));
    if (clean[i + 2] !== '=') out.push(((c1 & 15) << 4) | (c2 >> 2));
    if (clean[i + 3] !== '=') out.push(((c2 & 3) << 6) | c3);
  }
  return new Uint8Array(out);
}

/* Identify an image format from its first bytes. SVG has no magic
   bytes, so it is detected from its text start instead. Returns a
   MIME string or null when the bytes match nothing known. */
export function sniffMimeFromBytes(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
  if (b.length >= 4 && b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) return 'image/x-icon';
  if (b.length >= 4) {
    let text = '';
    for (let i = 0; i < Math.min(b.length, 512); i += 1) text += String.fromCharCode(b[i]);
    const trimmed = text.replace(/^\s+/, '').replace(/^<\?xml[^>]*>\s*/i, '');
    if (/^<svg[\s>]/.test(trimmed)) return 'image/svg+xml';
  }
  return null;
}

export function sniffMimeFromBase64(b64) {
  const bytes = decodeBase64ToBytes(b64);
  if (!bytes) return null;
  return sniffMimeFromBytes(bytes);
}

/* Output snippets. alt is escaped for the HTML attribute. */
export function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildHtmlImg(dataUri, alt) {
  return '<img src="' + dataUri + '" alt="' + escapeHtmlAttr(alt || 'image') + '">';
}

export function buildCssBackground(dataUri) {
  return "background-image: url('" + dataUri + "');";
}

export function buildMarkdownImage(dataUri, alt) {
  return '![' + String(alt || 'image').replace(/[\[\]]/g, '') + '](' + dataUri + ')';
}

export function downloadFilename(mime, base) {
  return (base || 'image') + '.' + mimeToExt(mime);
}

/* A 1x1 transparent PNG, used by the node tests and as a fallback
   sample. The component generates a richer sample with canvas. */
export const SAMPLE_PNG_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAwMCAO+ip1sAAAAASUVORK5CYII=';
