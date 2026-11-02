'use client';
/* Cron Expression Builder: build a 5-field crontab expression from per-field
   controls, or paste one to explain it in plain English and preview the next
   run times. Everything runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FIELD_DEFS,
  parseCron,
  describeCron,
  nextRuns,
  buildField,
  fieldToConfig,
  PRESETS,
} from '@/lib/cron-utils';

const STR = {
  en: {
    exprLabel: 'Cron expression (5 fields: minute hour day-of-month month day-of-week)',
    builderTitle: 'Build it field by field',
    modeEvery: 'Every',
    modeStep: 'Every N',
    modeList: 'Specific values',
    modeRange: 'Range',
    stepLabel: 'Step',
    valuesPlaceholder: 'e.g. 0,15,30,45',
    fromLabel: 'From',
    toLabel: 'To',
    presetsTitle: 'Common schedules',
    descTitle: 'What this schedule means',
    runsTitle: 'Next run times',
    runsNote: 'Shown in your browser timezone. Your server or scheduler may run in a different timezone, so check that before deploying.',
    fewRuns: 'Fewer than 5 runs found in the next ~5 years. This schedule may never match a real date (for example, February 31).',
    noRuns: 'No run found in the next ~5 years. This schedule never matches a real date (for example, February 31).',
    invalid: 'Invalid expression: ',
    crontabTitle: 'Crontab line',
    commandLabel: 'Command (optional)',
    commandPlaceholder: '/usr/local/bin/backup.sh',
    copy: 'Copy',
    copied: 'Copied!',
    fieldRefTitle: 'Field reference',
    fieldCol: 'Field',
    rangeCol: 'Allowed',
    namesCol: 'Names allowed',
    symbolsTitle: 'Symbols cheat sheet',
    privacy: 'Privacy: building, explaining and previewing run entirely in your browser. Nothing you type is uploaded, stored or logged.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/unix-timestamp-converter', label: 'Unix Timestamp Converter' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/regex-tester', label: 'Regex Tester' },
    ],
  },
  es: {
    exprLabel: 'Expresion cron (5 campos: minuto hora dia-del-mes mes dia-de-la-semana)',
    builderTitle: 'Construyela campo por campo',
    modeEvery: 'Cada',
    modeStep: 'Cada N',
    modeList: 'Valores especificos',
    modeRange: 'Rango',
    stepLabel: 'Paso',
    valuesPlaceholder: 'ej. 0,15,30,45',
    fromLabel: 'Desde',
    toLabel: 'Hasta',
    presetsTitle: 'Horarios comunes',
    descTitle: 'Que significa este horario',
    runsTitle: 'Proximas ejecuciones',
    runsNote: 'Se muestra en la zona horaria de tu navegador. Tu servidor o programador puede usar otra zona horaria, asi que revisala antes de desplegar.',
    fewRuns: 'Se encontraron menos de 5 ejecuciones en los proximos ~5 anos. Este horario podria no coincidir nunca con una fecha real (por ejemplo, 31 de febrero).',
    noRuns: 'No se encontro ninguna ejecucion en los proximos ~5 anos. Este horario nunca coincide con una fecha real (por ejemplo, 31 de febrero).',
    invalid: 'Expresion invalida: ',
    crontabTitle: 'Linea de crontab',
    commandLabel: 'Comando (opcional)',
    commandPlaceholder: '/usr/local/bin/backup.sh',
    copy: 'Copiar',
    copied: 'Copiado!',
    fieldRefTitle: 'Referencia de campos',
    fieldCol: 'Campo',
    rangeCol: 'Permitido',
    namesCol: 'Nombres permitidos',
    symbolsTitle: 'Simbolos',
    privacy: 'Privacidad: construir, explicar y previsualizar corre por completo en tu navegador. Nada de lo que escribes se sube, guarda ni registra.',
    seeAlso: 'Mas herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/convertidor-de-timestamp-unix', label: 'Convertidor de Timestamp Unix' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/probador-de-regex', label: 'Probador de Regex' },
    ],
  },
};

const FIELD_NAMES_ES = ['Minuto', 'Hora', 'Dia del mes', 'Mes', 'Dia de la semana'];
const FIELD_NAMES_EN = ['Minute', 'Hour', 'Day of month', 'Month', 'Day of week'];

function defaultConfigs() {
  const cfg = {};
  FIELD_DEFS.forEach((f) => {
    cfg[f.key] = { mode: 'every', step: 5, values: '', from: '', to: '' };
  });
  return cfg;
}

function exprFromConfigs(configs) {
  return FIELD_DEFS.map((f) => buildField(f.key, configs[f.key])).join(' ');
}

export default function CronTool({ lang = 'en' }) {
  const L = STR[lang] || STR.en;
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [configs, setConfigs] = useState(() => {
    const c = defaultConfigs();
    c.minute = { mode: 'list', step: 5, values: '0', from: '', to: '' };
    c.hour = { mode: 'list', step: 5, values: '9', from: '', to: '' };
    c.dow = { mode: 'range', step: 1, values: '', from: '1', to: '5' };
    return c;
  });
  const [command, setCommand] = useState('');
  const [copied, setCopied] = useState('');

  const parsed = useMemo(() => parseCron(expr), [expr]);
  const described = useMemo(() => describeCron(expr, lang), [expr, lang]);
  const runs = useMemo(() => {
    if (parsed.error) return { runs: [], error: parsed.error };
    return nextRuns(expr, new Date(), 5);
  }, [expr, parsed.error]);

  const applyExpr = (next) => {
    setExpr(next);
    const tokens = next.trim().split(/\s+/);
    if (tokens.length === 5) {
      const c = {};
      FIELD_DEFS.forEach((f, i) => {
        c[f.key] = fieldToConfig(tokens[i]);
      });
      setConfigs(c);
    }
  };

  const updateField = (key, patch) => {
    const next = { ...configs, [key]: { ...configs[key], ...patch } };
    setConfigs(next);
    setExpr(exprFromConfigs(next));
  };

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(id);
    setTimeout(() => setCopied(''), 1500);
  };

  const crontabLine = command.trim() ? expr + ' ' + command.trim() : expr;
  const fieldNames = lang === 'es' ? FIELD_NAMES_ES : FIELD_NAMES_EN;

  return (
    <div>
      <div className="card">
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{L.exprLabel}</label>
        <input
          value={expr}
          onChange={(e) => applyExpr(e.target.value)}
          spellCheck={false}
          style={{ width: '100%', padding: '10px 12px', fontSize: '1.15rem', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: 8 }}
        />
        {parsed.error && <p style={{ color: '#b91c1c', marginTop: 8 }}>{L.invalid}{parsed.error}</p>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" onClick={() => copyText(expr, 'expr')} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', cursor: 'pointer' }}>
            {copied === 'expr' ? L.copied : L.copy + ' expression'}
          </button>
        </div>
        <p style={{ marginTop: 14, fontWeight: 600 }}>{L.presetsTitle}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => applyExpr(p.expr)}
              style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #cbd5e1', background: expr === p.expr ? '#ecfdf5' : '#fff', cursor: 'pointer' }}
            >
              {p.label} <span style={{ fontFamily: 'monospace', color: '#475569' }}>{p.expr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>{L.builderTitle}</h2>
        {FIELD_DEFS.map((f, i) => {
          const cfg = configs[f.key];
          return (
            <div key={f.key} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ minWidth: 110, fontWeight: 600 }}>{fieldNames[i]}</span>
              <select value={cfg.mode} onChange={(e) => updateField(f.key, { mode: e.target.value })} style={{ padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <option value="every">{L.modeEvery} ({f.min}-{f.max === 7 ? '6' : f.max})</option>
                <option value="step">{L.modeStep}</option>
                <option value="list">{L.modeList}</option>
                <option value="range">{L.modeRange}</option>
              </select>
              {cfg.mode === 'step' && (
                <label>{L.stepLabel} <input type="number" min={1} max={f.max} value={cfg.step} onChange={(e) => updateField(f.key, { step: parseInt(e.target.value, 10) || 1 })} style={{ width: 70, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} /></label>
              )}
              {cfg.mode === 'list' && (
                <input value={cfg.values} placeholder={L.valuesPlaceholder} onChange={(e) => updateField(f.key, { values: e.target.value })} spellCheck={false} style={{ padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', fontFamily: 'monospace', minWidth: 160 }} />
              )}
              {cfg.mode === 'range' && (
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <label>{L.fromLabel} <input type="number" min={f.min} max={f.max} value={cfg.from} onChange={(e) => updateField(f.key, { from: e.target.value })} style={{ width: 70, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} /></label>
                  <label>{L.toLabel} <input type="number" min={f.min} max={f.max} value={cfg.to} onChange={(e) => updateField(f.key, { to: e.target.value })} style={{ width: 70, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} /></label>
                  <label>{L.stepLabel} <input type="number" min={1} value={cfg.step} onChange={(e) => updateField(f.key, { step: parseInt(e.target.value, 10) || 1 })} style={{ width: 60, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }} /></label>
                </span>
              )}
              <code style={{ color: '#0f766e' }}>{buildField(f.key, cfg)}</code>
            </div>
          );
        })}
      </div>

      {!parsed.error && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>{L.descTitle}</h2>
          <p style={{ fontSize: '1.1rem' }}>{described.text}</p>
          <h3>{L.runsTitle}</h3>
          {runs.runs.length === 0 && <p style={{ color: '#b91c1c' }}>{L.noRuns}</p>}
          {runs.runs.length > 0 && runs.runs.length < 5 && <p style={{ color: '#92400e' }}>{L.fewRuns}</p>}
          <ul>
            {runs.runs.map((d) => (
              <li key={d.getTime()} style={{ fontFamily: 'monospace' }}>{d.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
            ))}
          </ul>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>{L.runsNote}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>{L.crontabTitle}</h2>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{L.commandLabel}</label>
        <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder={L.commandPlaceholder} spellCheck={false} style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: 8 }} />
        <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 14, borderRadius: 8, overflowX: 'auto', marginTop: 12 }}>{crontabLine}</pre>
        <button type="button" onClick={() => copyText(crontabLine, 'cron')} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', cursor: 'pointer' }}>
          {copied === 'cron' ? L.copied : L.copy}
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>{L.fieldRefTitle}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: 8 }}>{L.fieldCol}</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: 8 }}>{L.rangeCol}</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: 8 }}>{L.namesCol}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: 8 }}>{fieldNames[0]}</td><td style={{ padding: 8 }}>0-59</td><td style={{ padding: 8 }}>-</td></tr>
            <tr><td style={{ padding: 8 }}>{fieldNames[1]}</td><td style={{ padding: 8 }}>0-23</td><td style={{ padding: 8 }}>-</td></tr>
            <tr><td style={{ padding: 8 }}>{fieldNames[2]}</td><td style={{ padding: 8 }}>1-31</td><td style={{ padding: 8 }}>-</td></tr>
            <tr><td style={{ padding: 8 }}>{fieldNames[3]}</td><td style={{ padding: 8 }}>1-12</td><td style={{ padding: 8 }}>jan-dec</td></tr>
            <tr><td style={{ padding: 8 }}>{fieldNames[4]}</td><td style={{ padding: 8 }}>0-6 (7 = Sunday)</td><td style={{ padding: 8 }}>sun-sat</td></tr>
          </tbody>
        </table>
        <p style={{ color: '#475569' }}>
          <strong>{L.symbolsTitle}:</strong> * = every value &nbsp;|&nbsp; */n = every nth value &nbsp;|&nbsp; a-b = range &nbsp;|&nbsp; a,b = list &nbsp;|&nbsp; a-b/n = step inside a range.
          {lang === 'es' ? ' Cuando el dia del mes y el dia de la semana estan restringidos a la vez, el trabajo corre si coincide cualquiera de los dos.' : ' When day-of-month and day-of-week are both restricted, the job runs if either one matches.'}
        </p>
      </div>

      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{L.privacy}</p>
      <p>
        {L.seeAlso}: {L.siblings.map((s, i) => (
          <span key={s.href}>{i > 0 && ' | '}<Link href={s.href}>{s.label}</Link></span>
        ))}
      </p>
    </div>
  );
}
