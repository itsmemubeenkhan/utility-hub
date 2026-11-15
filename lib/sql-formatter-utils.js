/* Pure SQL formatting helpers (no DOM, so they run in both browser and
   node). The real engine is the `sql-formatter` npm package, loaded here
   with a dynamic import so it stays out of the SSR path and out of the
   initial client bundle: it is only fetched when formatting actually
   runs, exactly like Terser is handled for the JS Minifier.
   Notes on the library (v15): `commaPosition` is no longer a supported
   option (passing it throws ConfigError), so it is not offered. The
   parser is lenient about some malformed SQL (for example `select from
   where` formats without throwing), but genuinely unparseable input
   such as an unterminated string or an unmatched parenthesis throws a
   Parse error, and that message is surfaced to the user as-is. */

export const DIALECTS = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'SQL Server (T-SQL)' },
  { value: 'plsql', label: 'Oracle PL/SQL' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'redshift', label: 'Redshift' },
  { value: 'mariadb', label: 'MariaDB' },
];

export const SAMPLE_SQL =
  "SELECT u.id,u.first_name,u.last_name,o.id AS order_id,o.total,o.created_at FROM users u INNER JOIN orders o ON o.user_id=u.id LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id WHERE o.status='completed' AND o.total>100 AND u.country='US' GROUP BY u.id,u.first_name,u.last_name,o.id,o.total,o.created_at HAVING COUNT(oi.id)>1 ORDER BY o.total DESC LIMIT 10;";

/* Collapse formatted SQL to a single line for minify mode: every run of
   whitespace outside string literals becomes one space, and the space
   before ; , and ) and after ( is dropped. String literals (single
   quotes, double quotes and backticks, with '' / "" doubling and
   backslash escapes) are copied verbatim, so collapsing never changes
   a value the query compares against. */
export function collapseSql(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      /* Copy a quoted literal verbatim, honouring '' doubling and \ escapes. */
      out += ch;
      i += 1;
      while (i < text.length) {
        const c = text[i];
        out += c;
        i += 1;
        if (c === '\\' && i < text.length) {
          out += text[i];
          i += 1;
        } else if (c === ch) {
          /* Doubled quote inside the literal: keep going. */
          if (text[i] === ch) {
            out += text[i];
            i += 1;
          } else {
            break;
          }
        }
      }
      continue;
    }
    if (/\s/.test(ch)) {
      /* One space for the whole whitespace run, unless the next
         meaningful character is ; , or ) (no space before them). */
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j += 1;
      const next = text[j];
      if (out && next && next !== ';' && next !== ',' && next !== ')') out += ' ';
      i = j;
      continue;
    }
    if ((ch === ';' || ch === ',') && out.endsWith(' ')) out = out.slice(0, -1);
    if (ch === '(') {
      out += ch;
      i += 1;
      while (i < text.length && /\s/.test(text[i])) i += 1;
      continue;
    }
    if (ch === ')' && out.endsWith(' ')) out = out.slice(0, -1);
    out += ch;
    i += 1;
  }
  return out.trim();
}

export function countLines(text) {
  if (!text) return 0;
  return text.split('\n').length;
}

/* Percent change from input size to output size, one decimal place,
   signed: positive means the output grew (formatting usually adds
   lines), negative means it shrank (minify mode). */
export function pctChange(before, after) {
  if (!before) return 0;
  return Math.round(((after - before) / before) * 1000) / 10;
}

export function countSql(input, output) {
  const inChars = input.length;
  const outChars = output.length;
  return {
    inputChars: inChars,
    outputChars: outChars,
    inputLines: countLines(input),
    outputLines: countLines(output),
    change: pctChange(inChars, outChars),
  };
}

/* Format SQL with sql-formatter. Options: dialect (a DIALECTS value),
   indent (2, 4 or 'tab'), keywordCase ('upper' | 'lower' | 'preserve'),
   logicalOperatorNewline ('after' | 'before'), newlineBeforeSemicolon
   (boolean), linesBetweenQueries (number, default 1), minify (boolean:
   collapse the formatted result to one line). Throws the library's own
   error on unparseable input; callers show e.message and no output. */
export async function formatSql(input, opts = {}) {
  const { format } = await import('sql-formatter');
  const {
    dialect = 'sql',
    indent = 2,
    keywordCase = 'upper',
    logicalOperatorNewline = 'after',
    newlineBeforeSemicolon = false,
    linesBetweenQueries = 1,
    minify = false,
  } = opts;
  const config = {
    language: dialect,
    keywordCase,
    logicalOperatorNewline,
    newlineBeforeSemicolon,
    linesBetweenQueries,
  };
  if (indent === 'tab') {
    config.useTabs = true;
  } else {
    config.tabWidth = indent;
  }
  let out = format(input, config);
  if (minify) out = collapseSql(out);
  return out;
}
