/* Node tests for lib/sql-formatter-utils.js (sql-formatter engine +
   pure helpers). Run: node tests/sql-formatter-utils-test.mjs */
import assert from 'node:assert/strict';
import {
  DIALECTS, SAMPLE_SQL, collapseSql, countSql, pctChange, formatSql,
} from '../lib/sql-formatter-utils.js';

let passed = 0;
async function ok(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
async function rejectsWithParseError(name, input, opts) {
  await ok(name, async () => {
    await assert.rejects(() => formatSql(input, opts), /Parse error/i);
  });
}

await ok('sample query formats with MySQL dialect, keywords uppercased', async () => {
  const out = await formatSql(SAMPLE_SQL, { dialect: 'mysql' });
  assert.ok(out.startsWith('SELECT\n  u.id,'), 'starts formatted: ' + JSON.stringify(out.slice(0, 40)));
  assert.ok(out.includes('INNER JOIN orders o'), 'join kept: ' + out.slice(0, 200));
  assert.ok(out.includes("o.status = 'completed'"), 'string literal kept');
  assert.ok(out.includes('ORDER BY'), 'order by uppercased');
  assert.ok(out.includes('LIMIT\n  10'), 'limit kept');
});

await ok('dialects differ: T-SQL keeps TOP, PostgreSQL keeps LIMIT', async () => {
  const tsql = await formatSql('SELECT TOP 10 [id], [name] FROM [dbo].[Users] WHERE [active] = 1', { dialect: 'transactsql' });
  assert.ok(tsql.includes('TOP 10'), 'TOP kept: ' + tsql);
  const pg = await formatSql('select id, name from users where active limit 10', { dialect: 'postgresql', keywordCase: 'lower' });
  assert.ok(pg.includes('limit'), 'limit kept: ' + pg);
  assert.ok(!pg.includes('SELECT'), 'lower case applied');
});

await ok('minify collapses the sample to one line', async () => {
  const out = await formatSql(SAMPLE_SQL, { dialect: 'sql', minify: true });
  assert.ok(!out.includes('\n'), 'single line: ' + JSON.stringify(out.slice(0, 80)));
  assert.ok(out.startsWith('SELECT u.id, u.first_name'), 'starts clean: ' + out.slice(0, 40));
  assert.ok(out.endsWith(';'), 'semicolon kept');
  assert.ok(out.includes("'completed'"), 'string kept');
});

await ok('keyword case lower and preserve', async () => {
  const lower = await formatSql('SELECT a FROM t', { dialect: 'sql', keywordCase: 'lower' });
  assert.ok(lower.startsWith('select'), 'lower: ' + lower);
  const preserve = await formatSql('SeLeCt a FrOm t', { dialect: 'sql', keywordCase: 'preserve' });
  assert.ok(preserve.startsWith('SeLeCt'), 'preserve: ' + preserve);
  assert.ok(preserve.includes('FrOm'), 'preserve from: ' + preserve);
});

await ok('tab indent uses real tabs', async () => {
  const out = await formatSql('select a, b from t', { dialect: 'sql', indent: 'tab' });
  const lines = out.split('\n');
  assert.ok(lines[1].startsWith('\t'), 'tab indent: ' + JSON.stringify(lines[1]));
  const out4 = await formatSql('select a, b from t', { dialect: 'sql', indent: 4 });
  assert.ok(out4.split('\n')[1].startsWith('    '), '4-space indent: ' + JSON.stringify(out4.split('\n')[1]));
});

await ok('logicalOperatorNewline before moves AND to line start', async () => {
  const out = await formatSql('select * from t where a = 1 and b = 2', { dialect: 'sql', logicalOperatorNewline: 'before' });
  assert.ok(/\n\s*and b = 2/i.test(out), 'and on own line: ' + out);
});

await ok('newlineBeforeSemicolon puts ; on its own line', async () => {
  const out = await formatSql('select 1; select 2;', { dialect: 'sql', newlineBeforeSemicolon: true });
  assert.ok(out.includes('\n;'), 'semicolon on own line: ' + JSON.stringify(out));
});

await rejectsWithParseError('invalid SQL surfaces the library parse error (unterminated string)', "select 'unterminated");
await rejectsWithParseError('invalid SQL surfaces the library parse error (unmatched paren)', 'select (a from t');

await ok('empty input formats to empty string', async () => {
  assert.equal(await formatSql('', { dialect: 'sql' }), '');
  assert.equal(await formatSql('   ', { dialect: 'sql' }), '');
});

await ok('collapseSql keeps string literals verbatim', () => {
  const out = collapseSql("select  'a   b',\n  c\nfrom t;");
  assert.ok(out.includes("'a   b'"), 'string spaces kept: ' + out);
  assert.equal(out, "select 'a   b', c from t;", 'collapsed: ' + out);
  assert.equal(collapseSql('select ( a , b ) from t ;'), 'select (a, b) from t;', 'parens and semicolon tight');
});

await ok('countSql reports chars, lines and signed percent change', () => {
  const stats = countSql('select a from t', 'select\n  a\nfrom\n  t');
  assert.equal(stats.inputChars, 15);
  assert.equal(stats.outputChars, 19);
  assert.equal(stats.inputLines, 1);
  assert.equal(stats.outputLines, 4);
  assert.ok(stats.change > 0, 'growth positive: ' + stats.change);
  assert.equal(pctChange(100, 80), -20);
  assert.equal(pctChange(0, 50), 0);
});

await ok('all 10 dialects are listed', () => {
  assert.equal(DIALECTS.length, 10);
  const values = DIALECTS.map((d) => d.value);
  for (const v of ['sql', 'mysql', 'postgresql', 'sqlite', 'transactsql', 'plsql', 'bigquery', 'snowflake', 'redshift', 'mariadb']) {
    assert.ok(values.includes(v), 'missing dialect ' + v);
  }
});

console.log(`\n${passed} tests passed`);
