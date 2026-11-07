/* Node tests for lib/xml-utils.js.
   Run: node tests/xml-utils-test.mjs */
import {
  parseXml, validateXml, formatXml, minifyXml, xmlToJson,
  countXml, tokenizeXml, findDoctype, SAMPLE_XML,
} from '../lib/xml-utils.js';

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass += 1; } else {
    fail += 1;
    console.log('FAIL: ' + name + '\n  expected: ' + JSON.stringify(expected) + '\n  actual:   ' + JSON.stringify(actual));
  }
}

// Format: 2-space indent, nested + attributes.
check('format basic', formatXml('<a><b x="1">hi</b><c/></a>', '  ').output,
  '<a>\n  <b x="1">hi</b>\n  <c/>\n</a>');
check('format 4-space', formatXml('<a><b>hi</b></a>', '    ').output,
  '<a>\n    <b>hi</b>\n</a>');
check('format tab', formatXml('<a><b>hi</b></a>', '\t').output,
  '<a>\n\t<b>hi</b>\n</a>');
check('format keeps declaration', formatXml('<?xml version="1.0"?><a><b>1</b></a>', '  ').output,
  '<?xml version="1.0"?>\n<a>\n  <b>1</b>\n</a>');
check('format sample is stable', formatXml(SAMPLE_XML, '  ').ok, true);

// Minify round-trip: format(minify(x)) == format(x), minify has no newlines.
const min = minifyXml(SAMPLE_XML);
check('minify ok', min.ok, true);
check('minify no newlines', min.output.includes('\n'), false);
check('minify round-trip', formatXml(min.output, '  ').output, formatXml(SAMPLE_XML, '  ').output);
check('minify trims text', minifyXml('<a>  hello  <b> world </b> </a>').output, '<a>hello<b>world</b></a>');

// Validation: mismatched close reports line and column.
const bad = validateXml('<root>\n  <a>text</b>\n</root>');
check('mismatched invalid', bad.valid, false);
check('mismatched code', bad.error.code, 'mismatched-close');
check('mismatched line', bad.error.line, 2);
check('mismatched column', bad.error.column, 10);

// Unclosed tag points at the opening tag.
const unc = validateXml('<root><a>text');
check('unclosed code', unc.error.code, 'unclosed-tag');
check('unclosed line', unc.error.line, 1);

// Bare ampersand is an error; valid entities pass.
check('bare amp invalid', validateXml('<a>Tom & Jerry</a>').valid, false);
check('bare amp code', validateXml('<a>Tom & Jerry</a>').error.code, 'invalid-entity');
check('amp entity valid', validateXml('<a>Tom &amp; Jerry &#169;</a>').valid, true);

// Multiple roots and no root.
check('two roots invalid', validateXml('<a/><b/>').error.code, 'multiple-roots');
check('empty invalid', validateXml('   ').error.code, 'no-root');
check('text only invalid', validateXml('hello').error.code, 'no-root');

// Duplicate attribute, bad attribute quoting.
check('dup attr code', validateXml('<a x="1" x="2"/>').error.code, 'duplicate-attr');
check('unquoted attr code', validateXml('<a x=1/>').error.code, 'missing-quote');

// CDATA and comments survive format.
check('cdata kept', formatXml('<a><![CDATA[x < y]]></a>', '  ').output, '<a><![CDATA[x < y]]></a>');
check('comment kept', formatXml('<a><!-- hi --><b/></a>', '  ').output, '<a>\n  <!-- hi -->\n  <b/>\n</a>');

// DOCTYPE rejected (XXE safety).
check('doctype index', findDoctype('<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo/>') !== -1, true);
check('doctype rejected', validateXml('<!DOCTYPE foo><foo/>').error.code, 'doctype');
check('doctype case-insensitive', validateXml('<!doctype foo><foo/>').error.code, 'doctype');

// XML to JSON conversion.
check('json simple', xmlToJson('<a><b>1</b><b>2</b></a>').value, { a: { b: ['1', '2'] } });
check('json attrs + text', xmlToJson('<book id="1"><title>Hi</title></book>').value,
  { book: { '@id': '1', title: 'Hi' } });
check('json attr and text', xmlToJson('<price currency="USD">29.99</price>').value,
  { price: { '@currency': 'USD', '#text': '29.99' } });
check('json sample books array', Array.isArray(xmlToJson(SAMPLE_XML).value.catalog.book), true);
check('json invalid', xmlToJson('<a><b></a>').ok, false);

// Counts.
check('counts', countXml(SAMPLE_XML), { chars: SAMPLE_XML.length, elements: 9, attributes: 6, comments: 0, maxDepth: 3 });
check('counts invalid null', countXml('<a><b></a>'), null);

// Tokenizer: tag, attr, value, text present.
const toks = tokenizeXml('<a x="1">hi</a>');
check('token types', toks.map((t) => t.type), ['tag', 'attr', 'tag', 'value', 'tag', 'text', 'tag', 'tag']);
check('token decl', tokenizeXml('<?xml version="1.0"?><a/>')[0].type, 'decl');
check('token comment', tokenizeXml('<!-- hi --><a/>')[0].type, 'comment');

console.log('xml-utils: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
