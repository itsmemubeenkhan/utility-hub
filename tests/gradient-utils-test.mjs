/* Unit test for lib/gradient-utils.js: loads the real shipped source,
   strips the export keywords, and asserts the pure helpers. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const src = readFileSync(new URL('../lib/gradient-utils.js', import.meta.url), 'utf8').replace(
  /^export /gm,
  ''
);
const fns = new Function(
  src +
    '; return { normalizeHex, isValidHex, normalizeStops, defaultGradient, buildGradientCss, buildCssBlock, buildTailwindClass, hexLuminance, textOnGradient, mixHex, conicColorAt, buildGradientSvg, encodeGradientHash, decodeGradientHash, GRADIENT_PRESETS, MIN_STOPS, MAX_STOPS };'
)();
const {
  normalizeHex,
  isValidHex,
  normalizeStops,
  defaultGradient,
  buildGradientCss,
  buildCssBlock,
  buildTailwindClass,
  hexLuminance,
  textOnGradient,
  mixHex,
  conicColorAt,
  buildGradientSvg,
  encodeGradientHash,
  decodeGradientHash,
  GRADIENT_PRESETS,
  MIN_STOPS,
  MAX_STOPS,
} = fns;

// HEX validation + normalization
assert.equal(normalizeHex('#ff512f'), '#FF512F');
assert.equal(normalizeHex('ff512f'), '#FF512F');
assert.equal(normalizeHex('#f51'), '#FF5511');
assert.equal(normalizeHex('  #abc  '), '#AABBCC');
assert.equal(normalizeHex('#zzzzzz'), null);
assert.equal(normalizeHex('#12345'), null);
assert.equal(normalizeHex('#1234567'), null);
assert.equal(normalizeHex(''), null);
assert.equal(normalizeHex(null), null);
assert.equal(isValidHex('#fff'), true);
assert.equal(isValidHex('red'), false);

// Stop sorting + clamping + invalid dropping
assert.deepEqual(normalizeStops([
  { color: '#0000ff', position: 100 },
  { color: '#ff0000', position: -20 },
  { color: 'bogus', position: 50 },
]), [
  { color: '#FF0000', position: 0 },
  { color: '#0000FF', position: 100 },
]);
assert.deepEqual(normalizeStops([{ color: '#ff0000', position: 0 }]), []); // < 2 stops
assert.deepEqual(normalizeStops([
  { color: '#00ff00', position: 150 },
  { color: '#ff0000', position: 0 },
]), [
  { color: '#FF0000', position: 0 },
  { color: '#00FF00', position: 100 },
]);

// CSS string building: all 3 types
const linear = buildGradientCss({
  type: 'linear', angle: 135,
  stops: [{ color: '#ff512f', position: 0 }, { color: '#dd2476', position: 100 }],
});
assert.equal(linear.css, 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)');
assert.equal(linear.fallback, '#FF512F');

const radial = buildGradientCss({
  type: 'radial', radialShape: 'circle', radialPosition: 'top left',
  stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }],
});
assert.equal(radial.css, 'radial-gradient(circle at top left, #2193B0 0%, #6DD5ED 100%)');

const conic = buildGradientCss({
  type: 'conic', conicAngle: 45, conicX: 50, conicY: 50,
  stops: [{ color: '#fc466b', position: 0 }, { color: '#3f5efb', position: 100 }],
});
assert.equal(conic.css, 'conic-gradient(from 45deg at 50% 50%, #FC466B 0%, #3F5EFB 100%)');

// Unknown type / too few stops -> null
assert.equal(buildGradientCss({ type: 'weird', stops: [] }), null);
assert.equal(buildGradientCss({ type: 'linear', angle: 90, stops: [{ color: '#fff', position: 0 }] }), null);

// CSS block + Tailwind class
assert.equal(
  buildCssBlock({ type: 'linear', angle: 90, stops: [{ color: '#ff0000', position: 0 }, { color: '#0000ff', position: 100 }] }),
  'background-color: #FF0000;\nbackground: linear-gradient(90deg, #FF0000 0%, #0000FF 100%);'
);
assert.equal(
  buildTailwindClass({ type: 'linear', angle: 135, stops: [{ color: '#ff512f', position: 0 }, { color: '#dd2476', position: 100 }] }),
  'bg-[linear-gradient(135deg,_#FF512F_0%,_#DD2476_100%)]'
);
assert.ok(!buildTailwindClass({ type: 'linear', angle: 135, stops: [{ color: '#ff512f', position: 0 }, { color: '#dd2476', position: 100 }] }).includes(' '));

// Presets
assert.equal(GRADIENT_PRESETS.length, 8);
assert.deepEqual(GRADIENT_PRESETS.map((p) => p.id), ['sunset', 'ocean', 'forest', 'candy', 'dusk', 'fire', 'mint', 'royal']);
for (const p of GRADIENT_PRESETS) {
  assert.equal(normalizeStops(p.stops).length, 2);
  assert.ok(buildGradientCss({ ...defaultGradient(), stops: p.stops }));
}
assert.equal(MIN_STOPS, 2);
assert.equal(MAX_STOPS, 5);

// Luminance + text suggestion
assert.equal(hexLuminance('#FFFFFF'), 1);
assert.equal(hexLuminance('#000000'), 0);
assert.ok(hexLuminance('#FFFFFF') > hexLuminance('#333333'));
assert.equal(textOnGradient({ stops: [{ color: '#ffffff', position: 0 }, { color: '#eeeeee', position: 100 }] }).suggestion, 'dark');
assert.equal(textOnGradient({ stops: [{ color: '#000000', position: 0 }, { color: '#111111', position: 100 }] }).suggestion, 'light');
assert.equal(textOnGradient({ stops: [] }), null);

// Color mixing + conic interpolation
assert.equal(mixHex('#000000', '#FFFFFF', 0.5), '#808080');
assert.equal(mixHex('#FF0000', '#0000FF', 0), '#FF0000');
assert.equal(mixHex('#FF0000', '#0000FF', 1), '#0000FF');
const two = [{ color: '#FF0000', position: 0 }, { color: '#0000FF', position: 100 }];
assert.equal(conicColorAt(two, 0), '#FF0000');
assert.equal(conicColorAt(two, 0.5), '#800080');
assert.equal(conicColorAt(two, 1), '#FF0000'); // wraps back to first stop
assert.equal(conicColorAt(two, 0.25), '#BF0040');

// SVG generation: all 3 types, correct elements
const svgLinear = buildGradientSvg({ type: 'linear', angle: 90, stops: two }, 1200, 630);
assert.ok(svgLinear.includes('<linearGradient'));
assert.ok(svgLinear.includes('width="1200"') && svgLinear.includes('height="630"'));
assert.ok(svgLinear.includes('stop-color="#FF0000"'));
const svgRadial = buildGradientSvg({ type: 'radial', radialShape: 'circle', radialPosition: 'center', stops: two });
assert.ok(svgRadial.includes('<radialGradient'));
const svgConic = buildGradientSvg({ type: 'conic', conicAngle: 0, conicX: 50, conicY: 50, stops: two });
assert.ok(svgConic.includes('<path d="M'));
assert.equal((svgConic.match(/<path /g) || []).length, 72); // 360 / 5deg wedges
assert.equal(buildGradientSvg({ type: 'linear', angle: 90, stops: [{ color: '#fff', position: 0 }] }), null);

// Share-link hash round trip
const state = {
  type: 'radial', angle: 135, radialShape: 'circle', radialPosition: 'bottom right',
  conicAngle: 0, conicX: 50, conicY: 50,
  stops: [{ color: '#4776E6', position: 0 }, { color: '#8E54E9', position: 100 }],
};
const hash = encodeGradientHash(state);
assert.ok(hash.length > 0 && !hash.includes('+') && !hash.includes('/') && !hash.includes('='));
assert.deepEqual(decodeGradientHash(hash), state);
assert.equal(decodeGradientHash('!!!not-base64!!!'), null);
assert.equal(decodeGradientHash(''), null);
assert.equal(decodeGradientHash(encodeGradientHash({ type: 'linear', stops: [{ color: '#fff', position: 0 }] })), null);

// Default state builds cleanly
const dflt = defaultGradient();
assert.equal(dflt.type, 'linear');
assert.equal(dflt.stops.length, 2);
assert.ok(buildGradientCss(dflt));

console.log('gradient-utils: all assertions passed');
