/* Pure Unix timestamp helpers: unit detection, conversion, formatting.
   No browser APIs here so the math is unit-testable in node. */

export function detectUnit(value) {
  const abs = Math.abs(Number(value));
  if (!Number.isFinite(abs)) return null;
  if (abs >= 1e17) return 'ns';
  if (abs >= 1e14) return 'us';
  if (abs >= 1e11) return 'ms';
  return 's';
}

export function toMilliseconds(value, unit = 'auto') {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('not-a-number');
  const u = unit === 'auto' ? detectUnit(n) : unit;
  if (u === 's') return n * 1000;
  if (u === 'ms') return n;
  if (u === 'us') return n / 1000;
  if (u === 'ns') return n / 1e6;
  throw new Error('unknown-unit');
}

export function fromMilliseconds(ms) {
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: Math.floor(ms),
    microseconds: Math.floor(ms * 1000),
  };
}

export function formatUtc(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) throw new Error('invalid-date');
  return d.toUTCString();
}

export function formatIso(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) throw new Error('invalid-date');
  return d.toISOString();
}

/* Relative time in plain words, e.g. "3 hours ago" / "in 2 days".
   Kept English here; the component localizes the suffix words. */
export function relativeParts(ms, nowMs = Date.now()) {
  const diffSec = Math.round((ms - nowMs) / 1000);
  const future = diffSec > 0;
  const abs = Math.abs(diffSec);
  let value;
  let unit;
  if (abs < 60) { value = abs; unit = 'seconds'; }
  else if (abs < 3600) { value = Math.round(abs / 60); unit = 'minutes'; }
  else if (abs < 86400) { value = Math.round(abs / 3600); unit = 'hours'; }
  else if (abs < 86400 * 30) { value = Math.round(abs / 86400); unit = 'days'; }
  else if (abs < 86400 * 365) { value = Math.round(abs / (86400 * 30)); unit = 'months'; }
  else { value = Math.round(abs / (86400 * 365)); unit = 'years'; }
  return { value, unit, future };
}

export function relativeText(ms, nowMs = Date.now()) {
  const { value, unit, future } = relativeParts(ms, nowMs);
  const singular = value === 1 ? unit.slice(0, -1) : unit;
  return future ? `in ${value} ${singular}` : `${value} ${singular} ago`;
}

/* One timestamp per line -> [{input, ms, iso, utc, error}]. Blank lines skipped. */
export function batchConvert(text, unit = 'auto') {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((input) => {
      try {
        const ms = toMilliseconds(input, unit);
        if (ms < -62135596800000 || ms > 253402300799999) throw new Error('out-of-range');
        return { input, ms, iso: formatIso(ms), utc: formatUtc(ms), error: null };
      } catch {
        return { input, ms: null, iso: null, utc: null, error: 'invalid' };
      }
    });
}
