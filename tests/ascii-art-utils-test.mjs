/* Node tests for lib/ascii-art-utils.js. Run:
   node tests/ascii-art-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  ASCII_CHARSETS, SAMPLE_BANNER_TEXT, adjustPixel, asciiDimensions,
  asciiStats, brightnessToChar, demoPatternBrightness, getCharset,
  gridToAsciiRows, pixelBrightness, rowsToText,
} from '../lib/ascii-art-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

await ok('darkest brightness maps to @, lightest to space (standard ramp)', async () => {
  assert.equal(brightnessToChar(0, 'standard'), '@');
  assert.equal(brightnessToChar(255, 'standard'), ' ');
  assert.equal(brightnessToChar(0, 'simple'), '@');
  assert.equal(brightnessToChar(255, 'simple'), ' ');
  assert.equal(brightnessToChar(0, 'blocks'), '\u2588');
  assert.equal(brightnessToChar(255, 'blocks'), ' ');
});

await ok('mid brightness maps to a middle character, ramp is monotonic', async () => {
  const ramp = getCharset('standard').chars;
  let prev = 10;
  for (let b = 0; b <= 255; b += 17) {
    const idx = ramp.indexOf(brightnessToChar(b, 'standard'));
    assert.ok(idx <= prev, `ramp not monotonic at brightness ${b}`);
    prev = idx;
  }
  assert.equal(brightnessToChar(128, 'standard'), '=');
});

await ok('invert flips the ramp end to end', async () => {
  assert.equal(brightnessToChar(0, 'standard', true), ' ');
  assert.equal(brightnessToChar(255, 'standard', true), '@');
  assert.equal(brightnessToChar(128, 'standard', true), brightnessToChar(127, 'standard'));
});

await ok('unknown charset id falls back to standard', async () => {
  assert.equal(getCharset('nope').id, 'standard');
  assert.equal(brightnessToChar(0, 'nope'), '@');
  for (const c of ASCII_CHARSETS) assert.ok(c.chars.length >= 4, c.id + ' ramp too short');
});

await ok('pixel brightness uses luma weights (green brightest, blue darkest)', async () => {
  assert.equal(pixelBrightness(255, 255, 255), 255);
  assert.equal(pixelBrightness(0, 0, 0), 0);
  assert.ok(pixelBrightness(0, 255, 0) > pixelBrightness(255, 0, 0));
  assert.ok(pixelBrightness(255, 0, 0) > pixelBrightness(0, 0, 255));
  assert.equal(Math.round(pixelBrightness(100, 150, 200)), 141);
});

await ok('adjustPixel clamps, contrast 0 and brightness 0 are identity', async () => {
  assert.equal(adjustPixel(100, 0, 0), 100);
  assert.equal(adjustPixel(0, -100, 0), 0);
  assert.equal(adjustPixel(255, 100, 0), 255);
  assert.equal(adjustPixel(200, 50, 0), 250);
  assert.ok(adjustPixel(200, 0, 50) > 200, 'positive contrast brightens bright pixels');
  assert.ok(adjustPixel(50, 0, 50) < 50, 'positive contrast darkens dark pixels');
  assert.equal(adjustPixel(128, 0, 100), 128, 'contrast pivots on 128');
});

await ok('asciiDimensions halves rows for char aspect and clamps', async () => {
  assert.deepEqual(asciiDimensions(800, 400, 100), { width: 100, height: 25 });
  assert.deepEqual(asciiDimensions(400, 400, 80), { width: 80, height: 40 });
  assert.deepEqual(asciiDimensions(100, 1000, 200), { width: 200, height: 300 }, 'tall image capped at 300 rows');
  assert.deepEqual(asciiDimensions(100, 100, 5), { width: 10, height: 5 }, 'width floored at 10');
});

await ok('gridToAsciiRows maps a gradient and keeps colors', async () => {
  const grid = [
    [0, 64, 128, 192, 255],
    [{ b: 0, r: 10, g: 20, bl: 30 }, { b: 255, r: 200, g: 210, bl: 220 }],
  ];
  const rows = gridToAsciiRows(grid, 'standard');
  assert.equal(rows[0].map((c) => c.ch).join(''), '@#=: ');
  assert.equal(rows[1][0].ch, '@');
  assert.equal(rows[1][0].r, 10);
  assert.equal(rows[1][0].bl, 30);
  assert.equal(rows[1][1].ch, ' ');
  assert.equal(rowsToText(rows), '@#=: \n@ ');
  const inv = gridToAsciiRows([[0, 255]], 'standard', { invert: true });
  assert.equal(rowsToText(inv), ' @');
});

await ok('asciiStats counts chars, lines and non-space chars', async () => {
  assert.deepEqual(asciiStats('@#=: \n@ '), { chars: 7, lines: 2, nonSpace: 5 });
  assert.deepEqual(asciiStats(''), { chars: 0, lines: 0, nonSpace: 0 });
});

await ok('demo pattern is bright in the circle, dark at the bottom corners', async () => {
  const w = 100;
  const h = 50;
  const center = demoPatternBrightness(50, 22, w, h);
  const corner = demoPatternBrightness(0, 49, w, h);
  assert.ok(center > 200, 'circle center bright, got ' + center);
  assert.ok(corner < 80, 'bottom corner dark, got ' + corner);
  const top = demoPatternBrightness(0, 0, w, h);
  assert.ok(top > corner, 'sky gradient gets darker toward the bottom');
});

await ok('sample banner text is set', async () => {
  assert.ok(SAMPLE_BANNER_TEXT.length > 0);
});

console.log(`\n${passed} tests passed`);
