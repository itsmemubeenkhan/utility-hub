/* Pure duplicate-line helpers (no DOM, so they run in both browser and node).
   A line is a duplicate when its comparison key matches another line's key.
   The key is the processed line: trimmed when trimLines is on, internal
   whitespace collapsed when normalizeSpaces is on, lowercased with
   toLowerCase (Unicode case folding) when ignoreCase is on. Modes:
   'unique' keeps one copy per line (first or last), 'onlyUnique' keeps only
   lines that appear exactly once, 'onlyDuplicates' keeps one copy of each
   line that appears more than once. The removed audit lists every line
   dropped from the output with how many copies of it were removed, so the
   counts always add up to stats.removed. CRLF and lone CR line endings are
   handled, and an empty input returns zero lines instead of one blank line. */

export const SAMPLE_LINES = 'Apple\nBanana\napple\n  Banana  \nOrange\nApple\n\nBanana\nGrapes\norange';

/* Deduplicate lines. Options: mode ('unique', 'onlyUnique' or
   'onlyDuplicates'), keep ('first' or 'last'), ignoreCase, trimLines,
   normalizeSpaces, removeEmpty, sort ('preserve', 'asc' or 'desc').
   Returns { lines, removed: [{ line, count }], stats: { total, unique,
   removed } }. */
export function dedupeLines(text, options = {}) {
  const {
    mode = 'unique',
    keep = 'first',
    ignoreCase = false,
    trimLines = true,
    normalizeSpaces = false,
    removeEmpty = false,
    sort = 'preserve',
  } = options;
  const src = String(text ?? '');
  if (!src) {
    return { lines: [], removed: [], stats: { total: 0, unique: 0, removed: 0 } };
  }
  const rawLines = src.split(/\r\n|\n|\r/);
  const entries = rawLines.map((raw) => {
    let processed = raw;
    if (normalizeSpaces) processed = processed.replace(/\s+/g, ' ').trim();
    else if (trimLines) processed = processed.trim();
    const key = ignoreCase ? processed.toLowerCase() : processed;
    return { raw, processed, key, isEmpty: processed.trim() === '' };
  });
  const usable = removeEmpty ? entries.filter((e) => !e.isEmpty) : entries;
  const emptyDropped = rawLines.length - usable.length;

  const groups = new Map();
  usable.forEach((e, idx) => {
    if (!groups.has(e.key)) {
      groups.set(e.key, { key: e.key, count: 0, first: e, last: e, firstIdx: idx, lastIdx: idx });
    }
    const g = groups.get(e.key);
    g.count += 1;
    g.last = e;
    g.lastIdx = idx;
  });

  const rep = (g) => (keep === 'last' ? g.last.processed : g.first.processed);
  const byFirst = (a, b) => a.firstIdx - b.firstIdx;
  const byLast = (a, b) => a.lastIdx - b.lastIdx;
  const order = keep === 'last' ? byLast : byFirst;

  let kept = [];
  if (mode === 'onlyUnique') {
    kept = [...groups.values()].filter((g) => g.count === 1).sort(byFirst);
  } else if (mode === 'onlyDuplicates') {
    kept = [...groups.values()].filter((g) => g.count > 1).sort(order);
  } else {
    kept = [...groups.values()].sort(order);
  }
  const keptKeys = new Set(kept.map((g) => g.key));
  let out = kept.map(rep);

  if (sort === 'asc') out = [...out].sort((a, b) => a.localeCompare(b));
  else if (sort === 'desc') out = [...out].sort((a, b) => b.localeCompare(a));

  const removed = [];
  [...groups.values()].sort(byFirst).forEach((g) => {
    const dropped = g.count - (keptKeys.has(g.key) ? 1 : 0);
    if (dropped > 0) removed.push({ line: rep(g), count: dropped });
  });
  if (emptyDropped > 0) removed.push({ line: '', count: emptyDropped });

  return {
    lines: out,
    removed,
    stats: { total: rawLines.length, unique: groups.size, removed: rawLines.length - out.length },
  };
}
