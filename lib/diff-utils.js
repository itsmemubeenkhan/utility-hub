/* Pure text-diff helpers (no DOM, so node can test them).
   Line-level diff via longest-common-subsequence on normalized lines,
   plus word-level highlighting inside a changed line pair. Everything
   runs in the browser; nothing is uploaded. */

export function normalizeLine(line, { ignoreWhitespace = false, ignoreCase = false } = {}) {
  let s = String(line ?? '');
  if (ignoreWhitespace) s = s.trim().replace(/\s+/g, ' ');
  if (ignoreCase) s = s.toLowerCase();
  return s;
}

function splitLines(text) {
  const s = String(text ?? '');
  if (s === '') return [];
  return s.split(/\r\n|\r|\n/);
}

/* LCS table + backtrack. Returns ops in order:
   { type: 'same'|'remove'|'add', aIndex, bIndex, aLine, bLine } */
export function diffLines(aText, bText, opts = {}) {
  const a = splitLines(aText);
  const b = splitLines(bText);
  const na = a.map((l) => normalizeLine(l, opts));
  const nb = b.map((l) => normalizeLine(l, opts));
  const n = a.length;
  const m = b.length;
  // DP table of LCS lengths, (n+1) x (m+1)
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = na[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (na[i] === nb[j]) {
      ops.push({ type: 'same', aIndex: i, bIndex: j, aLine: a[i], bLine: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', aIndex: i, bIndex: null, aLine: a[i], bLine: null });
      i++;
    } else {
      ops.push({ type: 'add', aIndex: null, bIndex: j, aLine: null, bLine: b[j] });
      j++;
    }
  }
  while (i < n) { ops.push({ type: 'remove', aIndex: i, bIndex: null, aLine: a[i], bLine: null }); i++; }
  while (j < m) { ops.push({ type: 'add', aIndex: null, bIndex: j, aLine: null, bLine: b[j] }); j++; }
  return ops;
}

export function summarizeDiff(ops) {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const op of ops) {
    if (op.type === 'add') added++;
    else if (op.type === 'remove') removed++;
    else unchanged++;
  }
  return { added, removed, unchanged, total: ops.length };
}

/* Word-level diff between two lines. Tokens are words plus the
   separators between them, so spacing is preserved in the output.
   Returns { oldSegs, newSegs } with segments { text, changed }. */
export function wordDiff(oldLine, newLine, { ignoreCase = false } = {}) {
  const tokenize = (s) => String(s ?? '').match(/\s+|[^\s]+/g) || [];
  const a = tokenize(oldLine);
  const b = tokenize(newLine);
  const ka = ignoreCase ? a.map((t) => t.toLowerCase()) : a;
  const kb = ignoreCase ? b.map((t) => t.toLowerCase()) : b;
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ka[i] === kb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const oldSegs = [];
  const newSegs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (ka[i] === kb[j]) {
      oldSegs.push({ text: a[i], changed: false });
      newSegs.push({ text: b[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      oldSegs.push({ text: a[i], changed: true });
      i++;
    } else {
      newSegs.push({ text: b[j], changed: true });
      j++;
    }
  }
  while (i < n) { oldSegs.push({ text: a[i], changed: true }); i++; }
  while (j < m) { newSegs.push({ text: b[j], changed: true }); j++; }
  return { oldSegs, newSegs };
}

/* Unified diff text for copy/download. Unchanged lines get a leading
   space, removals -, additions +. */
export function toUnifiedText(ops) {
  return ops.map((op) => {
    if (op.type === 'remove') return '- ' + op.aLine;
    if (op.type === 'add') return '+ ' + op.bLine;
    return '  ' + op.aLine;
  }).join('\n');
}
