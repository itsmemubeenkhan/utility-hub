'use client';
/* JSON Formatter and Validator: paste JSON, format / minify / validate with
   error location, collapsible tree view, JSON to CSV, copy and download.
   Everything runs locally in the browser. */
import { useMemo, useState } from 'react';
import Link from 'next/link';

const STR = {
  en: {
    placeholder: 'Paste your JSON here...',
    format: 'Format',
    minify: 'Minify',
    validate: 'Validate',
    toCsv: 'JSON to CSV',
    tree: 'Tree',
    text: 'Text',
    sample: 'Load sample',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download .json',
    valid: 'Valid JSON',
    invalid: 'Invalid JSON',
    stats: 'Stats',
    depth: 'Depth',
    keys: 'Total keys',
    values: 'Values',
    size: 'Size',
    csvHint: 'CSV conversion works on arrays of flat objects.',
    csvNoData: 'No tabular data found. JSON to CSV works on an array of objects with consistent keys.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
      { href: '/tools/password-generator', label: 'Password Generator' },
    ],
    privacy:
      'Privacy: your JSON is parsed locally in your browser. Nothing is uploaded, sent to a server, or stored anywhere.',
    emptyHint: 'Nothing to format yet. Paste JSON above and press Format, or load the sample.',
  },
  es: {
    placeholder: 'Pega tu JSON aquí...',
    format: 'Formatear',
    minify: 'Minificar',
    validate: 'Validar',
    toCsv: 'JSON a CSV',
    tree: 'Árbol',
    text: 'Texto',
    sample: 'Cargar ejemplo',
    clear: 'Limpiar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    download: 'Descargar .json',
    valid: 'JSON válido',
    invalid: 'JSON inválido',
    stats: 'Estadísticas',
    depth: 'Profundidad',
    keys: 'Claves totales',
    values: 'Valores',
    size: 'Tamaño',
    csvHint: 'La conversión a CSV funciona con arreglos de objetos planos.',
    csvNoData: 'No se encontraron datos tabulares. JSON a CSV funciona con un arreglo de objetos con claves consistentes.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
      { href: '/es/tools/generador-de-contrasenas-aleatorias', label: 'Generador de contraseñas' },
    ],
    privacy:
      'Privacidad: tu JSON se procesa localmente en tu navegador. Nada se sube, se envía a un servidor ni se almacena.',
    emptyHint: 'Nada que formatear todavía. Pega JSON arriba y presiona Formatear, o carga el ejemplo.',
  },
};

const SAMPLE = JSON.stringify(
  {
    app: 'UtilityHub',
    version: 3,
    live: true,
    tags: ['tools', 'seo', 'free'],
    config: { theme: 'light', limits: { daily: 100, burst: 10 } },
    users: [
      { id: 1, name: 'Ana', plan: 'free' },
      { id: 2, name: 'Luis', plan: 'pro' },
    ],
  },
  null,
  2
);

function errorPosition(e) {
  const m = /at position (\d+)/.exec(String(e && e.message));
  return m ? Number(m[1]) : -1;
}

function lineCol(text, pos) {
  if (pos < 0) return null;
  const upTo = text.slice(0, pos);
  const line = upTo.split('\n').length;
  const col = pos - upTo.lastIndexOf('\n');
  return { line, col };
}

function analyze(value, depth = 1) {
  let maxDepth = depth;
  let keys = 0;
  let values = 0;
  if (Array.isArray(value)) {
    values += value.length;
    for (const v of value) {
      const r = analyze(v, depth + 1);
      maxDepth = Math.max(maxDepth, r.maxDepth);
      keys += r.keys;
      values += r.values;
    }
  } else if (value && typeof value === 'object') {
    const ks = Object.keys(value);
    keys += ks.length;
    for (const k of ks) {
      const r = analyze(value[k], depth + 1);
      maxDepth = Math.max(maxDepth, r.maxDepth);
      keys += r.keys;
      values += r.values;
    }
  } else {
    values += 1;
  }
  return { maxDepth, keys, values };
}

