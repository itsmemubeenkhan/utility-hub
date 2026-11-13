/* Node tests for lib/json-xml-utils.js. Run: node tests/json-xml-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  jsonToXml, convertJsonToXml, validateJson, escapeXmlText,
  escapeXmlAttr, sanitizeXmlName, SAMPLE_JSON, DEFAULT_OPTIONS,
} from '../lib/json-xml-utils.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

ok('nested object with default root and declaration', () => {
  const { xml, stats, warnings } = jsonToXml({ user: { name: 'Ada', age: 36, active: true } });
  assert.equal(warnings.length, 0);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<root>'), xml);
  assert.ok(xml.includes('<user>\n    <name>Ada</name>\n    <age>36</age>\n    <active>true</active>\n  </user>'), xml);
  assert.equal(stats.elements, 5);
  assert.equal(stats.attributes, 0);
  assert.equal(stats.depth, 3);
});

ok('arrays repeat the item element', () => {
  const { xml, stats } = jsonToXml({ book: [{ title: 'A' }, { title: 'B' }] }, { declaration: false });
  assert.ok(xml.includes('<item>\n    <title>A</title>\n  </item>'), xml);
  assert.ok(xml.includes('<item>\n    <title>B</title>\n  </item>'), xml);
  assert.ok(!xml.includes('<book>'), xml);
  assert.equal(stats.elements, 5);
});

ok('custom item name and root name', () => {
  const { xml } = jsonToXml({ book: ['A', 'B'] }, { declaration: false, rootName: 'catalog', itemName: 'book' });
  assert.ok(xml.startsWith('<catalog>'), xml);
  assert.ok(xml.includes('<book>A</book>'), xml);
  assert.ok(xml.includes('<book>B</book>'), xml);
});

ok('@attribute and #text on the same element', () => {
  const { xml, stats } = jsonToXml(
    { note: { '@lang': 'en', '@id': 'n1', '#text': 'Hello' } },
    { declaration: false },
  );
  assert.equal(xml, '<root>\n  <note lang="en" id="n1">Hello</note>\n</root>');
  assert.equal(stats.attributes, 2);
  assert.equal(stats.elements, 2);
});

ok('null modes: empty, omit, nil', () => {
  const value = { a: 1, b: null };
  const empty = jsonToXml(value, { declaration: false, nullMode: 'empty' });
  assert.ok(empty.xml.includes('<b/>'), empty.xml);
  const omit = jsonToXml(value, { declaration: false, nullMode: 'omit' });
  assert.ok(!omit.xml.includes('<b'), omit.xml);
  assert.ok(omit.xml.includes('<a>1</a>'), omit.xml);
  const nil = jsonToXml(value, { declaration: false, nullMode: 'nil' });
  assert.ok(nil.xml.includes('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'), nil.xml);
  assert.ok(nil.xml.includes('<b xsi:nil="true"/>'), nil.xml);
});

ok('invalid key repair with warnings', () => {
  const { xml, warnings } = jsonToXml({ '2nd place': 'x', 'price usd': 5, '': 'y' }, { declaration: false });
  assert.ok(xml.includes('<_2nd_place>x</_2nd_place>'), xml);
  assert.ok(xml.includes('<price_usd>5</price_usd>'), xml);
  assert.ok(xml.includes('<element>y</element>'), xml);
  assert.equal(warnings.length, 3);
  assert.ok(warnings[0].includes('"2nd place"'), warnings[0]);
});

ok('escaping of < & > in text and attributes', () => {
  assert.equal(escapeXmlText('a < b & c > d'), 'a &lt; b &amp; c &gt; d');
  assert.equal(escapeXmlAttr('say "hi" & \'bye\''), 'say &quot;hi&quot; &amp; &apos;bye&apos;');
  const { xml } = jsonToXml({ s: 'Tom & Jerry <Tales>', '@q': 'a"b' }, { declaration: false });
  assert.ok(xml.includes('<s>Tom &amp; Jerry &lt;Tales&gt;</s>'), xml);
  assert.ok(xml.includes('q="a&quot;b"'), xml);
  assert.ok(!xml.includes('Tom & Jerry'), xml);
});

ok('invalid JSON error carries line and column', () => {
  const bad = '{\n  "a": 1,\n  "b": tru\n}';
  const res = validateJson(bad);
  assert.equal(res.ok, false);
  assert.equal(res.error.line, 3);
  assert.ok(res.error.column >= 8, 'column ' + res.error.column);
  const conv = convertJsonToXml(bad);
  assert.equal(conv.ok, false);
  assert.equal(conv.error.line, 3);
});

ok('top-level array, scalar and null', () => {
  const arr = jsonToXml([1, 'two', true], { declaration: false });
  assert.equal(arr.xml, '<root>\n  <item>1</item>\n  <item>two</item>\n  <item>true</item>\n</root>');
  const scalar = jsonToXml('hello', { declaration: false });
  assert.equal(scalar.xml, '<root>hello</root>');
  const nul = jsonToXml(null, { declaration: false });
  assert.equal(nul.xml, '<root/>');
});

ok('indent options: 4 spaces and tab', () => {
  const four = jsonToXml({ a: { b: 1 } }, { declaration: false, indent: '    ' });
  assert.ok(four.xml.includes('<a>\n        <b>1</b>\n    </a>'), four.xml);
  const tab = jsonToXml({ a: { b: 1 } }, { declaration: false, indent: '\t' });
  assert.ok(tab.xml.includes('<a>\n\t\t<b>1</b>\n\t</a>'), tab.xml);
});

ok('declaration off and depth counting on deep nesting', () => {
  const { xml, stats } = jsonToXml({ a: { b: { c: { d: 1 } } } }, { declaration: false });
  assert.ok(!xml.startsWith('<?xml'), xml);
  assert.equal(stats.depth, 5);
  assert.equal(stats.elements, 5);
});

ok('sample JSON converts cleanly except the one repaired key', () => {
  const conv = convertJsonToXml(SAMPLE_JSON);
  assert.equal(conv.ok, true);
  assert.ok(conv.xml.includes('<catalog version="1.0">'), conv.xml);
  assert.ok(conv.xml.includes('<store name="Corner Books">'), conv.xml);
  assert.ok(conv.xml.includes('<item id="bk101">'), conv.xml);
  assert.ok(conv.xml.includes('<title>Tom &amp; Jerry &lt;Tales&gt;</title>'), conv.xml);
  assert.ok(conv.xml.includes('<note lang="en">Open daily 9 to 5</note>'), conv.xml);
  assert.ok(conv.xml.includes('<_2nd_place>runner up</_2nd_place>'), conv.xml);
  assert.ok(conv.xml.includes('<discount/>'), conv.xml);
  assert.equal(conv.warnings.length, 1);
  assert.ok(conv.warnings[0].includes('2nd place'), conv.warnings[0]);
  /* No raw unescaped & or < survives outside markup. */
  assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(conv.xml.replace(/<\/?[a-zA-Z][^>]*>/g, '')), conv.xml);
});

ok('round-trip sanity: XML Formatter conventions (@attr, #text, arrays)', () => {
  const { xml } = jsonToXml({ item: { '@id': '7', '#text': 'seven' } }, { declaration: false });
  assert.equal(xml, '<root>\n  <item id="7">seven</item>\n</root>');
});

ok('sanitizeXmlName keeps valid names untouched', () => {
  assert.deepEqual(sanitizeXmlName('title'), { name: 'title', repaired: false });
  assert.deepEqual(sanitizeXmlName('_ok-name.1'), { name: '_ok-name.1', repaired: false });
  assert.equal(sanitizeXmlName('9lives').name, '_9lives');
  assert.equal(sanitizeXmlName('a b').name, 'a_b');
});

ok('defaults are the documented ones', () => {
  assert.equal(DEFAULT_OPTIONS.rootName, 'root');
  assert.equal(DEFAULT_OPTIONS.itemName, 'item');
  assert.equal(DEFAULT_OPTIONS.declaration, true);
  assert.equal(DEFAULT_OPTIONS.indent, '  ');
  assert.equal(DEFAULT_OPTIONS.nullMode, 'empty');
});

console.log(`\n${passed} passed`);
