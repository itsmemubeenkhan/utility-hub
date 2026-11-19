/* Markdown Table Generator: pure grid <-> Markdown logic.
   The grid is string[][]; row 0 is the header. Alignments are one of
   'left' | 'center' | 'right' per column. Everything here is pure and
   node-testable; the React component in components/dev-tools/
   MarkdownTableTool.js owns the interactive grid. */

export const ALIGNMENTS = ['left', 'center', 'right'];

export const DEFAULT_GRID = [
  ['Name', 'Role', 'City'],
  ['Ada Lovelace', 'Programmer', 'London'],
  ['Alan Turing', 'Mathematician', 'Cambridge'],
  ['Grace Hopper', 'Rear Admiral', 'Arlington'],
];

/* A small 2-column sample, handy for docs that only need one narrow table. */
export const SAMPLE_GRID = [
  ['Product', 'Price'],
  ['Coffee', '$3.50'],
  ['Tea', '$2.75'],
  ['Juice', '$4.00'],
];

export function cloneGrid(grid) {
  return (grid || []).map((row) => [...row]);
}

export function columnCount(grid) {
  return (grid || []).reduce((max, row) => Math.max(max, row.length), 0);
}

export function rowCount(grid) {
  return (grid || []).length;
}

/* Pad ragged rows with empty cells so every row has the same width. */
export function normalizeGrid(grid) {
  const cols = columnCount(grid);
  return (grid || []).map((row) => {
    const out = [...row];
    while (out.length < cols) out.push('');
    return out;
  });
}

export function normalizeAlignments(alignments, cols) {
  const out = [];
  for (let i = 0; i < cols; i += 1) {
    out.push(ALIGNMENTS.includes(alignments && alignments[i]) ? alignments[i] : 'left');
  }
  return out;
}

export function escapePipe(cell) {
  return String(cell == null ? '' : cell).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function unescapePipe(cell) {
  return String(cell).replace(/\\\|/g, '|');
}

function cellWidth(cell) {
  return String(cell).length;
}

/* Build the alignment row cell for one column, padded to the column width. */
export function alignmentCell(alignment, width) {
  const inner = Math.max(width - 2, 1);
  if (alignment === 'center') return ':' + '-'.repeat(inner) + ':';
  if (alignment === 'right') return '-'.repeat(Math.max(width - 1, 1)) + ':';
  return ':' + '-'.repeat(Math.max(width - 1, 1));
}

/* Grid -> Markdown table. Columns are padded so the raw text stays readable. */
export function gridToMarkdown(grid, alignments) {
  const rows = normalizeGrid(grid);
  if (!rows.length) return '';
  const cols = columnCount(rows);
  const aligns = normalizeAlignments(alignments, cols);
  const escaped = rows.map((row) => row.map(escapePipe));
  const widths = [];
  for (let c = 0; c < cols; c += 1) {
    let w = 3;
    for (const row of escaped) w = Math.max(w, cellWidth(row[c]));
    widths[c] = w;
  }
  const renderRow = (row) =>
    '| ' + row.map((cell, c) => cell.padEnd(widths[c])).join(' | ') + ' |';
  const sep =
    '| ' + aligns.map((a, c) => alignmentCell(a, widths[c])).join(' | ') + ' |';
  const lines = [renderRow(escaped[0]), sep];
  for (let r = 1; r < escaped.length; r += 1) lines.push(renderRow(escaped[r]));
  return lines.join('\n');
}

/* Split one Markdown table row on unescaped pipes, dropping the outer pipes. */
export function splitMarkdownRow(line) {
  let s = String(line).trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') {
      cur += '|';
      i += 1;
    } else if (ch === '|') {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function isSeparatorCell(cell) {
  return /^:?-+:?$/.test(cell.trim());
}

/* Parse the alignment row of a Markdown table. Returns null if not a separator. */
export function parseAlignmentRow(line) {
  const cells = splitMarkdownRow(line);
  if (!cells.length || !cells.every(isSeparatorCell)) return null;
  return cells.map((cell) => {
    const c = cell.trim();
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

/* Parse a pasted Markdown table back into a grid. Returns null when the
   text does not contain a table (needs a header row + separator row). */
export function parseMarkdownTable(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  for (let i = 0; i + 1 < lines.length; i += 1) {
    if (!lines[i].includes('|')) continue;
    const alignments = parseAlignmentRow(lines[i + 1]);
    if (!alignments) continue;
    const grid = [splitMarkdownRow(lines[i])];
    for (let j = i + 2; j < lines.length; j += 1) {
      if (!lines[j].includes('|')) break;
      grid.push(splitMarkdownRow(lines[j]));
    }
    const norm = normalizeGrid(grid);
    const aligns = normalizeAlignments(alignments, columnCount(norm));
    return { grid: norm, alignments: aligns };
  }
  return null;
}

/* --- Delimited text (CSV / TSV / semicolon) ------------------------------- */

export function detectDelimiter(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .slice(0, 5);
  if (!lines.length) return ',';
  const score = (delim) => {
    let total = 0;
    for (const line of lines) total += line.split(delim).length - 1;
    return total;
  };
  const tab = score('\t');
  const semi = score(';');
  const comma = score(',');
  if (tab > 0 && tab >= comma && tab >= semi) return '\t';
  if (semi > comma) return ';';
  return ',';
}

/* Parse one delimited line, honoring "quoted fields" and "" escapes. */
export function parseDelimitedLine(line, delim) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/* Parse pasted spreadsheet / CSV / TSV text into a grid. The first row
   becomes the header. Returns null for empty input. */
export function parseDelimited(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (!lines.length) return null;
  const delim = detectDelimiter(text);
  const grid = lines.map((line) => parseDelimitedLine(line, delim));
  return normalizeGrid(grid);
}

/* --- Rendered preview ------------------------------------------------------ */

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Grid -> a plain HTML table string (cells escaped, alignment as inline
   text-align). Safe to inject: every cell passes through escapeHtml. */
export function gridToHtml(grid, alignments) {
  const rows = normalizeGrid(grid);
  if (!rows.length) return '';
  const cols = columnCount(rows);
  const aligns = normalizeAlignments(alignments, cols);
  const style = (c) => (aligns[c] === 'left' ? '' : ` style="text-align:${aligns[c]}"`);
  const head =
    '<tr>' +
    rows[0].map((cell, c) => `<th${style(c)}>${escapeHtml(cell)}</th>`).join('') +
    '</tr>';
  const body = rows
    .slice(1)
    .map(
      (row) =>
        '<tr>' +
        row.map((cell, c) => `<td${style(c)}>${escapeHtml(cell)}</td>`).join('') +
        '</tr>',
    )
    .join('');
  return `<table>${head}${body}</table>`;
}

/* --- Stats ----------------------------------------------------------------- */

export function tableStats(grid, markdown) {
  const rows = rowCount(grid);
  const cols = columnCount(grid);
  const filled = (grid || []).flat().filter((c) => String(c).trim().length > 0).length;
  return {
    rows,
    columns: cols,
    dataRows: Math.max(rows - 1, 0),
    filledCells: filled,
    chars: String(markdown || '').length,
  };
}
