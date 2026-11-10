/* Node tests for lib/js-minifier-utils.js (safe-mode scanner) and the
   Terser path the component uses. Run: node tests/js-minifier-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  minifyJsSafe, beautifyJsSafe, countJs, savedPercent, SAMPLE_JS, scanJs,
} from '../lib/js-minifier-utils.js';
import { minify } from 'terser';

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
const parses = (code) => {
  new Function(code);
};

ok('safe minify strips comments but keeps strings, template and regex', () => {
  const src = '/* hello */ const s = "a  b"; const t = `x ${1 + 2} y`; const r = /^A/.test("Ada"); // tail\nconst n = 5;';
  const out = minifyJsSafe(src);
  assert.ok(!out.includes('hello') && !out.includes('tail'), 'comments gone: ' + out);
  assert.ok(out.includes('"a  b"'), 'string spaces intact: ' + out);
  assert.ok(out.includes('`x ${1 + 2} y`'), 'template intact: ' + out);
  assert.ok(out.includes('/^A/.test("Ada")'), 'regex intact: ' + out);
  assert.ok(out.includes('const n=5;') || out.includes('const n = 5;'), 'code kept: ' + out);
  parses(out);
});

ok('license comment kept by default, dropped when keepImportant is false', () => {
  const src = '/*! (c) 2026 Me */ const a = 1; /* note */ const b = 2;';
  assert.ok(minifyJsSafe(src).includes('/*! (c) 2026 Me */'), 'license kept');
  assert.ok(!minifyJsSafe(src, { keepImportant: false }).includes('/*!'), 'license dropped');
  assert.ok(!minifyJsSafe(src).includes('note'), 'plain comment dropped');
});

ok('ASI: newline after return is kept', () => {
  const out = minifyJsSafe('function f() {\n  return\n  42;\n}');
  assert.ok(out.includes('return\n42'), 'return newline kept: ' + JSON.stringify(out));
  parses(out);
});

ok('ASI: newline between two statements is kept', () => {
  const out = minifyJsSafe('const a = 1\nconst b = 2');
  assert.ok(out.includes('1\nconst b'), 'statement break kept: ' + JSON.stringify(out));
  parses(out);
  const out2 = minifyJsSafe('foo()\nbar()');
  assert.ok(out2.includes('()\nbar()'), 'call break kept: ' + JSON.stringify(out2));
  parses(out2);
});

ok('ASI: ambiguous + continuation keeps its newline', () => {
  const out = minifyJsSafe('const x = a\n+ b;');
  assert.ok(out.includes('a\n+ b') || out.includes('a\n+b'), 'plus break kept: ' + JSON.stringify(out));
  parses(out);
});

ok('member access across a newline joins safely', () => {
  const out = minifyJsSafe('foo\n.bar()\n.baz();');
  assert.ok(out.includes('foo.bar().baz();'), 'joined: ' + out);
  parses(out);
});

ok('regex with slash inside a character class survives', () => {
  const src = 'const p = /[/]/; const q = /a\\/b/g;';
  const out = minifyJsSafe(src);
  assert.ok(out.includes('/[/]/'), 'class slash kept: ' + out);
  assert.ok(out.includes('/a\\/b/g'), 'escaped slash kept: ' + out);
  parses(out);
});

ok('nested template literal inside ${} survives', () => {
  const src = 'const s = `x ${a ? `y ${b}` : "z"}`;';
  const out = minifyJsSafe(src);
  assert.ok(out.includes('`x ${a ? `y ${b}` : "z"}`'), 'nested template kept: ' + out);
  parses(out);
});

ok('sample minifies, parses and saves bytes', () => {
  const out = minifyJsSafe(SAMPLE_JS);
  assert.ok(out.length < SAMPLE_JS.length, `shorter: ${out.length} < ${SAMPLE_JS.length}`);
  parses(out);
  assert.ok(Number(savedPercent(SAMPLE_JS, out)) > 10, 'saved > 10%: ' + savedPercent(SAMPLE_JS, out));
  const stats = countJs(SAMPLE_JS);
  assert.ok(stats.functions >= 2, 'functions: ' + stats.functions);
  assert.ok(stats.comments >= 1, 'comments: ' + stats.comments);
  assert.ok(stats.lines > 10, 'lines: ' + stats.lines);
});

ok('safe beautify re-indents minified code and still parses', () => {
  const min = minifyJsSafe(SAMPLE_JS);
  const pretty = beautifyJsSafe(min);
  assert.ok(pretty.includes('{\n  '), 'indented block: ' + JSON.stringify(pretty.slice(0, 120)));
  assert.ok(pretty.split('\n').length > 10, 'multi-line');
  parses(pretty);
  const pretty2 = beautifyJsSafe('const a={x:1,y:2};if(a.x){console.log(a.y);}');
  assert.ok(pretty2.includes('if (a.x) {') || pretty2.includes('if(a.x) {'), 'if kept: ' + JSON.stringify(pretty2));
  parses(pretty2);
});

ok('scanJs segments never split inside strings', () => {
  const segs = scanJs('const s = "a;b{ c"; const t = 1;');
  const code = segs.filter((s) => s.type === 'code').map((s) => s.text).join('');
  assert.ok(!code.includes('a;b'), 'string content not in code segments');
});

const res = await minify(SAMPLE_JS, {
  compress: { drop_console: true }, mangle: true, format: { comments: false },
});
assert.ok(!res.error, 'no terser error: ' + (res.error && res.error.message));
assert.ok(!res.code.includes('console'), 'console dropped');
assert.ok(res.code.length < minifyJsSafe(SAMPLE_JS).length, `terser ${res.code.length} < safe ${minifyJsSafe(SAMPLE_JS).length}`);
parses(res.code);
/* Terser throws on a parse error (it does not always return { error }),
   so the component must wrap minify() in try/catch. */
let terserErr = null;
try {
  const bad = await minify('const a = ;', { compress: false, mangle: false });
  terserErr = bad.error || null;
} catch (e) {
  terserErr = e;
}
assert.ok(terserErr, 'syntax error surfaces as an error');
assert.ok(/Unexpected token/.test(terserErr.message), 'error message: ' + terserErr.message);
const pretty = await minify('const a={x:1,y:2};', { compress: false, mangle: false, format: { beautify: true, indent_level: 2 } });
assert.ok(pretty.code.includes('\n'), 'terser beautify is multi-line');
parses(pretty.code);
passed += 1;
console.log('ok - Terser (component engine) minifies the sample smaller than safe mode and drops console');

console.log(`\n${passed} js-minifier tests passed`);
