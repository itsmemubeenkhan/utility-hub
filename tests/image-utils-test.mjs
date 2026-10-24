/* Unit test for lib/image-utils.js: loads the real shipped source,
   strips the export keywords, and asserts the pure helpers. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const src = readFileSync(new URL('../lib/image-utils.js', import.meta.url), 'utf8').replace(
  /^export /gm,
  ''
);
const fns = new Function(
  src + '; return { formatBytes, fitDimensions, outputExtension, compressedName, savedPercent, qualitySteps, scaleSteps };'
)();
const { formatBytes, fitDimensions, outputExtension, compressedName, savedPercent, qualitySteps, scaleSteps } = fns;

assert.equal(formatBytes(0), '0 B');
assert.equal(formatBytes(512), '512 B');
assert.equal(formatBytes(1024), '1.00 KB');
assert.equal(formatBytes(102400), '100 KB');
assert.equal(formatBytes(1536), '1.50 KB');
assert.equal(formatBytes(5 * 1024 * 1024), '5.00 MB');

assert.deepEqual(fitDimensions(4000, 3000, 1920, 1920), { width: 1920, height: 1440 });
assert.deepEqual(fitDimensions(800, 600, 1920, 1920), { width: 800, height: 600 }); // never upscale
assert.deepEqual(fitDimensions(100, 4000, 1920, 1920), { width: 48, height: 1920 });

assert.equal(outputExtension('image/png'), 'png');
assert.equal(outputExtension('image/webp'), 'webp');
assert.equal(outputExtension('image/jpeg'), 'jpg');
assert.equal(outputExtension('image/gif'), 'jpg');

assert.equal(compressedName('photo.jpg', 'jpg'), 'photo-compressed.jpg');
assert.equal(compressedName('my.scan.png', 'webp'), 'my.scan-compressed.webp');

assert.equal(savedPercent(1000, 250), 75);
assert.equal(savedPercent(1000, 1000), 0);
assert.equal(savedPercent(0, 0), 0);

assert.ok(qualitySteps()[0] === 0.95 && qualitySteps().at(-1) === 0.1);
assert.ok(scaleSteps()[0] === 1 && scaleSteps().at(-1) === 0.3);

console.log('image-utils: all assertions passed');
