import assert from 'node:assert/strict';
import {
  splitGraphemes,
  countGraphemes,
  clampCount,
  resolveSeparator,
  measureText,
  outputSizeMath,
  repeatText,
  MAX_REPEAT_COUNT,
  MAX_OUTPUT_CHARS,
  SAMPLE_TEXT,
} from '/home/hatch/workspace/utility-hub/lib/text-repeater-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

/* Grapheme-cluster safety: the differentiator. Node-verified counts. */
t('family emoji is 1 grapheme, 5 code points, 8 UTF-16 units', () => {
  const s = '👨‍👩‍👧';
  assert.equal(s.length, 8);
  assert.equal([...s].length, 5);
  assert.equal(countGraphemes(s), 1);
  assert.deepEqual(splitGraphemes(s), [s]);
});
t('Pakistan flag is 1 grapheme, 2 code points, 4 UTF-16 units', () => {
  const s = '🇵🇰';
  assert.equal(s.length, 4);
  assert.equal([...s].length, 2);
  assert.equal(countGraphemes(s), 1);
});
t('skin-tone thumb is 1 grapheme, 2 code points, 4 UTF-16 units', () => {
  const s = '👍🏽';
  assert.equal(s.length, 4);
  assert.equal([...s].length, 2);
  assert.equal(countGraphemes(s), 1);
});
t('plain text graphemes equal length', () => {
  assert.equal(countGraphemes('hello'), 5);
  assert.equal(countGraphemes(''), 0);
});
t('mixed string counts graphemes not units', () => {
  assert.equal(countGraphemes('a🇵🇰b'), 3);
  assert.equal('a🇵🇰b'.length, 6);
});

/* Count clamping edges. */
t('clampCount caps at 10000', () => {
  assert.equal(clampCount(10001), 10000);
  assert.equal(clampCount(99999), 10000);
  assert.equal(MAX_REPEAT_COUNT, 10000);
});
t('clampCount keeps 0 as 0', () => assert.equal(clampCount(0), 0));
t('clampCount floors and handles negatives', () => {
  assert.equal(clampCount(2.9), 2);
  assert.equal(clampCount(-5), 0);
});
t('clampCount non-numeric becomes 1', () => {
  assert.equal(clampCount('abc'), 1);
  assert.equal(clampCount(undefined), 1);
});

/* Separators. */
t('resolveSeparator maps every key', () => {
  assert.equal(resolveSeparator('none'), '');
  assert.equal(resolveSeparator('space'), ' ');
  assert.equal(resolveSeparator('newline'), '\n');
  assert.equal(resolveSeparator('comma'), ', ');
  assert.equal(resolveSeparator('custom', ' | '), ' | ');
  assert.equal(resolveSeparator('custom'), '');
  assert.equal(resolveSeparator('bogus'), '');
});

/* Basic repetition. */
t('repeatText repeats plain text', () => {
  const r = repeatText({ text: 'ab', count: 3 });
  assert.equal(r.output, 'ababab');
  assert.equal(r.copiesProduced, 3);
  assert.equal(r.capped, false);
});
t('repeatText with space separator', () => {
  const r = repeatText({ text: 'hi', count: 3, separator: 'space' });
  assert.equal(r.output, 'hi hi hi');
});
t('repeatText with newline separator', () => {
  const r = repeatText({ text: 'x', count: 2, separator: 'newline' });
  assert.equal(r.output, 'x\nx');
});
t('repeatText with comma separator', () => {
  const r = repeatText({ text: 'a', count: 3, separator: 'comma' });
  assert.equal(r.output, 'a, a, a');
});
t('repeatText with custom separator', () => {
  const r = repeatText({ text: 'go', count: 3, separator: 'custom', customSeparator: ' | ' });
  assert.equal(r.output, 'go | go | go');
});
t('repeatText numbering prefixes each copy', () => {
  const r = repeatText({ text: 'item', count: 3, numberEach: true });
  assert.equal(r.output, '1. item2. item3. item');
});
t('repeatText numbering with separator', () => {
  const r = repeatText({ text: 'a', count: 2, separator: 'newline', numberEach: true });
  assert.equal(r.output, '1. a\n2. a');
});
t('repeatText trailing separator after last copy', () => {
  const r = repeatText({ text: 'ab', count: 2, separator: 'space', trailingSeparator: true });
  assert.equal(r.output, 'ab ab ');
});
t('repeatText trailing separator off by default', () => {
  const r = repeatText({ text: 'ab', count: 2, separator: 'space' });
  assert.equal(r.output, 'ab ab');
});
t('repeatText never splits emoji or flags', () => {
  const r = repeatText({ text: '🇵🇰', count: 3, separator: 'space' });
  assert.equal(r.output, '🇵🇰 🇵🇰 🇵🇰');
  assert.equal(r.totalGraphemes, 5);
  assert.equal(countGraphemes(r.output), 5);
});
t('repeatText family emoji stays whole', () => {
  const r = repeatText({ text: '👨‍👩‍👧', count: 2 });
  assert.equal(r.output, '👨‍👩‍👧👨‍👩‍👧');
  assert.equal(r.totalGraphemes, 2);
});
t('repeatText skin-tone emoji stays whole', () => {
  const r = repeatText({ text: '👍🏽', count: 2, separator: 'newline' });
  assert.equal(r.output, '👍🏽\n👍🏽');
  assert.equal(r.totalGraphemes, 3);
});

