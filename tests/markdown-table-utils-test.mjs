/* Node tests for lib/markdown-table-utils.js. Run:
   node tests/markdown-table-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  alignmentCell, columnCount, detectDelimiter, escapePipe, gridToHtml,
  gridToMarkdown, normalizeAlignments, normalizeGrid, parseDelimited,
  parseDelimitedLine, parseMarkdownTable, splitMarkdownRow, tableStats,
  unescapePipe, DEFAULT_GRID,
} from '../lib/markdown-table-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

const GRID = [
  ['Name', 'Age', 'City'],
  ['Ada', '36', 'London'],
  ['Alan', '41', 'Cambridge'],
];

await ok('gridToMarkdown pads columns and writes the header + separator', async () => {
  const md = gridToMarkdown(GRID, ['left', 'center', 'right']);
  const lines = md.split('\n');
  assert.equal(lines.length, 4);
  assert.ok(lines[0].startsWith('| Name'));
  assert.ok(lines[0].includes('| Age '));
  assert.ok(lines[0].includes('| City'));
  assert.ok(lines[1].includes(':-:') && lines[1].includes('---:'), 'separator carries alignment: ' + lines[1]);
  assert.ok(lines[1].startsWith('| :'));
  // Every line has the same length (padded columns).
  assert.ok(lines.every((l) => l.length === lines[0].length), 'uneven line lengths:\n' + md);
});

await ok('default alignment is left when none given', async () => {
  const md = gridToMarkdown(GRID);
  assert.ok(md.split('\n')[1].includes(':---'), md);
  assert.ok(!md.split('\n')[1].includes(':---:'), 'unexpected center alignment');
});

await ok('pipes inside cells are escaped, and survive a round-trip', async () => {
  const grid = [['A | B', 'C'], ['x | y', 'z']];
  const md = gridToMarkdown(grid);
  assert.ok(md.includes('A \\| B'), md);
  const back = parseMarkdownTable(md);
  assert.deepEqual(back.grid, [['A | B', 'C'], ['x | y', 'z']]);
  assert.deepEqual(back.alignments, ['left', 'left']);
});

await ok('round-trip keeps alignment per column', async () => {
  const aligns = ['left', 'center', 'right'];
  const md = gridToMarkdown(GRID, aligns);
  const back = parseMarkdownTable(md);
  assert.deepEqual(back.alignments, aligns);
  assert.deepEqual(back.grid, GRID);
});

await ok('parseMarkdownTable reads a hand-written table with alignments', async () => {
  const src = [
    '| Product | Price | Stock |',
    '| :--- | ---: | :---: |',
    '| Coffee | 3.50 | 12 |',
    '| Tea | 2.75 | 8 |',
  ].join('\n');
  const back = parseMarkdownTable(src);
  assert.deepEqual(back.alignments, ['left', 'right', 'center']);
  assert.deepEqual(back.grid[0], ['Product', 'Price', 'Stock']);
  assert.deepEqual(back.grid[2], ['Tea', '2.75', '8']);
});

await ok('parseMarkdownTable ignores surrounding prose and needs a separator row', async () => {
  assert.equal(parseMarkdownTable('Just some text\n| a | b |\nno separator here'), null);
  const back = parseMarkdownTable('Here is my table:\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\nDone.');
  assert.deepEqual(back.grid, [['a', 'b'], ['1', '2']]);
});

await ok('parseMarkdownTable handles empty cells and ragged rows', async () => {
  const src = '| a | b | c |\n| --- | --- | --- |\n| 1 | | 3 |\n| 4 | 5 |';
  const back = parseMarkdownTable(src);
  assert.deepEqual(back.grid[1], ['1', '', '3']);
  assert.deepEqual(back.grid[2], ['4', '5', '']);
  assert.equal(back.grid.every((r) => r.length === 3), true);
});

await ok('parseMarkdownTable handles tables without outer pipes', async () => {
  const src = 'a | b\n--- | ---\n1 | 2';
  const back = parseMarkdownTable(src);
  assert.deepEqual(back.grid, [['a', 'b'], ['1', '2']]);
});

await ok('CSV parse: quoted fields, embedded commas and doubled quotes', async () => {
  const csv = 'Name,Note\n"Smith, John","He said ""hi"", then left"\nAda,plain';
  const grid = parseDelimited(csv);
  assert.deepEqual(grid[0], ['Name', 'Note']);
  assert.deepEqual(grid[1], ['Smith, John', 'He said "hi", then left']);
  assert.deepEqual(grid[2], ['Ada', 'plain']);
});

await ok('TSV and semicolon input are auto-detected', async () => {
  assert.deepEqual(parseDelimited('a\tb\n1\t2'), [['a', 'b'], ['1', '2']]);
  assert.equal(detectDelimiter('a\tb\n1\t2'), '\t');
  assert.deepEqual(parseDelimited('a;b\n1;2'), [['a', 'b'], ['1', '2']]);
  assert.equal(detectDelimiter('a,b\n1,2'), ',');
});

await ok('parseDelimitedLine handles empty fields and trailing delimiters', async () => {
  assert.deepEqual(parseDelimitedLine('a,,c,', ','), ['a', '', 'c', '']);
  assert.deepEqual(parseDelimitedLine('"a,b",c', ','), ['a,b', 'c']);
});

await ok('parseDelimited returns null on empty input and skips blank lines', async () => {
  assert.equal(parseDelimited(''), null);
  assert.equal(parseDelimited('   \n\n'), null);
  assert.deepEqual(parseDelimited('a,b\n\n1,2\n'), [['a', 'b'], ['1', '2']]);
});

await ok('normalizeGrid pads ragged rows; normalizeAlignments fills defaults', async () => {
  assert.deepEqual(normalizeGrid([['a'], ['b', 'c', 'd']]), [['a', '', ''], ['b', 'c', 'd']]);
  assert.deepEqual(normalizeAlignments(['right'], 3), ['right', 'left', 'left']);
  assert.deepEqual(normalizeAlignments(['bogus', 'center'], 2), ['left', 'center']);
  assert.equal(columnCount([['a'], ['b', 'c']]), 2);
});

await ok('alignmentCell shapes match GFM (left :--, center :-:, right --:)', async () => {
  assert.equal(alignmentCell('left', 5), ':----');
  assert.equal(alignmentCell('center', 5), ':---:');
  assert.equal(alignmentCell('right', 5), '----:');
  assert.equal(alignmentCell('left', 3), ':--');
});

await ok('escapePipe / unescapePipe are inverses; newlines become spaces', async () => {
  assert.equal(escapePipe('a|b\nc'), 'a\\|b c');
  assert.equal(unescapePipe('a\\|b'), 'a|b');
  const grid = [['multi\nline', 'x']];
  assert.ok(!gridToMarkdown(grid).includes('\nline'), 'embedded newline leaked into output');
});

await ok('gridToHtml escapes HTML and applies alignment', async () => {
  const html = gridToHtml([['A<script>', 'B'], ['<b>x</b>', 'y']], ['left', 'right']);
  assert.ok(html.includes('&lt;script&gt;'), 'script tag not escaped: ' + html);
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'), 'bold tag not escaped');
  assert.ok(html.includes('<th>A'), 'header uses th');
  assert.ok(html.includes('text-align:right'), 'right alignment missing');
  assert.ok(html.startsWith('<table>') && html.endsWith('</table>'));
});

await ok('tableStats counts rows, columns, filled cells and chars', async () => {
  const md = gridToMarkdown(GRID);
  const s = tableStats(GRID, md);
  assert.deepEqual(
    { rows: s.rows, columns: s.columns, dataRows: s.dataRows, filledCells: s.filledCells },
    { rows: 3, columns: 3, dataRows: 2, filledCells: 9 },
  );
  assert.equal(s.chars, md.length);
  const sparse = tableStats([['a', ''], ['', '']], '');
  assert.equal(sparse.filledCells, 1);
  assert.deepEqual(tableStats([], ''), { rows: 0, columns: 0, dataRows: 0, filledCells: 0, chars: 0 });
});

await ok('DEFAULT_GRID round-trips through Markdown cleanly', async () => {
  const md = gridToMarkdown(DEFAULT_GRID, ['left', 'left', 'left']);
  const back = parseMarkdownTable(md);
  assert.deepEqual(back.grid, DEFAULT_GRID);
  assert.ok(md.split('\n').length === DEFAULT_GRID.length + 1);
});

console.log(`\n${passed} tests passed`);
