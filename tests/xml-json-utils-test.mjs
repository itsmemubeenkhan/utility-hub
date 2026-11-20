/* Node tests for lib/xml-json-utils.js. Run:
   node tests/xml-json-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  convertXmlToJson, decodeEntities, elementToJson, inferType,
  parseXmlTree, stripNamespace, xmlToJsonValue, SAMPLE_XML,
} from '../lib/xml-json-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

await ok('nested elements with text become nested objects', async () => {
  const r = xmlToJsonValue('<note><to>Ana</to><body>Hello</body></note>');
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { note: { to: 'Ana', body: 'Hello' } });
  assert.deepEqual(r.stats, { elements: 3, attributes: 0, depth: 2 });
});

await ok('attributes use @ prefix by default and stay strings', async () => {
  const r = xmlToJsonValue('<book id="bk101" price="29.99"><title>XML Guide</title></book>');
  assert.deepEqual(r.value, { book: { '@id': 'bk101', '@price': '29.99', title: 'XML Guide' } });
  assert.equal(r.stats.attributes, 2);
});

await ok('grouped attribute style puts them under @attributes', async () => {
  const r = xmlToJsonValue('<book id="bk101"><title>T</title></book>', { attrStyle: 'grouped' });
  assert.deepEqual(r.value, { book: { '@attributes': { id: 'bk101' }, title: 'T' } });
});

await ok('repeated siblings become arrays', async () => {
  const r = xmlToJsonValue('<catalog><book>A</book><book>B</book><book>C</book></catalog>');
  assert.deepEqual(r.value, { catalog: { book: ['A', 'B', 'C'] } });
  const mixed = xmlToJsonValue('<root><item>1</item><other>x</other><item>2</item></root>');
  assert.deepEqual(mixed.value, { root: { item: ['1', '2'], other: 'x' } });
});

await ok('CDATA becomes text, even when it looks like markup', async () => {
  const r = xmlToJsonValue('<note><body><![CDATA[The <b>bold</b> truth & more.]]></body></note>');
  assert.equal(r.value.note.body, 'The <b>bold</b> truth & more.');
});

await ok('comments and processing instructions are ignored in output', async () => {
  const r = xmlToJsonValue('<?xml version="1.0"?><!-- hello --><a><?pi data?><b>1</b><!-- gone --></a>');
  assert.deepEqual(r.value, { a: { b: '1' } });
});

await ok('entity decoding: predefined and numeric references', async () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &lt;Tales&gt; &#169; &#xA9; &quot;q&quot;'), 'Tom & Jerry <Tales> © © "q"');
  const r = xmlToJsonValue('<a title="Fish &amp; Chips">Tom &amp; Jerry</a>');
  assert.deepEqual(r.value, { a: { '@title': 'Fish & Chips', '#text': 'Tom & Jerry' } });
});

await ok('mixed content keeps text under #text plus child elements', async () => {
  const r = xmlToJsonValue('<note>Open daily <b>9 to 5</b>, holidays excepted.</note>');
  assert.deepEqual(r.value, { note: { '#text': 'Open daily , holidays excepted.', b: '9 to 5' } });
});

await ok('custom text key is honored', async () => {
  const r = xmlToJsonValue('<a x="1">hello</a>', { textKey: '_text' });
  assert.deepEqual(r.value, { a: { '@x': '1', _text: 'hello' } });
});

await ok('empty and self-closing elements become empty strings', async () => {
  const r = xmlToJsonValue('<root><a/><b></b><c> </c></root>');
  assert.deepEqual(r.value, { root: { a: '', b: '', c: '' } });
  const withAttr = xmlToJsonValue('<root><a id="1"/></root>');
  assert.deepEqual(withAttr.value, { root: { a: { '@id': '1' } } });
});

await ok('type inference off keeps strings, on converts numbers and booleans', async () => {
  const xml = '<item><price>29.99</price><count>42</count><ok>true</ok><code>007</code><name>yes</name></item>';
  const off = xmlToJsonValue(xml);
  assert.deepEqual(off.value.item, { price: '29.99', count: '42', ok: 'true', code: '007', name: 'yes' });
  const on = xmlToJsonValue(xml, { inferTypes: true });
  assert.deepEqual(on.value.item, { price: 29.99, count: 42, ok: true, code: '007', name: 'yes' });
  assert.equal(inferType('1e3', true), 1000);
  assert.equal(inferType('0123', true), '0123');
  assert.equal(inferType('-5', true), -5);
});

await ok('root unwrap drops the root name wrapper', async () => {
  const r = xmlToJsonValue('<catalog><book>A</book></catalog>', { unwrapRoot: true });
  assert.deepEqual(r.value, { book: 'A' });
  const kept = xmlToJsonValue('<catalog><book>A</book></catalog>');
  assert.deepEqual(kept.value, { catalog: { book: 'A' } });
});

await ok('namespace prefixes are kept by default and stripped on request', async () => {
  const xml = '<ns:catalog xmlns:ns="urn:x"><ns:book ns:id="1">T</ns:book></ns:catalog>';
  const kept = xmlToJsonValue(xml);
  assert.deepEqual(kept.value, { 'ns:catalog': { '@xmlns:ns': 'urn:x', 'ns:book': { '@ns:id': '1', '#text': 'T' } } });
  const stripped = xmlToJsonValue(xml, { namespaces: 'strip' });
  assert.deepEqual(stripped.value, { catalog: { '@ns': 'urn:x', book: { '@id': '1', '#text': 'T' } } });
  assert.equal(stripNamespace('ns:tag'), 'tag');
  assert.equal(stripNamespace('plain'), 'plain');
});

await ok('malformed XML reports exact line and column', async () => {
  const bad = '<a>\n  <b>text</c>\n</a>';
  const r = xmlToJsonValue(bad);
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'mismatched-close');
  assert.equal(r.error.line, 2);
  assert.ok(r.error.column > 1, 'column should point at the closing tag, got ' + r.error.column);
  const unclosed = xmlToJsonValue('<a><b>oops');
  assert.equal(unclosed.ok, false);
  assert.equal(unclosed.error.code, 'unclosed-tag');
  const bareAmp = xmlToJsonValue('<a>fish & chips</a>');
  assert.equal(bareAmp.ok, false);
  assert.equal(bareAmp.error.code, 'invalid-entity');
  const dupAttr = xmlToJsonValue('<a x="1" x="2"/>');
  assert.equal(dupAttr.error.code, 'duplicate-attr');
  const multiRoot = xmlToJsonValue('<a/><b/>');
  assert.equal(multiRoot.error.code, 'multiple-roots');
});

await ok('DOCTYPE is refused outright', async () => {
  const r = xmlToJsonValue('<!DOCTYPE catalog [<!ENTITY x "y">]><catalog/>');
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'doctype');
  const lower = xmlToJsonValue('<!doctype html><a/>');
  assert.equal(lower.error.code, 'doctype');
});

await ok('indent 2, 4 and minified output', async () => {
  const two = convertXmlToJson('<a><b>1</b></a>', { indent: 2 });
  assert.equal(two.json, '{\n  "a": {\n    "b": "1"\n  }\n}');
  const four = convertXmlToJson('<a><b>1</b></a>', { indent: 4 });
  assert.ok(four.json.includes('\n        "b": "1"'), four.json);
  const min = convertXmlToJson('<a><b>1</b></a>', { indent: 0 });
  assert.equal(min.json, '{"a":{"b":"1"}}');
});

await ok('convertXmlToJson returns stats and empty input errors', async () => {
  const r = convertXmlToJson('<a><b>1</b></a>');
  assert.equal(r.ok, true);
  assert.deepEqual(r.stats, { elements: 2, attributes: 0, depth: 2 });
  const empty = convertXmlToJson('   ');
  assert.equal(empty.ok, false);
  assert.equal(empty.error.code, 'no-root');
});

await ok('SAMPLE_XML converts cleanly with arrays, attrs, CDATA and mixed content', async () => {
  const r = xmlToJsonValue(SAMPLE_XML);
  assert.equal(r.ok, true, r.error && r.error.message);
  assert.equal(r.value.catalog['@version'], '2.0');
  assert.equal(Array.isArray(r.value.catalog.store.book), true);
  assert.equal(r.value.catalog.store.book.length, 2);
  assert.equal(r.value.catalog.store.book[0]['@id'], 'bk101');
  assert.equal(r.value.catalog.store.book[0].description, 'The <b>definitive</b> guide & reference.');
  assert.equal(r.value.catalog.store.book[0].price['@currency'], 'USD');
  assert.equal(r.value.catalog.store.book[0].price['#text'], '29.99');
  assert.equal(r.value.catalog.store.note.b, '9 to 5');
  assert.equal(r.stats.elements, 16);
  assert.equal(r.stats.attributes, 9);
  assert.equal(r.stats.depth, 4);
  const typed = xmlToJsonValue(SAMPLE_XML, { inferTypes: true });
  assert.equal(typed.value.catalog.store.book[0].price['#text'], 29.99);
  assert.equal(typed.value.catalog.store.book[0].inStock, true);
});

await ok('elementToJson handles a parsed tree directly', async () => {
  const parsed = parseXmlTree('<a x="1"><b>2</b></a>');
  assert.equal(parsed.ok, true);
  assert.deepEqual(elementToJson(parsed.root), { '@x': '1', b: '2' });
});

console.log(`\n${passed} tests passed`);
