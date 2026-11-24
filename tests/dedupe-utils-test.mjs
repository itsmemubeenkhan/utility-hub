import assert from 'node:assert/strict';
import { dedupeLines, SAMPLE_LINES } from '/home/hatch/workspace/utility-hub/lib/dedupe-utils.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; console.log('ok - ' + name); };

// Basic dedupe keeps first-occurrence order
t('basic dedupe keeps order and counts', () => {
  const r = dedupeLines('b\na\nb\nc\na');
  assert.deepEqual(r.lines, ['b', 'a', 'c']);
  assert.deepEqual(r.stats, { total: 5, unique: 3, removed: 2 });
  assert.deepEqual(r.removed, [{ line: 'b', count: 1 }, { line: 'a', count: 1 }]);
});
t('removed counts add up to stats.removed', () => {
  const r = dedupeLines('x\nx\nx\ny\ny\nz');
  assert.equal(r.removed.reduce((s, e) => s + e.count, 0), r.stats.removed);
  assert.equal(r.stats.removed, 3);
});

// keep last
t('keep last keeps the newest copy in last-occurrence order', () => {
  const r = dedupeLines('a\nb\na', { keep: 'last' });
  assert.deepEqual(r.lines, ['b', 'a']);
  assert.deepEqual(r.removed, [{ line: 'a', count: 1 }]);
});
t('keep last keeps the last casing with ignoreCase', () => {
  const r = dedupeLines('Apple\napple\nAPPLE', { ignoreCase: true, keep: 'last' });
  assert.deepEqual(r.lines, ['APPLE']);
});

// ignoreCase
t('ignoreCase folds case', () => {
  const r = dedupeLines('Apple\napple\nAPPLE', { ignoreCase: true });
  assert.deepEqual(r.lines, ['Apple']);
  assert.deepEqual(r.removed, [{ line: 'Apple', count: 2 }]);
});
t('case matters by default', () => {
  const r = dedupeLines('Apple\napple');
  assert.deepEqual(r.lines, ['Apple', 'apple']);
  assert.equal(r.stats.removed, 0);
});
t('Unicode case folding works', () => {
  const r = dedupeLines('Émile\némile', { ignoreCase: true });
  assert.deepEqual(r.lines, ['Émile']);
});

// trim / normalize
t('trimLines on by default', () => {
  const r = dedupeLines('  a  \na\n a');
  assert.deepEqual(r.lines, ['a']);
  assert.equal(r.stats.removed, 2);
});
t('trimLines off keeps spaced lines distinct', () => {
  const r = dedupeLines('  a\na', { trimLines: false });
  assert.deepEqual(r.lines, ['  a', 'a']);
  assert.equal(r.stats.removed, 0);
});
t('normalizeSpaces collapses inner runs', () => {
  const r = dedupeLines('New  York\nNew York', { normalizeSpaces: true });
  assert.deepEqual(r.lines, ['New York']);
  assert.equal(r.stats.removed, 1);
});
t('normalizeSpaces off keeps double space distinct', () => {
  const r = dedupeLines('New  York\nNew York', { normalizeSpaces: false });
  assert.equal(r.lines.length, 2);
});

// removeEmpty
t('removeEmpty drops blank lines and audits them', () => {
  const r = dedupeLines('a\n\nb\n\n', { removeEmpty: true });
  assert.deepEqual(r.lines, ['a', 'b']);
  assert.deepEqual(r.removed, [{ line: '', count: 3 }]);
  assert.equal(r.stats.removed, 3);
});
t('empty lines dedupe to one copy by default', () => {
  const r = dedupeLines('a\n\nb\n');
  assert.deepEqual(r.lines, ['a', '', 'b']);
  assert.equal(r.stats.unique, 3);
});

// Modes
t('onlyUnique keeps lines that appear exactly once', () => {
  const r = dedupeLines('a\nb\na\nc', { mode: 'onlyUnique' });
  assert.deepEqual(r.lines, ['b', 'c']);
  assert.deepEqual(r.removed, [{ line: 'a', count: 2 }]);
  assert.equal(r.stats.removed, 2);
});
t('onlyDuplicates keeps one copy of each repeat', () => {
  const r = dedupeLines('a\nb\na\nc\nb', { mode: 'onlyDuplicates' });
  assert.deepEqual(r.lines, ['a', 'b']);
  assert.deepEqual(r.removed, [{ line: 'a', count: 1 }, { line: 'b', count: 1 }, { line: 'c', count: 1 }]);
  assert.equal(r.stats.removed, 3);
});

// Sort
t('sort asc orders A to Z', () => {
  const r = dedupeLines('c\na\nb\na', { sort: 'asc' });
  assert.deepEqual(r.lines, ['a', 'b', 'c']);
});
t('sort desc orders Z to A', () => {
  const r = dedupeLines('c\na\nb\na', { sort: 'desc' });
  assert.deepEqual(r.lines, ['c', 'b', 'a']);
});

// Line endings and empty input
t('CRLF input is handled', () => {
  const r = dedupeLines('a\r\nb\r\na');
  assert.deepEqual(r.lines, ['a', 'b']);
  assert.equal(r.stats.total, 3);
});
t('empty input returns zero lines', () => {
  const r = dedupeLines('');
  assert.deepEqual(r.lines, []);
  assert.deepEqual(r.removed, []);
  assert.deepEqual(r.stats, { total: 0, unique: 0, removed: 0 });
});

// Sample list
t('sample list dedupes as documented', () => {
  const r = dedupeLines(SAMPLE_LINES);
  assert.deepEqual(r.lines, ['Apple', 'Banana', 'apple', 'Orange', '', 'Grapes', 'orange']);
  assert.deepEqual(r.removed, [{ line: 'Apple', count: 1 }, { line: 'Banana', count: 2 }]);
  assert.deepEqual(r.stats, { total: 10, unique: 7, removed: 3 });
});

console.log('\ndedupe-utils: ' + n + '/' + n + ' passed');