/* Empty and zero edges. */
t('repeatText empty text produces nothing', () => {
  const r = repeatText({ text: '', count: 100 });
  assert.equal(r.output, '');
  assert.equal(r.copiesProduced, 0);
  assert.equal(r.capped, false);
});
t('repeatText count 0 produces nothing', () => {
  const r = repeatText({ text: 'abc', count: 0 });
  assert.equal(r.output, '');
  assert.equal(r.copiesProduced, 0);
});
t('repeatText count 10001 clamps to 10000', () => {
  const r = repeatText({ text: 'a', count: 10001 });
  assert.equal(r.copiesProduced, 10000);
  assert.equal(r.requestedCopies, 10000);
  assert.equal(r.output.length, 10000);
});

/* Output cap: 500,000 chars, whole copies only. */
t('cap is 500000 chars', () => assert.equal(MAX_OUTPUT_CHARS, 500000));
t('repeatText caps at whole copies and reports the count', () => {
  const text = 'x'.repeat(300000);
  const r = repeatText({ text, count: 3 });
  assert.equal(r.copiesProduced, 1);
  assert.equal(r.capped, true);
  assert.equal(r.output.length, 300000);
});
t('repeatText cap with separator counts separators too', () => {
  const text = 'y'.repeat(200000);
  const r = repeatText({ text, count: 5, separator: 'space' });
  assert.equal(r.copiesProduced, 2);
  assert.equal(r.capped, true);
  assert.equal(r.output.length, 400001);
});
t('repeatText exactly at cap is not capped', () => {
  const text = 'z'.repeat(250000);
  const r = repeatText({ text, count: 2 });
  assert.equal(r.copiesProduced, 2);
  assert.equal(r.capped, false);
  assert.equal(r.output.length, 500000);
});
t('repeatText cap message data: requested vs produced', () => {
  const text = 'w'.repeat(200000);
  const r = repeatText({ text, count: 10 });
  assert.equal(r.requestedCopies, 10);
  assert.equal(r.copiesProduced, 2);
  assert.ok(r.capped);
});

/* Measuring. */
t('measureText counts chars, graphemes, words, lines, bytes', () => {
  const m = measureText('Hello 🇵🇰\nWorld');
  assert.equal(m.chars, 'Hello 🇵🇰\nWorld'.length);
  assert.equal(m.graphemes, 13);
  assert.equal(m.words, 3);
  assert.equal(m.lines, 2);
  assert.equal(m.bytes, new TextEncoder().encode('Hello 🇵🇰\nWorld').length);
});
t('measureText empty is all zeros', () => {
  assert.deepEqual(measureText(''), { chars: 0, graphemes: 0, words: 0, lines: 0, bytes: 0 });
});
t('measureText emoji bytes are 4 each', () => {
  assert.equal(measureText('🎉').bytes, 4);
  assert.equal(measureText('🎉').chars, 2);
  assert.equal(measureText('🎉').graphemes, 1);
});

/* Output-size math. */
t('outputSizeMath formula is exact', () => {
  const m = outputSizeMath('ab', 100, 'space');
  assert.equal(m.textChars, 2);
  assert.equal(m.separatorChars, 1);
  assert.equal(m.totalChars, 200 + 99);
  assert.ok(m.formula.includes('2 chars x 100 copies'));
  assert.ok(m.formula.includes('1 char separator x 99'));
  assert.ok(m.formula.includes('299 chars'));
});
t('outputSizeMath no separator', () => {
  const m = outputSizeMath('abc', 10, 'none');
  assert.equal(m.totalChars, 30);
});
t('outputSizeMath numbering adds prefix lengths', () => {
  const m = outputSizeMath('a', 12, 'none', '', true);
  // 12 copies of 'a' + '1. '...'12. ' prefixes: 9x3 + 3x4 = 39
  assert.equal(m.totalChars, 12 + 39);
});
t('outputSizeMath grapheme count for emoji text', () => {
  const m = outputSizeMath('🇵🇰', 10, 'none');
  assert.equal(m.textGraphemes, 1);
  assert.equal(m.textChars, 4);
});

/* Sample text is non-empty and emoji-safe. */
t('sample text exists and is grapheme-safe', () => {
  assert.ok(SAMPLE_TEXT.length > 0);
  assert.equal(countGraphemes(SAMPLE_TEXT), 17);
});

console.log('text-repeater-utils: ' + n + '/' + n + ' passed');
