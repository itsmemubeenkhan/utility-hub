/* JSON <-> CSV conversion, pure functions (no DOM, no imports).
   JSON -> CSV: flattens nested objects with dot notation, escapes fields
   per RFC 4180, supports comma/semicolon/tab/pipe delimiters. CSV -> JSON:
   a small state-machine parser that handles quoted fields, embedded
   delimiters, escaped quotes and CRLF line endings. */

export function flattenObject(obj, prefix, out) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const path = prefix ? prefix + '.' + key : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenObject(val, path, out);
    } else if (Array.isArray(val)) {
      out[path] = val.map((v) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v))).join('; ');
    } else if (val === null || val === undefined) {
      out[path] = '';
    } else if (typeof val === 'object') {
      out[path] = JSON.stringify(val);
    } else {
      out[path] = String(val);
    }
  }
  return out;
}

/* Accepts an array of objects, a single object, or a wrapper object whose
   first array-valued key holds the records (common paginated API shape). */
export function extractRecords(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed !== null && typeof parsed === 'object') {
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
    return [parsed];
  }
  throw new Error('Top-level JSON must be an array or an object.');
}

function csvEscape(field, delimiter) {
  if (field.includes('"') || field.includes(delimiter) || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

export function jsonToCsv(records, options) {
  const opts = options || {};
  const delimiter = opts.delimiter || ',';
  const includeHeader = opts.header !== false;
  const rows = records.map((r) => {
    if (r === null || typeof r !== 'object' || Array.isArray(r)) throw new Error('Each record must be a JSON object.');
    return flattenObject(r, '', {});
  });
  const columns = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key);
  }
  const lines = [];
  if (includeHeader) lines.push(columns.map((c) => csvEscape(c, delimiter)).join(delimiter));
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(row[c] === undefined ? '' : row[c], delimiter)).join(delimiter));
  }
  return { csv: lines.join('\n'), rows: rows.length, columns: columns.length, columnNames: columns };
}

export function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; }
        else { inQuotes = false; i += 1; }
      } else { field += ch; i += 1; }
    } else if (ch === '"') {
      if (field === '') { inQuotes = true; i += 1; }
      else { field += ch; i += 1; }
    } else if (ch === delimiter) {
      pushField(); i += 1;
    } else if (ch === '\r') {
      if (text[i + 1] === '\n') i += 2; else i += 1;
      pushRow();
    } else if (ch === '\n') {
      pushRow(); i += 1;
    } else { field += ch; i += 1; }
  }
  if (inQuotes) throw new Error('Unclosed quote in CSV input.');
  if (field !== '' || row.length > 0) pushRow();
  // Drop a single trailing empty row produced by a final newline.
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}

export function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== '') || '';
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const d of candidates) {
    let count = 0;
    let inQ = false;
    for (let i = 0; i < firstLine.length; i += 1) {
      const ch = firstLine[i];
      if (ch === '"') inQ = !inQ;
      else if (!inQ && ch === d) count += 1;
    }
    if (count > bestCount) { bestCount = count; best = d; }
  }
  return best;
}

function inferValue(raw) {
  if (raw === '') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    if (String(n) === raw || raw === '-0' || /^-?\d+\.\d+$/.test(raw)) return n;
  }
  return raw;
}

export function csvToJson(rows, options) {
  const opts = options || {};
  if (rows.length === 0) throw new Error('CSV input is empty.');
  const hasHeader = opts.header !== false;
  const headers = hasHeader ? rows[0] : rows[0].map((_, i) => 'column' + (i + 1));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const records = dataRows.map((r) => {
    const obj = {};
    headers.forEach((h, i) => {
      const raw = r[i] === undefined ? '' : r[i];
      obj[h === '' ? 'column' + (i + 1) : h] = opts.inferTypes ? inferValue(raw) : raw;
    });
    return obj;
  });
  return { records, rows: records.length, columns: headers.length };
}
