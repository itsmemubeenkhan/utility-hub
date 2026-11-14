/* Node tests for lib/image-base64-utils.js. Run: node tests/image-base64-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  SUPPORTED_FORMATS, ACCEPT_ATTR, isSupportedMime, isReencodableMime,
  mimeToExt, extToMime, formatBytes, base64ByteLength,
  base64OverheadPct, computeStats, buildDataUri, parseDataUri,
  normalizeBase64Input, isValidBase64, encodeBytesToBase64,
  decodeBase64ToBytes, sniffMimeFromBytes, sniffMimeFromBase64,
  escapeHtmlAttr, buildHtmlImg, buildCssBackground, buildMarkdownImage,
  downloadFilename, SAMPLE_PNG_DATA_URI,
} from '../lib/image-base64-utils.js';

let passed = 0;
function ok(name, fn) { fn(); passed += 1; console.log('ok - ' + name); }

ok('supported formats cover the 7 required types', () => {
  assert.deepEqual(SUPPORTED_FORMATS.map((f) => f.mime), [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/x-icon',
  ]);
  assert.ok(ACCEPT_ATTR.includes('.png') && ACCEPT_ATTR.includes('.svg'));
});

ok('mime helpers', () => {
  assert.equal(isSupportedMime('image/webp'), true);
  assert.equal(isSupportedMime('image/tiff'), false);
  assert.equal(isReencodableMime('image/png'), true);
  assert.equal(isReencodableMime('image/svg+xml'), false);
  assert.equal(mimeToExt('image/jpeg'), 'jpg');
  assert.equal(mimeToExt('image/svg+xml'), 'svg');
  assert.equal(mimeToExt('image/unknown'), 'bin');
  assert.equal(extToMime('webp'), 'image/webp');
  assert.equal(extToMime('.JPG'), 'image/jpeg');
  assert.equal(extToMime('tiff'), null);
});

ok('formatBytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.50 MB');
});

ok('base64 size and overhead math', () => {
  assert.equal(base64ByteLength('aGVsbG8='), 5);
  assert.equal(base64ByteLength('aGVsbG8gd29ybGQ='), 11);
  assert.equal(base64ByteLength(''), 0);
  assert.equal(base64OverheadPct(3, 4), 33.33333333333333);
  const s = computeStats(3000, 4000);
  assert.equal(s.originalBytes, 3000);
  assert.equal(s.base64Length, 4000);
  assert.equal(s.overheadPct, 33.3);
});

ok('buildDataUri and parseDataUri round trip', () => {
  const uri = buildDataUri('image/png', 'aGVsbG8=');
  assert.equal(uri, 'data:image/png;base64,aGVsbG8=');
  const p = parseDataUri(uri);
  assert.equal(p.ok, true);
  assert.equal(p.mime, 'image/png');
  assert.equal(p.base64, 'aGVsbG8=');
  assert.deepEqual(parseDataUri('https://example.com/x.png'), { ok: false, error: 'not-data-uri' });
  assert.deepEqual(parseDataUri('data:image/png,hello'), { ok: false, error: 'not-base64' });
  assert.deepEqual(parseDataUri('data:image/png;base64,'), { ok: false, error: 'empty-payload' });
});

ok('normalizeBase64Input accepts raw and data URI input', () => {
  const raw = normalizeBase64Input('  aGVsbG8=  ');
  assert.equal(raw.ok, true);
  assert.equal(raw.mime, null);
  assert.equal(raw.base64, 'aGVsbG8=');
  const uri = normalizeBase64Input(SAMPLE_PNG_DATA_URI);
  assert.equal(uri.ok, true);
  assert.equal(uri.mime, 'image/png');
  assert.deepEqual(normalizeBase64Input(''), { ok: false, error: 'empty' });
  assert.deepEqual(normalizeBase64Input('not base64!!!'), { ok: false, error: 'invalid-base64' });
});

ok('isValidBase64 rejects bad padding and charset', () => {
  assert.equal(isValidBase64('aGVsbG8='), true);
  assert.equal(isValidBase64('aGVsbG8'), false);
  assert.equal(isValidBase64('aGVs=bG8='), false);
  assert.equal(isValidBase64('aGVs*bG8='), false);
  assert.equal(isValidBase64(''), false);
});

ok('encode and decode round trip', () => {
  const bytes = new Uint8Array([0, 1, 2, 250, 255, 72, 101, 108, 108, 111]);
  const b64 = encodeBytesToBase64(bytes);
  assert.equal(b64, Buffer.from(bytes).toString('base64'));
  assert.deepEqual(decodeBase64ToBytes(b64), bytes);
  assert.equal(decodeBase64ToBytes('aGVsbG8=').length, 5);
  assert.equal(decodeBase64ToBytes('bad!!'), null);
  assert.equal(encodeBytesToBase64(new Uint8Array([])), '');
});

ok('sniffMimeFromBytes detects all formats', () => {
  assert.equal(sniffMimeFromBytes(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(sniffMimeFromBytes(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(sniffMimeFromBytes(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])), 'image/gif');
  assert.equal(sniffMimeFromBytes(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), 'image/webp');
  assert.equal(sniffMimeFromBytes(new Uint8Array([0x42, 0x4d, 0, 0])), 'image/bmp');
  assert.equal(sniffMimeFromBytes(new Uint8Array([0, 0, 1, 0])), 'image/x-icon');
  const svg = new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.equal(sniffMimeFromBytes(svg), 'image/svg+xml');
  assert.equal(sniffMimeFromBytes(new Uint8Array([1, 2, 3, 4])), null);
});

ok('sniffMimeFromBase64 and sample PNG', () => {
  assert.equal(sniffMimeFromBase64(SAMPLE_PNG_DATA_URI.split(',')[1]), 'image/png');
  const parsed = parseDataUri(SAMPLE_PNG_DATA_URI);
  assert.equal(parsed.ok, true);
  assert.equal(base64ByteLength(parsed.base64), 68);
});

ok('snippet builders escape and format', () => {
  const uri = 'data:image/png;base64,AAA=';
  assert.equal(buildHtmlImg(uri, 'My "pic"'), '<img src="data:image/png;base64,AAA=" alt="My &quot;pic&quot;">');
  assert.equal(buildCssBackground(uri), "background-image: url('data:image/png;base64,AAA=');");
  assert.equal(buildMarkdownImage(uri, 'Logo'), '![Logo](data:image/png;base64,AAA=)');
  assert.equal(buildMarkdownImage(uri, 'A [b]'), '![A b](data:image/png;base64,AAA=)');
  assert.equal(escapeHtmlAttr('a & b <c>'), 'a &amp; b &lt;c&gt;');
  assert.equal(downloadFilename('image/jpeg', 'photo'), 'photo.jpg');
  assert.equal(downloadFilename('image/svg+xml'), 'image.svg');
});

console.log('ALL ' + passed + ' TESTS PASSED');