function toCsv(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows = value.filter((r) => r && typeof r === 'object' && !Array.isArray(r));
  if (rows.length === 0) return null;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return '"' + JSON.stringify(v).replace(/"/g, '""') + '"';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

function JsonNode({ data, name, depth = 0, initialDepth = 2 }) {
  const [open, setOpen] = useState(depth < initialDepth);
  const isObj = data && typeof data === 'object';
  if (!isObj) {
    const val = typeof data === 'string' ? '"' + data + '"' : String(data);
    const color = data === null ? '#9ca3af' : typeof data === 'string' ? '#15803d' : typeof data === 'boolean' ? '#7c3aed' : '#b45309';
    return (
      <span>
        {name !== undefined && <span style={{ color: '#1d4ed8' }}>"{name}": </span>}
        <span style={{ color }}>{val}</span>
      </span>
    );
  }
  const entries = Array.isArray(data) ? data.map((v, i) => [i, v]) : Object.entries(data);
  const label = Array.isArray(data) ? 'Array(' + data.length + ')' : 'Object{' + entries.length + '}';
  if (!open) {
    return (
      <span>
        {name !== undefined && <span style={{ color: '#1d4ed8' }}>"{name}": </span>}
        <button type="button" onClick={() => setOpen(true)} style={toggleStyle} title="Expand">
          ▶ {label}
        </button>
      </span>
    );
  }
  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
      <span>
        {name !== undefined && <span style={{ color: '#1d4ed8' }}>"{name}": </span>}
        <button type="button" onClick={() => setOpen(false)} style={toggleStyle} title="Collapse">
          ▼ {label}
        </button>
      </span>
      {entries.map(([k, v]) => (
        <div key={String(k)}>
          <JsonNode data={v} name={Array.isArray(data) ? undefined : k} depth={depth + 1} initialDepth={initialDepth} />
        </div>
      ))}
    </div>
  );
}

const toggleStyle = {
  background: 'none',
  border: 'none',
  color: '#6b7280',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  padding: 0,
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

export default function JsonFormatterTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('format'); // format | minify | tree | csv
  const [status, setStatus] = useState(null); // { ok, message, line, col }
  const [view, setView] = useState('text'); // text | tree
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!output) return { value: undefined };
    try {
      return { value: JSON.parse(output) };
    } catch {
      return { value: undefined };
    }
  }, [output]);

  const run = (action) => {
    setCopied(false);
    if (!input.trim()) {
      setOutput('');
      setStatus(null);
      return;
    }
    try {
      const value = JSON.parse(input);
      if (action === 'validate') {
        setOutput('');
        setStatus({ ok: true, message: t.valid });
        return;
      }
      if (action === 'csv') {
        const csv = toCsv(value);
        if (csv === null) {
          setOutput('');
          setStatus({ ok: false, message: t.csvNoData });
          return;
        }
        setOutput(csv);
        setMode('csv');
        setStatus({ ok: true, message: t.valid });
        return;
      }
      setOutput(action === 'minify' ? JSON.stringify(value) : JSON.stringify(value, null, 2));
      setMode(action === 'minify' ? 'minify' : 'format');
      setStatus({ ok: true, message: t.valid });
    } catch (e) {
      const pos = errorPosition(e);
      const lc = lineCol(input, pos);
      setOutput('');
      setStatus({
        ok: false,
        message:
          t.invalid +
          (lc ? ' (line ' + lc.line + ', col ' + lc.col + ')' : '') +
          ': ' +
          String(e.message).slice(0, 160),
      });
    }
  };

  const stats = useMemo(() => {
    if (!status || !status.ok || mode === 'csv' || mode === 'validate') return null;
    const value = parsed.value;
    if (value === undefined) return null;
    const a = analyze(value);
    return { depth: a.maxDepth, keys: a.keys, values: a.values, size: new Blob([output]).size };
  }, [status, mode, parsed, output]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'csv' ? 'data.csv' : 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1024 * 1024 ? (n / 1024).toFixed(1) + ' KB' : (n / 1024 / 1024).toFixed(1) + ' MB');

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.placeholder}
        rows={9}
        spellCheck={false}
        style={{
          width: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.85rem',
          padding: 12,
          borderRadius: 10,
          border: '1px solid #d1d5db',
          resize: 'vertical',
          background: '#f9fafb',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0' }}>
        <button type="button" style={primaryBtnStyle} onClick={() => run('format')}>{t.format}</button>
        <button type="button" style={btnStyle} onClick={() => run('minify')}>{t.minify}</button>
        <button type="button" style={btnStyle} onClick={() => run('validate')}>{t.validate}</button>
        <button type="button" style={btnStyle} onClick={() => run('csv')}>{t.toCsv}</button>
        <button type="button" style={btnStyle} onClick={() => { setInput(SAMPLE); setStatus(null); }}>{t.sample}</button>
        <button type="button" style={btnStyle} onClick={() => { setInput(''); setOutput(''); setStatus(null); }}>{t.clear}</button>
      </div>

      {status && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 12,
            fontSize: '0.9rem',
            background: status.ok ? '#ecfdf5' : '#fef2f2',
            border: '1px solid ' + (status.ok ? '#a7f3d0' : '#fecaca'),
            color: status.ok ? '#065f46' : '#991b1b',
            wordBreak: 'break-word',
          }}
        >
          {status.ok ? '✓ ' : '✕ '}{status.message}
        </div>
      )}

      {stats && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, fontSize: '0.82rem' }}>
          {[
            [t.depth, stats.depth],
            [t.keys, stats.keys],
            [t.values, stats.values],
            [t.size, fmtBytes(stats.size)],
          ].map(([label, value]) => (
            <span key={label} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 999, padding: '4px 12px' }}>
              <strong>{label}:</strong> {value}
            </span>
          ))}
        </div>
      )}

      {output && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            {(mode === 'format' || mode === 'minify') && (
              <div style={{ display: 'flex', gap: 4, fontSize: '0.85rem' }}>
                <button type="button" onClick={() => setView('text')} style={{ ...btnStyle, padding: '6px 12px', background: view === 'text' ? '#dbeafe' : '#fff' }}>{t.text}</button>
                <button type="button" onClick={() => setView('tree')} style={{ ...btnStyle, padding: '6px 12px', background: view === 'tree' ? '#dbeafe' : '#fff' }}>{t.tree}</button>
              </div>
            )}
            <button type="button" onClick={copy} style={{ ...btnStyle, padding: '6px 12px' }}>{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={download} style={{ ...btnStyle, padding: '6px 12px' }}>{t.download}</button>
          </div>
          {view === 'tree' && parsed.value !== undefined && mode !== 'csv' ? (
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, maxHeight: 480, overflow: 'auto' }}>
              <JsonNode data={parsed.value} initialDepth={2} />
            </div>
          ) : (
            <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, maxHeight: 480, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {output}
            </pre>
          )}
        </div>
      )}

      {!output && !status && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t.emptyHint}</p>}
      {mode === 'csv' && output && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 8 }}>{t.csvHint}</p>}

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>🔒 {t.privacy}</p>

      <div style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.seeAlso}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {t.siblings.map((s) => (
            <Link key={s.href} href={s.href} style={{ ...btnStyle, textDecoration: 'none', color: '#1d4ed8' }}>{s.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
