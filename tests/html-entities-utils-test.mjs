/* Node tests for lib/html-entities-utils.js.
   Run: node tests/html-entities-utils-test.mjs */
import {
  encodeHtml, decodeHtml, looksEncoded, looksDoubleEncoded,
  countEntities, COMMON_ENTITIES, NAMED_ENTITIES,
} from '../lib/html-entities-utils.js';

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass += 1; } else {
    fail += 1;
    console.log('FAIL: ' + name + '\n  expected: ' + JSON.stringify(expected) + '\n  actual:   ' + JSON.stringify(actual));
  }
}

// Minimal level: only the five special chars.
check('minimal basic', encodeHtml('<a href="x">&\'y\'</a>', 'minimal'), '&lt;a href=&quot;x&quot;&gt;&amp;&apos;y&apos;&lt;/a&gt;');
check('minimal leaves unicode', encodeHtml('café €', 'minimal'), 'café €');
check('minimal empty', encodeHtml('', 'minimal'), '');
check('minimal plain text unchanged', encodeHtml('hello world', 'minimal'), 'hello world');

// Named level: common named entities for non-ASCII.
check('named copyright euro', encodeHtml('© 2026 €5', 'named'), '&copy; 2026 &euro;5');
check('named em dash', encodeHtml('wait — go', 'named'), 'wait &mdash; go');
check('named nbsp', encodeHtml('a b', 'named'), 'a&nbsp;b');
check('named unknown char left as-is', encodeHtml('★', 'named'), '&star;');
check('named leaves unmapped char', encodeHtml('→', 'named'), '&rarr;');
check('named CJK left as-is', encodeHtml('你好', 'named'), '你好');

// Numeric level: decimal for all non-ASCII.
check('numeric copyright', encodeHtml('©', 'numeric'), '&#169;');
check('numeric emoji surrogate pair', encodeHtml('😀', 'numeric'), '&#128512;');
check('numeric keeps ascii', encodeHtml('Aé', 'numeric'), 'A&#233;');

// All level: named where available, else decimal.
check('all named preferred', encodeHtml('©', 'all'), '&copy;');
check('all falls back to decimal', encodeHtml('😀', 'all'), '&#128512;');
check('all mixed', encodeHtml('café 😀', 'all'), 'caf&eacute; &#128512;');

// Decode: named, decimal, hex, mixed.
check('decode named', decodeHtml('&lt;div&gt; &amp; &copy; &euro;').text, '<div> & © €');
check('decode decimal', decodeHtml('&#169; &#8364;').text, '© €');
check('decode hex', decodeHtml('&#xA9; &#x20AC; &#x1F600;').text, '© € 😀');
check('decode mixed', decodeHtml('Tom &amp; Jerry &#x2764; &#169;').text, 'Tom & Jerry ❤ ©');
check('decode plain unchanged', decodeHtml('no entities here').text, 'no entities here');
check('decode round-trip named', decodeHtml(encodeHtml('Price < €10 & "sale" — today!', 'named')).text, 'Price < €10 & "sale" — today!');
check('decode round-trip numeric', decodeHtml(encodeHtml('Emoji 😀 test ©', 'numeric')).text, 'Emoji 😀 test ©');
check('decode round-trip all', decodeHtml(encodeHtml('Mixed — café 😀 ©', 'all')).text, 'Mixed — café 😀 ©');
check('decode double-encoded once only', decodeHtml('&amp;amp;').text, '&amp;');

// Warnings: unknown named, invalid numeric.
check('decode unknown named warned', decodeHtml('a &notareal; b').warnings.length, 1);
check('decode unknown named kept', decodeHtml('a &notareal; b').text, 'a &notareal; b');
check('decode unknown reason', decodeHtml('a &notareal; b').warnings[0].reason, 'unknown');
check('decode invalid codepoint warned', decodeHtml('&#x110000;').warnings.length, 1);
check('decode surrogate warned', decodeHtml('&#xD800;').warnings.length, 1);
check('decode invalid kept', decodeHtml('&#x110000;').text, '&#x110000;');
check('decode bare amp kept', decodeHtml('fish & chips').text, 'fish & chips');
check('decode no warnings for valid', decodeHtml('&copy; &#169; &#xA9;').warnings.length, 0);
check('decode warning position', decodeHtml('ab &nope; cd').warnings[0].pos, 4);

// Helpers.
check('looksEncoded true', looksEncoded('a &copy; b'), true);
check('looksEncoded false', looksEncoded('plain text'), false);
check('looksEncoded bare amp false', looksEncoded('fish & chips'), false);
check('double encoded amp amp', looksDoubleEncoded('&amp;amp;'), true);
check('double encoded amp numeric', looksDoubleEncoded('&amp;#169;'), true);
check('double encoded false', looksDoubleEncoded('&amp; plain'), false);
check('count entities', countEntities('&copy; x &#169; y &#xA9;'), 3);
check('count entities none', countEntities('plain'), 0);

// Reference table consistency: every COMMON_ENTITIES row must decode.
let tableOk = true;
for (const row of COMMON_ENTITIES) {
  const d = decodeHtml(row.entity);
  if (d.text !== row.char || d.warnings.length) { tableOk = false; console.log('FAIL: table row ' + row.entity + ' decoded to ' + JSON.stringify(d.text)); }
}
check('common table all decode', tableOk, true);
check('common table size', COMMON_ENTITIES.length >= 40, true);

// Named map sanity: every value is a single code point.
let mapOk = true;
for (const [name, ch] of Object.entries(NAMED_ENTITIES)) {
  if ([...ch].length !== 1) { mapOk = false; console.log('FAIL: NAMED_ENTITIES.' + name + ' is not a single char'); }
}
check('named map single chars', mapOk, true);
check('named map size', Object.keys(NAMED_ENTITIES).length >= 200, true);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
