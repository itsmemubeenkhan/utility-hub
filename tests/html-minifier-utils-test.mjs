/* Node tests for lib/html-minifier-utils.js. Run: node tests/html-minifier-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  minifyHtml, beautifyHtml, countHtml, savedPercent, SAMPLE_HTML, scanHtml,
} from '../lib/html-minifier-utils.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

ok('sample minifies and saves a real percentage', () => {
  const out = minifyHtml(SAMPLE_HTML);
  const pct = Number(savedPercent(SAMPLE_HTML, out));
  assert.ok(pct >= 20, `expected >=20% saved, got ${pct}%: ${out}`);
  assert.ok(out.length < SAMPLE_HTML.length, 'output shorter than input');
  assert.ok(out.startsWith('<!DOCTYPE html>'), 'doctype kept: ' + out.slice(0, 40));
});

ok('pre content preserved byte for byte', () => {
  const out = minifyHtml(SAMPLE_HTML);
  assert.ok(out.includes('  Keep   this\n    spacing exactly.\n'), 'pre verbatim: ' + JSON.stringify(out));
});

ok('textarea and script contents preserved, including < inside script', () => {
  const src = '<textarea name="x">  hello\n  world  </textarea><script>const x = 1 < 2; const s = "<b>nope</b>"; // c\n</script>';
  const out = minifyHtml(src);
  assert.ok(out.includes('  hello\n  world  '), 'textarea verbatim: ' + out);
  assert.ok(out.includes('const x = 1 < 2;'), 'script < kept: ' + out);
  assert.ok(out.includes('"<b>nope</b>"'), 'script tag-like string kept: ' + out);
  assert.ok(out.includes('// c'), 'script comment kept: ' + out);
});

ok('style content preserved verbatim', () => {
  const src = '<style>\n  body { color: red; }\n</style><p>x</p>';
  const out = minifyHtml(src);
  assert.ok(out.includes('body { color: red; }'), 'style kept: ' + out);
});

ok('conditional comments kept, ordinary comments removed', () => {
  const src = '<!--[if IE 9]><p>old browser</p><![endif]--><!-- plain --><p>x</p>';
  const out = minifyHtml(src);
  assert.ok(out.includes('[if IE 9]'), 'conditional kept: ' + out);
  assert.ok(!out.includes('plain'), 'plain comment gone: ' + out);
  const kept = minifyHtml(src, { removeComments: false });
  assert.ok(kept.includes('plain'), 'comments kept when toggle off: ' + kept);
});

ok('doctype preserved and normalised', () => {
  const out = minifyHtml('<!DOCTYPE   html><p>x</p>');
  assert.ok(out.startsWith('<!DOCTYPE html>'), 'doctype: ' + out);
});

ok('word space between inline elements survives', () => {
  const out = minifyHtml('<p><b>Hello</b> <i>world</i>, and <a href="https://example.com">more</a> text.</p>');
  assert.ok(out.includes('</b> <i>'), 'space kept: ' + out);
  assert.ok(out.includes('</i>, and <a'), 'space kept 2: ' + out);
  assert.ok(out.includes('</a> text.'), 'space kept 3: ' + out);
});

ok('whitespace between block tags is dropped', () => {
  const out = minifyHtml('<div>\n  <p>one</p>\n  <p>two</p>\n</div>');
  assert.equal(out, '<div><p>one<p>two</div>', 'got: ' + out);
});

ok('attribute quotes removed only when safe', () => {
  const out = minifyHtml('<div class="card" id="main" data-x="a b" title="hi!"><a href="https://example.com">x</a></div>');
  assert.ok(out.includes('class=card'), 'class unquoted: ' + out);
  assert.ok(out.includes('id=main'), 'id unquoted: ' + out);
  assert.ok(out.includes('data-x="a b"'), 'spaced value keeps quotes: ' + out);
  assert.ok(out.includes('title="hi!"'), 'punctuated value keeps quotes: ' + out);
  assert.ok(out.includes('href="https://example.com"'), 'URL keeps quotes: ' + out);
  const kept = minifyHtml('<div class="card">x</div>', { removeAttributeQuotes: false });
  assert.ok(kept.includes('class="card"'), 'quotes kept when toggle off: ' + kept);
});

ok('optional end tags dropped only where the spec allows', () => {
  const out = minifyHtml('<html><head><title>t</title></head><body><p>one</p><ul><li>a</li><li>b</li></ul></body></html>');
  assert.ok(!out.includes('</html>') && !out.includes('</head>') && !out.includes('</body>'), 'always-optional gone: ' + out);
  assert.ok(!out.includes('</p>'), 'p before ul gone: ' + out);
  assert.ok(!out.includes('</li>'), 'li before li gone: ' + out);
  assert.ok(out.includes('</ul>'), 'ul close kept: ' + out);
  const kept = minifyHtml('<html><body><p>x</p></body></html>', { removeOptionalTags: false });
  assert.ok(kept.includes('</html>') && kept.includes('</p>'), 'kept when toggle off: ' + kept);
});

ok('boolean attributes shorten to bare names', () => {
  const out = minifyHtml('<input type="checkbox" checked="checked" disabled="disabled" required>');
  assert.ok(out.includes(' checked '), 'checked bare: ' + out);
  assert.ok(out.includes(' disabled '), 'disabled bare: ' + out);
  assert.ok(out.includes(' required>'), 'required bare: ' + out);
  assert.ok(!out.includes('checked="'), 'no quoted boolean left: ' + out);
});

ok('quoted > inside an attribute never ends the tag', () => {
  const src = '<a title="a > b" href="x">y</a>';
  const out = minifyHtml(src);
  assert.ok(out.includes('title="a > b"'), 'attr intact: ' + out);
  assert.ok(out.includes('>y</a>'), 'tag closed right: ' + out);
});

ok('collapseWhitespace off keeps text spacing', () => {
  const src = '<div>\n  <p>  spaced   text  </p>\n</div>';
  const out = minifyHtml(src, { collapseWhitespace: false });
  assert.ok(out.includes('  spaced   text  '), 'spaces kept: ' + JSON.stringify(out));
});

ok('empty and text-only input pass through safely', () => {
  assert.equal(minifyHtml(''), '');
  assert.equal(minifyHtml('plain text, no tags'), 'plain text, no tags');
  assert.equal(minifyHtml('<p>unclosed'), '<p>unclosed');
});

ok('beautify re-indents minified HTML and keeps pre content', () => {
  const min = minifyHtml(SAMPLE_HTML);
  const pretty = beautifyHtml(min);
  assert.ok(pretty.includes('\n    <main'), 'nested indent: ' + JSON.stringify(pretty.slice(0, 300)));
  assert.ok(pretty.includes('  Keep   this\n    spacing exactly.'), 'pre verbatim in beautify: ' + JSON.stringify(pretty));
  assert.ok(pretty.split('\n').length > 10, 'multi-line output');
});

ok('beautify round-trips: minify(beautify(x)) equals minify(x)', () => {
  const a = minifyHtml(SAMPLE_HTML);
  const b = minifyHtml(beautifyHtml(a));
  assert.equal(b, a, 'round trip differs:\n' + a + '\n---\n' + b);
});

ok('countHtml counts tags and comments, not script strings', () => {
  const c = countHtml('<p>x</p><!-- hi --><script>const s = "<p>fake</p>";</script>');
  assert.equal(c.tags, 4, 'tags: ' + JSON.stringify(c));
  assert.equal(c.comments, 1, 'comments: ' + JSON.stringify(c));
});

ok('savedPercent math', () => {
  assert.equal(savedPercent('abcdefghij', 'abcde'), '50');
  assert.equal(savedPercent('', ''), '0');
  assert.equal(savedPercent('abc', 'abc'), '0');
});

ok('scanHtml segments a full page', () => {
  const segs = scanHtml('<!DOCTYPE html><!-- c --><div class="x">hi</div>');
  assert.equal(segs.map((s) => s.type).join(','), 'doctype,comment,tag,text,tag');
  assert.equal(segs[2].tagName, 'div');
});

console.log(`\n${passed} tests passed`);
