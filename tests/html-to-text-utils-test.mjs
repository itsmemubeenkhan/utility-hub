/* Node tests for lib/html-to-text-utils.js. Run: node tests/html-to-text-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  htmlToText, countHtmlToText, decodeEntities, SAMPLE_HTML,
} from '../lib/html-to-text-utils.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

ok('sample converts with headings, lists, table and pre', () => {
  const out = htmlToText(SAMPLE_HTML);
  assert.ok(out.includes('Welcome to UtilityHub'), 'heading: ' + out);
  assert.ok(out.includes('This is bold and italic text with a link (https://example.com).'), 'link url: ' + out);
  assert.ok(out.includes('• First item'), 'bullet: ' + out);
  assert.ok(out.includes('  • Nested item'), 'nested indent: ' + out);
  assert.ok(out.includes('1. Step one'), 'ordered: ' + out);
  assert.ok(out.includes('Name\tPrice'), 'table header: ' + out);
  assert.ok(out.includes('Widget\t$10'), 'table row: ' + out);
  assert.ok(out.includes('  Keep   this\n    spacing exactly.'), 'pre verbatim: ' + JSON.stringify(out));
  assert.ok(out.includes('[Company logo]'), 'alt text: ' + out);
  assert.ok(!out.includes('this never runs'), 'script stripped: ' + out);
  assert.ok(!out.includes('font-family'), 'style stripped: ' + out);
  assert.ok(!out.includes('Sample Page'), 'head/title stripped: ' + out);
  assert.ok(!out.includes('<'), 'no tags left: ' + out);
});

ok('block separation: paragraphs and headings separated by a blank line', () => {
  const out = htmlToText('<h1>Title</h1><p>Para one.</p><p>Para two.</p>');
  assert.equal(out, 'Title\n\nPara one.\n\nPara two.');
});

ok('br becomes a line break', () => {
  const out = htmlToText('<p>Line one<br>Line two<br/>Line three</p>');
  assert.equal(out, 'Line one\nLine two\nLine three');
});

ok('div and section start on new lines', () => {
  const out = htmlToText('<div>First</div><div>Second</div><section>Third</section>');
  assert.equal(out, 'First\nSecond\nThird');
});

ok('unordered list bullets, ordered list numbers, nested indent', () => {
  const out = htmlToText('<ul><li>One</li><li>Two<ul><li>Nested</li></ul></li></ul><ol><li>A</li><li>B</li></ol>');
  assert.equal(out, '• One\n• Two\n  • Nested\n1. A\n2. B');
});

ok('table rows on new lines, cells tab-separated', () => {
  const out = htmlToText('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>');
  assert.equal(out, 'a\tb\nc\td');
});

ok('link URL option on and off', () => {
  const src = '<p>See <a href="https://example.com/page">Example</a> now.</p>';
  assert.equal(htmlToText(src), 'See Example (https://example.com/page) now.');
  assert.equal(htmlToText(src, { showLinkUrls: false }), 'See Example now.');
  assert.equal(htmlToText('<p><a href="https://x.com">X</a></p>', { showLinkUrls: false }), 'X');
});

ok('image alt text as [alt], off when disabled', () => {
  const src = '<p><img src="a.png" alt="A photo"> caption</p>';
  assert.equal(htmlToText(src), '[A photo] caption');
  assert.equal(htmlToText(src, { keepAltText: false }), 'caption');
  assert.equal(htmlToText('<p><img src="a.png"> caption</p>'), 'caption');
});

ok('entities decoded: named, decimal, hex, nbsp', () => {
  assert.equal(decodeEntities('Fish &amp; Chips &copy; 2026'), 'Fish & Chips © 2026');
  assert.equal(decodeEntities('&#169; &#x2014; &mdash; &hellip;'), '© — — …');
  assert.equal(htmlToText('<p>Tom &amp; Jerry &nbsp; sat&nbsp;down</p>'), 'Tom & Jerry sat down');
  assert.equal(decodeEntities('&unknown; stays'), '&unknown; stays');
});

ok('script, style and head content stripped, comments dropped', () => {
  const src = '<head><title>T</title><style>p{color:red}</style></head><body><!-- hi --><p>Real</p><script>alert(1)</script></body>';
  assert.equal(htmlToText(src), 'Real');
});

ok('pre keeps line breaks verbatim', () => {
  const src = '<pre>line 1\n  indented\n\nline 4</pre>';
  assert.equal(htmlToText(src), 'line 1\n  indented\n\nline 4');
});

ok('uppercase headings option', () => {
  assert.equal(htmlToText('<h2>Small heading</h2><p>body</p>', { uppercaseHeadings: true }), 'SMALL HEADING\n\nbody');
  assert.equal(htmlToText('<h2>Small heading</h2><p>body</p>'), 'Small heading\n\nbody');
});

ok('empty and invalid input return empty string', () => {
  assert.equal(htmlToText(''), '');
  assert.equal(htmlToText('   '), '');
  assert.equal(htmlToText(null), '');
  assert.equal(htmlToText(undefined), '');
  assert.equal(htmlToText('<p>unclosed'), 'unclosed');
  assert.equal(htmlToText('plain text, no tags'), 'plain text, no tags');
  assert.equal(htmlToText('<div><span>broken'), 'broken');
});

ok('inline spacing never joins words', () => {
  assert.equal(htmlToText('<p><b>Hello</b> <i>world</i>, and <a href="https://e.com">more</a> text.</p>'), 'Hello world, and more (https://e.com) text.');
});

ok('counts: chars, words, lines, tags removed', () => {
  const out = htmlToText('<p>Hello world</p><p>Second line</p>');
  const c = countHtmlToText('<p>Hello world</p><p>Second line</p>', out);
  assert.equal(c.chars, out.length);
  assert.equal(c.words, 4);
  assert.equal(c.lines, 3);
  assert.ok(c.tagsRemoved >= 4, 'tags: ' + c.tagsRemoved);
  const empty = countHtmlToText('', '');
  assert.deepEqual(empty, { chars: 0, words: 0, lines: 0, tagsRemoved: 0 });
});

console.log(`\n${passed} tests passed`);
