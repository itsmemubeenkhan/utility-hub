import assert from 'node:assert/strict';
import {
  textToBinary,
  binaryToText,
  detectBinary,
  byteTable,
  countBinary,
  SAMPLE_TEXT,
  SAMPLE_BINARY,
} from '/home/hatch/workspace/utility-hub/lib/binary-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; console.log('ok - ' + name); };

// Encode: UTF-8, separators, 7-bit mode
t('Hi encodes to spaced 8-bit groups', () => {
  assert.equal(textToBinary('Hi').output, '01001000 01101001');
});
t('separator none joins groups', () => {
  assert.equal(textToBinary('Hi', { separator: 'none' }).output, '0100100001101001');
});
t('separator comma joins with commas', () => {
  assert.equal(textToBinary('Hi', { separator: 'comma' }).output, '01001000,01101001');
});
t('accented e is two UTF-8 bytes, not one', () => {
  assert.equal(textToBinary('café').output, '01100011 01100001 01100110 11000011 10101001');
});
t('emoji is four UTF-8 bytes', () => {
  assert.equal(textToBinary('👋').output, '11110000 10011111 10010001 10001011');
});
t('7-bit mode encodes ASCII as 7 bits', () => {
  assert.equal(textToBinary('Hi', { bits: 7 }).output, '1001000 1101001');
});
t('7-bit mode rejects non-ASCII with named error', () => {
  const r = textToBinary('café', { bits: 7 });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'non-ascii');
});
t('empty text errors', () => {
  assert.equal(textToBinary('').error.code, 'empty');
});

// Decode: tolerant input, exact errors
t('spaced binary decodes to Hi', () => {
  assert.equal(binaryToText('01001000 01101001').output, 'Hi');
});
t('continuous binary decodes to Hi', () => {
  assert.equal(binaryToText('0100100001101001').output, 'Hi');
});
t('0b prefixes are tolerated', () => {
  assert.equal(binaryToText('0b01001000 0b01101001').output, 'Hi');
});
t('commas and newlines are tolerated as separators', () => {
  assert.equal(binaryToText('01001000,01101001\n').output, 'Hi');
});
t('invalid digit reports position', () => {
  const r = binaryToText('01001002 01101001');
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'invalid-digit');
  assert.equal(r.error.position, 7);
});
t('incomplete final group reports leftover count', () => {
  const r = binaryToText('0100100');
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'incomplete');
  assert.equal(r.error.position, 0);
});
t('invalid UTF-8 bytes report invalid-utf8', () => {
  const r = binaryToText('11111111');
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'invalid-utf8');
});
t('7-bit decode works', () => {
  assert.equal(binaryToText('1001000 1101001', { bits: 7 }).output, 'Hi');
});
t('empty binary errors', () => {
  assert.equal(binaryToText('   ').error.code, 'empty');
});

// Round trips
t('round trip Hello, World!', () => {
  const enc = textToBinary(SAMPLE_TEXT);
  assert.equal(enc.ok, true);
  assert.equal(enc.output, SAMPLE_BINARY);
  assert.equal(binaryToText(SAMPLE_BINARY).output, SAMPLE_TEXT);
});
t('round trip accents and emoji', () => {
  for (const s of ['café', '👋🌍', 'naïve façade', 'Здравствуй']) {
    assert.equal(binaryToText(textToBinary(s).output).output, s);
  }
});

// Detect + table + counts
t('detectBinary separates binary from text', () => {
  assert.equal(detectBinary('0100 0110'), true);
  assert.equal(detectBinary('0b01001000 01101001'), true);
  assert.equal(detectBinary('Hello'), false);
  assert.equal(detectBinary('01002'), false);
  assert.equal(detectBinary(''), false);
});
t('byteTable rows carry binary, hex and decimal', () => {
  const rows = byteTable('Hi');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { char: 'H', codePoint: 'U+0048', binary: '01001000', hex: '48', dec: '72', bytes: 1 });
  assert.deepEqual(rows[1], { char: 'i', codePoint: 'U+0069', binary: '01101001', hex: '69', dec: '105', bytes: 1 });
});
t('byteTable groups multi-byte chars in one row', () => {
  const rows = byteTable('é');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].binary, '11000011 10101001');
  assert.equal(rows[0].hex, 'C3 A9');
  assert.equal(rows[0].bytes, 2);
});
t('countBinary counts chars, bytes and groups', () => {
  assert.deepEqual(countBinary('Hi'), { chars: 2, bytes: 2, groups: 2 });
  assert.deepEqual(countBinary('café'), { chars: 4, bytes: 5, groups: 5 });
});

console.log('\nbinary-utils: ' + n + '/' + n + ' passed');
