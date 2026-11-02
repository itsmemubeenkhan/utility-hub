/* Cron expression helpers: pure functions, no DOM, no imports, so they can
   be unit-tested in node. Standard 5-field crontab syntax only (no seconds,
   no Quartz L/W/#/?, no @reboot): minute hour day-of-month month day-of-week.
   Matching follows classic cron rules: minute, hour and month must match,
   and day-of-month / day-of-week use OR when both are restricted. */

export const FIELD_DEFS = [
  { key: 'minute', label: 'Minute', min: 0, max: 59 },
  { key: 'hour', label: 'Hour', min: 0, max: 23 },
  { key: 'dom', label: 'Day of month', min: 1, max: 31 },
  { key: 'month', label: 'Month', min: 1, max: 12 },
  { key: 'dow', label: 'Day of week', min: 0, max: 7 },
];

const MONTH_NAMES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const DOW_NAMES = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const MONTH_WORDS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_WORDS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nameToValue(token, field) {
  const lower = token.toLowerCase();
  if (/^\d+$/.test(lower)) return parseInt(lower, 10);
  if (field === 'month' && MONTH_NAMES[lower] !== undefined) return MONTH_NAMES[lower];
  if (field === 'dow' && DOW_NAMES[lower] !== undefined) return DOW_NAMES[lower];
  return NaN;
}

/* Parse one field token into a Set of values, or { error }.
   Accepts *, *\/n, a-b, a-b/n, and comma lists mixing numbers, names and ranges. */
export function parseField(token, field) {
  const def = FIELD_DEFS.find((f) => f.key === field);
  const values = new Set();
  const parts = String(token).split(',');
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (part === '') return { error: 'Empty value in ' + def.label + ' field' };
    let base = part;
    let step = 1;
    const slash = part.indexOf('/');
    if (slash !== -1) {
      base = part.slice(0, slash);
      const stepText = part.slice(slash + 1);
      if (!/^\d+$/.test(stepText) || parseInt(stepText, 10) < 1) {
        return { error: 'Invalid step in ' + def.label + ' field: ' + part };
      }
      step = parseInt(stepText, 10);
    }
    let lo;
    let hi;
    if (base === '*') {
      lo = def.min;
      hi = field === 'dow' ? 6 : def.max;
    } else if (base.indexOf('-') !== -1) {
      const dash = base.split('-');
      if (dash.length !== 2) return { error: 'Invalid range in ' + def.label + ' field: ' + part };
      lo = nameToValue(dash[0], field);
      hi = nameToValue(dash[1], field);
      if (Number.isNaN(lo) || Number.isNaN(hi)) return { error: 'Unknown value in ' + def.label + ' field: ' + part };
    } else {
      lo = nameToValue(base, field);
      hi = lo;
      if (Number.isNaN(lo)) return { error: 'Unknown value in ' + def.label + ' field: ' + part };
    }
    const effMin = def.min;
    const effMax = field === 'dow' ? 7 : def.max;
    if (lo < effMin || hi > effMax || lo > hi) {
      return { error: def.label + ' value out of range: ' + part + ' (allowed ' + effMin + '-' + effMax + ')' };
    }
    for (let v = lo; v <= hi; v += step) values.add(field === 'dow' && v === 7 ? 0 : v);
  }
  return { values, restricted: token.trim() !== '*' };
}

/* Parse a full 5-field expression. Returns { fields } or { error }.
   fields[i] = { values: Set, restricted: bool, raw: string }. */
export function parseCron(expr) {
  const tokens = String(expr || '').trim().split(/\s+/);
  if (tokens.length !== 5) {
    return { error: 'A cron expression needs exactly 5 fields (minute hour day-of-month month day-of-week), got ' + tokens.length };
  }
  const fields = [];
  for (let i = 0; i < 5; i++) {
    const parsed = parseField(tokens[i], FIELD_DEFS[i].key);
    if (parsed.error) return { error: parsed.error };
    fields.push({ values: parsed.values, restricted: parsed.restricted, raw: tokens[i] });
  }
  return { fields, tokens };
}

export function matchesCron(date, fields) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dom = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();
  if (!fields[0].values.has(minute)) return false;
  if (!fields[1].values.has(hour)) return false;
  if (!fields[3].values.has(month)) return false;
  const domOk = fields[2].values.has(dom);
  const dowOk = fields[4].values.has(dow);
  if (fields[2].restricted && fields[4].restricted) return domOk || dowOk;
  if (fields[2].restricted) return domOk;
  if (fields[4].restricted) return dowOk;
  return true;
}

/* Next run times after `from` (exclusive), in the local timezone, stepping
   minute by minute. Scans at most ~5.7 years so impossible schedules
   (February 31) terminate instead of looping forever. */
