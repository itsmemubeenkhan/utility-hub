'use client';
/* Unix Timestamp Converter: timestamp -> date (seconds/ms/us/ns, auto-detect,
   UTC + local + chosen timezone, relative time, batch mode) and date -> timestamp.
   Everything runs in the browser; nothing is uploaded. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { detectUnit, toMilliseconds, fromMilliseconds, formatUtc, formatIso, batchConvert } from '@/lib/timestamp-utils';

const TIMEZONES = [
  { value: 'UTC', en: 'UTC', es: 'UTC' },
  { value: 'local', en: 'Your local time', es: 'Tu hora local' },
  { value: 'America/New_York', en: 'New York (ET)', es: 'Nueva York (ET)' },
  { value: 'America/Chicago', en: 'Chicago (CT)', es: 'Chicago (CT)' },
  { value: 'America/Denver', en: 'Denver (MT)', es: 'Denver (MT)' },
  { value: 'America/Los_Angeles', en: 'Los Angeles (PT)', es: 'Los Ángeles (PT)' },
  { value: 'Europe/London', en: 'London (GMT)', es: 'Londres (GMT)' },
  { value: 'Europe/Berlin', en: 'Berlin (CET)', es: 'Berlín (CET)' },
  { value: 'Asia/Karachi', en: 'Karachi (PKT)', es: 'Karachi (PKT)' },
  { value: 'Asia/Dubai', en: 'Dubai (GST)', es: 'Dubái (GST)' },
  { value: 'Asia/Kolkata', en: 'Kolkata (IST)', es: 'Calcuta (IST)' },
  { value: 'Asia/Tokyo', en: 'Tokyo (JST)', es: 'Tokio (JST)' },
  { value: 'Australia/Sydney', en: 'Sydney (AEST)', es: 'Sídney (AEST)' },
];

const STR = {
  en: {
    liveNow: 'Current Unix time',
    seconds: 'seconds',
    milliseconds: 'milliseconds',
    modeTs: 'Timestamp to date',
    modeDate: 'Date to timestamp',
    modeBatch: 'Batch convert',
    tsLabel: 'Unix timestamp',
    tsPlaceholder: 'e.g. 1700000000 or 1700000000000',
    unit: 'Unit',
    auto: 'Auto-detect',
    sec: 'Seconds (10 digits)',
    ms: 'Milliseconds (13 digits)',
    us: 'Microseconds (16 digits)',
    ns: 'Nanoseconds (19 digits)',
    timezone: 'Timezone',
    convert: 'Convert',
    useNow: 'Use current time',
    dateLabel: 'Date and time (UTC)',
    copy: 'Copy',
    copied: 'Copied!',
    batchLabel: 'Timestamps, one per line',
    batchPlaceholder: '1700000000\n1700000000000\n946684800',
    convertBatch: 'Convert all',
    copyCsv: 'Copy as CSV',
    results: 'Results',
    utc: 'UTC',
    iso: 'ISO 8601',
    rfc: 'RFC 2822 (GMT)',
    local: 'Your local time',
    inTz: 'In selected timezone',
    relative: 'Relative time',
    detected: 'Detected unit',
    outSeconds: 'Unix seconds',
    outMs: 'Unix milliseconds',
    outUs: 'Unix microseconds',
    empty: 'Your conversion will appear here. Enter a timestamp or a date and press Convert.',
    errorPrefix: 'Could not convert: ',
    invalidNumber: 'Enter a numeric timestamp.',
    invalidDate: 'Enter a valid date and time.',
    ago: 'ago',
    inWord: 'in',
    secondWord: 'second',
    secondsWord: 'seconds',
    minuteWord: 'minute',
    minutesWord: 'minutes',
    hourWord: 'hour',
    hoursWord: 'hours',
    dayWord: 'day',
    daysWord: 'days',
    monthWord: 'month',
    monthsWord: 'months',
    yearWord: 'year',
    yearsWord: 'years',
    batchEmpty: 'Paste at least one timestamp.',
    batchInvalid: 'invalid',
    seeAlso: 'More developer tools',
    privacy: 'Privacy: conversion runs locally in your browser. Nothing you enter is uploaded or logged.',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/text-diff-checker', label: 'Text Diff Checker' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
    ],
  },
  es: {
    liveNow: 'Hora Unix actual',
    seconds: 'segundos',
    milliseconds: 'milisegundos',
    modeTs: 'Timestamp a fecha',
    modeDate: 'Fecha a timestamp',
    modeBatch: 'Conversión por lotes',
    tsLabel: 'Timestamp Unix',
    tsPlaceholder: 'ej. 1700000000 o 1700000000000',
    unit: 'Unidad',
    auto: 'Detectar automáticamente',
    sec: 'Segundos (10 dígitos)',
    ms: 'Milisegundos (13 dígitos)',
    us: 'Microsegundos (16 dígitos)',
    ns: 'Nanosegundos (19 dígitos)',
    timezone: 'Zona horaria',
    convert: 'Convertir',
    useNow: 'Usar la hora actual',
    dateLabel: 'Fecha y hora (UTC)',
    copy: 'Copiar',
    copied: '¡Copiado!',
    batchLabel: 'Timestamps, uno por línea',
    batchPlaceholder: '1700000000\n1700000000000\n946684800',
    convertBatch: 'Convertir todos',
    copyCsv: 'Copiar como CSV',
    results: 'Resultados',
    utc: 'UTC',
    iso: 'ISO 8601',
    rfc: 'RFC 2822 (GMT)',
    local: 'Tu hora local',
    inTz: 'En la zona horaria elegida',
    relative: 'Tiempo relativo',
    detected: 'Unidad detectada',
    outSeconds: 'Segundos Unix',
    outMs: 'Milisegundos Unix',
    outUs: 'Microsegundos Unix',
    empty: 'Tu conversión aparecerá aquí. Ingresa un timestamp o una fecha y pulsa Convertir.',
    errorPrefix: 'No se pudo convertir: ',
    invalidNumber: 'Ingresa un timestamp numérico.',
    invalidDate: 'Ingresa una fecha y hora válidas.',
    ago: 'atrás',
    inWord: 'en',
    secondWord: 'segundo',
    secondsWord: 'segundos',
    minuteWord: 'minuto',
    minutesWord: 'minutos',
    hourWord: 'hora',
    hoursWord: 'horas',
    dayWord: 'día',
    daysWord: 'días',
    monthWord: 'mes',
    monthsWord: 'meses',
    yearWord: 'año',
    yearsWord: 'años',
    batchEmpty: 'Pega al menos un timestamp.',
    batchInvalid: 'inválido',
    seeAlso: 'Más herramientas para desarrolladores',
    privacy: 'Privacidad: la conversión corre localmente en tu navegador. Nada de lo que ingresas se sube ni se registra.',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/comparador-de-textos', label: 'Comparador de Textos' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
    ],
  },
};

const btnStyle = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};
const primaryBtnStyle = { ...btnStyle, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const selectStyle = { padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', background: '#fff' };

function relativeLocalized(ms, s, nowMs) {
  const diffSec = Math.round((ms - nowMs) / 1000);
  const future = diffSec > 0;
  const abs = Math.abs(diffSec);
  let value;
  let singular;
  let plural;
  if (abs < 60) { value = abs; singular = s.secondWord; plural = s.secondsWord; }
  else if (abs < 3600) { value = Math.round(abs / 60); singular = s.minuteWord; plural = s.minutesWord; }
  else if (abs < 86400) { value = Math.round(abs / 3600); singular = s.hourWord; plural = s.hoursWord; }
  else if (abs < 86400 * 30) { value = Math.round(abs / 86400); singular = s.dayWord; plural = s.daysWord; }
  else if (abs < 86400 * 365) { value = Math.round(abs / (86400 * 30)); singular = s.monthWord; plural = s.monthsWord; }
  else { value = Math.round(abs / (86400 * 365)); singular = s.yearWord; plural = s.yearsWord; }
  const word = value === 1 ? singular : plural;
  return future ? `${s.inWord} ${value} ${word}` : `${value} ${word} ${s.ago}`;
}

function formatInTimezone(ms, tz) {
  if (tz === 'UTC') return formatUtc(ms);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz === 'local' ? undefined : tz,
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date(ms));
  } catch {
    return formatUtc(ms);
  }
}

export default function TimestampTool({ lang }) {
  const s = STR[lang] || STR.en;
  const [mode, setMode] = useState('ts');
  const [now, setNow] = useState(() => Date.now());
  const [tsInput, setTsInput] = useState('1700000000');
  const [unit, setUnit] = useState('auto');
  const [tz, setTz] = useState('UTC');
  const [dateInput, setDateInput] = useState('2023-11-14T22:13:20');
  const [batchInput, setBatchInput] = useState('');
  const [result, setResult] = useState(null);
  const [batchRows, setBatchRows] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const runTs = () => {
    setError(''); setCopied(false); setBatchRows(null);
    const raw = tsInput.trim();
    if (!raw || Number.isNaN(Number(raw))) { setError(s.errorPrefix + s.invalidNumber); setResult(null); return; }
    try {
      const ms = toMilliseconds(raw, unit);
      const d = new Date(ms);
      if (Number.isNaN(d.getTime())) throw new Error('invalid');
      const detected = detectUnit(Number(raw));
      const parts = fromMilliseconds(ms);
      setResult({
        ms,
        rows: [
          { label: s.utc, value: formatUtc(ms) },
          { label: s.iso, value: formatIso(ms) },
          { label: s.rfc, value: formatUtc(ms) },
          { label: s.local, value: d.toLocaleString() },
          { label: s.inTz, value: formatInTimezone(ms, tz) },
          { label: s.relative, value: relativeLocalized(ms, s, now) },
          { label: s.detected, value: detected === 's' ? s.sec : detected === 'ms' ? s.ms : detected === 'us' ? s.us : s.ns },
          { label: s.outSeconds, value: String(parts.seconds) },
          { label: s.outMs, value: String(parts.milliseconds) },
          { label: s.outUs, value: String(parts.microseconds) },
        ],
      });
    } catch {
      setError(s.errorPrefix + s.invalidNumber); setResult(null);
    }
  };

  const runDate = () => {
    setError(''); setCopied(false); setBatchRows(null);
    const d = new Date(dateInput + 'Z');
    if (Number.isNaN(d.getTime())) { setError(s.errorPrefix + s.invalidDate); setResult(null); return; }
    const parts = fromMilliseconds(d.getTime());
    setResult({
      ms: d.getTime(),
      rows: [
        { label: s.utc, value: formatUtc(d.getTime()) },
        { label: s.iso, value: formatIso(d.getTime()) },
        { label: s.outSeconds, value: String(parts.seconds) },
        { label: s.outMs, value: String(parts.milliseconds) },
        { label: s.outUs, value: String(parts.microseconds) },
      ],
    });
  };

  const runBatch = () => {
    setError(''); setCopied(false); setResult(null);
    if (!batchInput.trim()) { setError(s.errorPrefix + s.batchEmpty); setBatchRows(null); return; }
    setBatchRows(batchConvert(batchInput, unit));
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{s.liveNow}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'ui-monospace, monospace', margin: '6px 0' }}>
          {Math.floor(now / 1000)}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {now} {s.milliseconds}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'ts', label: s.modeTs },
          { key: 'date', label: s.modeDate },
          { key: 'batch', label: s.modeBatch },
        ].map((m) => (
          <button key={m.key} type="button" onClick={() => { setMode(m.key); setError(''); }}
            style={mode === m.key ? primaryBtnStyle : btnStyle}>{m.label}</button>
        ))}
      </div>

      {mode === 'ts' && (
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.tsLabel}</label>
          <input value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder={s.tsPlaceholder} style={inputStyle} inputMode="numeric" />
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <label>{s.unit}: <select value={unit} onChange={(e) => setUnit(e.target.value)} style={selectStyle}>
              <option value="auto">{s.auto}</option>
              <option value="s">{s.sec}</option>
              <option value="ms">{s.ms}</option>
              <option value="us">{s.us}</option>
              <option value="ns">{s.ns}</option>
            </select></label>
            <label>{s.timezone}: <select value={tz} onChange={(e) => setTz(e.target.value)} style={selectStyle}>
              {TIMEZONES.map((z) => (<option key={z.value} value={z.value}>{lang === 'es' ? z.es : z.en}</option>))}
            </select></label>
            <button type="button" onClick={runTs} style={primaryBtnStyle}>{s.convert}</button>
            <button type="button" onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))} style={btnStyle}>{s.useNow}</button>
          </div>
        </div>
      )}

      {mode === 'date' && (
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.dateLabel}</label>
          <input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} style={inputStyle} step="1" />
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={runDate} style={primaryBtnStyle}>{s.convert}</button>
          </div>
        </div>
      )}

      {mode === 'batch' && (
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.batchLabel}</label>
          <textarea value={batchInput} onChange={(e) => setBatchInput(e.target.value)} placeholder={s.batchPlaceholder}
            style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <label>{s.unit}: <select value={unit} onChange={(e) => setUnit(e.target.value)} style={selectStyle}>
              <option value="auto">{s.auto}</option>
              <option value="s">{s.sec}</option>
              <option value="ms">{s.ms}</option>
              <option value="us">{s.us}</option>
              <option value="ns">{s.ns}</option>
            </select></label>
            <button type="button" onClick={runBatch} style={primaryBtnStyle}>{s.convertBatch}</button>
            {batchRows && (
              <button type="button" onClick={() => copyText(batchRows.map((r) => r.error ? `${r.input},${s.batchInvalid}` : `${r.input},${r.iso}`).join('\n'))} style={btnStyle}>
                {copied ? s.copied : s.copyCsv}
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontWeight: 600, marginTop: 16 }}>{error}</p>}

      {result && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>{s.results}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.label} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 8px 8px 0', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>{r.label}</td>
                  <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>{r.value}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button type="button" onClick={() => copyText(r.value)} style={{ ...btnStyle, padding: '4px 10px', fontSize: '0.8rem' }}>{copied ? s.copied : s.copy}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {batchRows && (
        <div className="card" style={{ marginTop: 20, overflowX: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>{s.results}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 8 }}>Timestamp</th>
                <th style={{ padding: 8 }}>ISO 8601</th>
                <th style={{ padding: 8 }}>UTC</th>
              </tr>
            </thead>
            <tbody>
              {batchRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>{r.input}</td>
                  <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>{r.error ? s.batchInvalid : r.iso}</td>
                  <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>{r.error ? s.batchInvalid : r.utc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!result && !batchRows && !error && <p style={{ color: '#64748b', marginTop: 16 }}>{s.empty}</p>}

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 20 }}>{s.privacy}</p>
      <div style={{ marginTop: 16 }}>
        <strong>{s.seeAlso}:</strong>{' '}
        {s.siblings.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
