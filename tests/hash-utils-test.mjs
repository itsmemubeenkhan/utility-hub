/* Node tests for lib/hash-utils.js. Run:
   node tests/hash-utils-test.mjs
   MD5 and HMAC-MD5 vectors are checked against Node's own crypto so a
   transcription slip in the RFC 1321 code cannot hide. */
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import {
  HASH_ALGOS, SAMPLE_TEXT, bytesToBase64, bytesToHex, detectHashAlgorithm,
  formatBytes, hmacMd5, md5, md5Base64, md5Hex, toUint8Array, utf8ByteLength,
} from '../lib/hash-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

const nodeMd5Hex = (input) => createHash('md5').update(input).digest('hex');
const nodeHmacMd5Hex = (key, input) => createHmac('md5', key).update(input).digest('hex');

await ok('RFC 1321 MD5 vectors: empty, abc, fox, long input', async () => {
  assert.equal(md5Hex(''), 'd41d8cd98f00b204e9800998ecf8427e');
  assert.equal(md5Hex('abc'), '900150983cd24fb0d6963f7d28e17f72');
  assert.equal(md5Hex('The quick brown fox jumps over the lazy dog'), '9e107d9d372bb6826bd81d3542a419d6');
  assert.equal(md5Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '8215ef0796a20bcaaae116d3876c664a');
  assert.equal(md5Hex('a'.repeat(1000000)), '7707d6ae4e027c70eea2a935c2296f21');
  assert.equal(md5Hex('message digest'), 'f96b697d7cb7938d525a2f31aaf161d0');
  assert.equal(md5Hex('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 'd174ab98d277d9f5a5611c2c9f419d9f');
});

await ok('MD5 matches Node crypto on unicode and long strings', async () => {
  const cases = [
    'héllo wörld ✓',
    'こんにちは世界',
    '😀 emoji hash test 🎉',
    'The quick brown fox jumps over the lazy dog'.repeat(20),
    'x'.repeat(55),
    'x'.repeat(56),
    'x'.repeat(63),
    'x'.repeat(64),
    'x'.repeat(65),
    'x'.repeat(119),
    'x'.repeat(120),
  ];
  for (const c of cases) {
    assert.equal(md5Hex(c), nodeMd5Hex(c), 'md5 mismatch for len ' + c.length);
  }
});

await ok('MD5 accepts Uint8Array and ArrayBuffer, same digest as string', async () => {
  const text = 'hello bytes';
  const bytes = new TextEncoder().encode(text);
  assert.equal(md5Hex(bytes), nodeMd5Hex(text));
  assert.equal(md5Hex(bytes.buffer), nodeMd5Hex(text));
  assert.equal(md5Hex(bytes.slice(0, 5)), nodeMd5Hex('hello'));
  assert.equal(bytesToHex(md5('abc')), '900150983cd24fb0d6963f7d28e17f72');
});

await ok('MD5 base64 output matches Node crypto', async () => {
  assert.equal(md5Base64('abc'), createHash('md5').update('abc').digest('base64'));
  assert.equal(md5Base64(''), createHash('md5').update('').digest('base64'));
  assert.equal(bytesToBase64(new Uint8Array([0, 1, 2, 255])), 'AAEC/w==');
  assert.equal(bytesToHex(new Uint8Array([0, 15, 255])), '000fff');
});

await ok('HMAC-MD5 matches Node crypto incl. long key', async () => {
  assert.equal(bytesToHex(hmacMd5('key', 'The quick brown fox jumps over the lazy dog')), nodeHmacMd5Hex('key', 'The quick brown fox jumps over the lazy dog'));
  assert.equal(bytesToHex(hmacMd5('', '')), nodeHmacMd5Hex('', ''));
  assert.equal(bytesToHex(hmacMd5('secret', 'hello')), nodeHmacMd5Hex('secret', 'hello'));
  assert.equal(bytesToHex(hmacMd5('k'.repeat(100), 'message')), nodeHmacMd5Hex('k'.repeat(100), 'message'));
  assert.equal(bytesToHex(hmacMd5('key', 'héllo ✓')), nodeHmacMd5Hex('key', 'héllo ✓'));
});

await ok('SHA-256 vector sanity (component uses Web Crypto; values must match Node)', async () => {
  assert.equal(createHash('sha256').update('abc').digest('hex'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(createHash('sha1').update('abc').digest('hex'), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  assert.equal(createHash('sha512').update('abc').digest('hex'), 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  assert.equal(createHash('sha384').update('abc').digest('hex'), 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7');
});

await ok('detectHashAlgorithm maps hex lengths, rejects the rest', async () => {
  assert.equal(detectHashAlgorithm(md5Hex('abc')), 'MD5');
  assert.equal(detectHashAlgorithm('a9993e364706816aba3e25717850c26c9cd0d89d'), 'SHA-1');
  assert.equal(detectHashAlgorithm('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'), 'SHA-256');
  assert.equal(detectHashAlgorithm('cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'), 'SHA-384');
  assert.equal(detectHashAlgorithm('ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'), 'SHA-512');
  assert.equal(detectHashAlgorithm('BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD'), 'SHA-256');
  assert.equal(detectHashAlgorithm('  ' + md5Hex('abc') + '\n'), 'MD5');
  assert.equal(detectHashAlgorithm('xyz'), null);
  assert.equal(detectHashAlgorithm('a'.repeat(31)), null);
  assert.equal(detectHashAlgorithm('a'.repeat(33)), null);
  assert.equal(detectHashAlgorithm(''), null);
  assert.equal(detectHashAlgorithm(null), null);
});

await ok('helpers: utf8 byte length, formatBytes, algo table', async () => {
  assert.equal(utf8ByteLength('abc'), 3);
  assert.equal(utf8ByteLength('é'), 2);
  assert.equal(utf8ByteLength('😀'), 4);
  assert.equal(utf8ByteLength(''), 0);
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(1500000), '1.43 MB');
  assert.equal(toUint8Array('abc').length, 3);
  assert.equal(HASH_ALGOS.length, 5);
  assert.deepEqual(HASH_ALGOS.map((a) => a.id), ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  assert.equal(md5Hex(SAMPLE_TEXT), '9e107d9d372bb6826bd81d3542a419d6');
});

console.log(`\n${passed} hash-utils tests passed`);