export function nextRuns(expr, from, count = 5) {
  const parsed = parseCron(expr);
  if (parsed.error) return { runs: [], error: parsed.error };
  const runs = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const MAX_STEPS = 3000000;
  for (let i = 0; i < MAX_STEPS && runs.length < count; i++) {
    if (matchesCron(cursor, parsed.fields)) runs.push(new Date(cursor.getTime()));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return { runs, error: null };
}

/* Plain-English description of one field, in EN or ES. */
function describeField(field, token, lang) {
  const es = lang === 'es';
  const def = FIELD_DEFS.find((f) => f.key === field);
  const t = token.trim();
  if (t === '*') {
    return es
      ? { minute: 'cada minuto', hour: 'cada hora', dom: 'cada dia del mes', month: 'cada mes', dow: 'cada dia de la semana' }[field]
      : { minute: 'every minute', hour: 'every hour', dom: 'every day of the month', month: 'every month', dow: 'every day of the week' }[field];
  }
  if (t.indexOf('/') !== -1) {
    const parts = t.split('/');
    const step = parts[1];
    if (parts[0] === '*') {
      return es ? 'cada ' + step + ' ' + { minute: 'minutos', hour: 'horas', dom: 'dias', month: 'meses', dow: 'dias' }[field]
        : 'every ' + step + ' ' + { minute: 'minutes', hour: 'hours', dom: 'days', month: 'months', dow: 'days' }[field];
    }
    return es ? 'cada ' + step + ' a partir de ' + parts[0] : 'every ' + step + ' starting at ' + parts[0];
  }
  if (t.indexOf('-') !== -1 && t.indexOf(',') === -1) {
    const dash = t.split('-');
    const fmt = (v) => {
      const n = nameToValue(v, field);
      if (field === 'month' && !Number.isNaN(n)) return es ? MONTH_WORDS[n] : MONTH_WORDS[n];
      if (field === 'dow' && !Number.isNaN(n)) return es ? ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][n] : DOW_WORDS[n];
      return v;
    };
    return (es ? 'de ' : 'from ') + fmt(dash[0]) + (es ? ' a ' : ' to ') + fmt(dash[1]);
  }
  const list = t.split(',').map((v) => {
    const n = nameToValue(v, field);
    if (field === 'month' && !Number.isNaN(n)) return MONTH_WORDS[n];
    if (field === 'dow' && !Number.isNaN(n)) return es ? ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][n] : DOW_WORDS[n];
    return v;
  });
  const joined = list.length > 1 ? list.slice(0, -1).join(', ') + (es ? ' y ' : ' and ') + list[list.length - 1] : list[0];
  if (field === 'minute') return (es ? 'en el minuto ' : 'at minute ') + joined;
  if (field === 'hour') return (es ? 'a la hora ' : 'at hour ') + joined;
  if (field === 'dom') return (es ? 'el dia ' : 'on day ') + joined + (es ? ' del mes' : ' of the month');
  if (field === 'month') return (es ? 'en ' : 'in ') + joined;
  return (es ? 'el ' : 'on ') + joined;
}

export function describeCron(expr, lang = 'en') {
  const parsed = parseCron(expr);
  if (parsed.error) return { text: null, error: parsed.error };
  const keys = ['minute', 'hour', 'dom', 'month', 'dow'];
  const parts = parsed.tokens.map((tok, i) => describeField(keys[i], tok, lang));
  const text = lang === 'es'
    ? 'Se ejecuta ' + parts.join(', ') + '.'
    : 'Runs ' + parts.join(', ') + '.';
  return { text, error: null };
}

/* Builder: turn one field's mode config into its cron token. */
export function buildField(field, cfg) {
  const def = FIELD_DEFS.find((f) => f.key === field);
  if (cfg.mode === 'every') return '*';
  if (cfg.mode === 'step') {
    const n = Math.max(1, parseInt(cfg.step, 10) || 1);
    return '*/' + n;
  }
  if (cfg.mode === 'range') {
    const from = Math.min(Math.max(def.min, parseInt(cfg.from, 10) || def.min), def.max);
    const to = Math.min(Math.max(def.min, parseInt(cfg.to, 10) || def.max), def.max);
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const step = parseInt(cfg.step, 10);
    return lo + '-' + hi + (step && step > 1 ? '/' + step : '');
  }
  const vals = String(cfg.values || '')
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');
  return vals.length ? vals.join(',') : '*';
}

/* Best-effort reverse: token -> builder config, for syncing typed expressions. */
export function fieldToConfig(token) {
  const t = String(token).trim();
  if (t === '*') return { mode: 'every', step: 5, values: '', from: '', to: '' };
  if (/^\*\/\d+$/.test(t)) return { mode: 'step', step: parseInt(t.slice(2), 10), values: '', from: '', to: '' };
  const rangeMatch = t.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
  if (rangeMatch) {
    return { mode: 'range', step: rangeMatch[3] ? parseInt(rangeMatch[3], 10) : 1, values: '', from: rangeMatch[1], to: rangeMatch[2] };
  }
  return { mode: 'list', step: 5, values: t, from: '', to: '' };
}

export const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Daily at 9:00 AM', expr: '0 9 * * *' },
  { label: 'Weekdays at 9:00 AM', expr: '0 9 * * 1-5' },
  { label: 'Every Sunday at midnight', expr: '0 0 * * 0' },
  { label: '1st of every month', expr: '0 0 1 * *' },
  { label: 'Every 15 min, office hours', expr: '*/15 9-17 * * 1-5' },
];
