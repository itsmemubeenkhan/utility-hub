'use client';
/* Remove Duplicate Lines: paste a list, one item per line, and get the clean
   list live. Four modes: keep the first copy, keep the last copy, keep only
   lines that appear once, or keep only the repeated lines. Options cover
   ignore case, trim, normalize spaces, drop empty lines and A to Z or Z to A
   sorting. A removed-lines audit shows every dropped line with its count,
   and the result can be copied or downloaded as .txt. 100% in your browser,
   nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { dedupeLines, SAMPLE_LINES } from '@/lib/dedupe-utils';

const STR = {
  en: {
    optionsTitle: 'Deduplication options',
    modeLabel: 'Mode',
    keepFirst: 'Keep first occurrence',
    keepLast: 'Keep last occurrence',
    onlyUnique: 'Only lines that appear once',
    onlyDuplicates: 'Only repeated lines',
    optionsLabel: 'Cleanup options',
    ignoreCase: 'Ignore case',
    trimLines: 'Trim spaces',
    normalizeSpaces: 'Normalize spaces',
    removeEmpty: 'Remove empty lines',
    sortLabel: 'Sort order',
    sortPreserve: 'Keep order',
    sortAsc: 'A to Z',
    sortDesc: 'Z to A',
    inputLabel: 'Input list',
    inputPlaceholder: 'Paste your list here, one item per line...',
    outputLabel: 'Clean list',
    sample: 'Sample list',
    upload: 'Upload .txt / .csv',
    swap: 'Swap',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    empty: 'Your clean list will appear here.',
    totalLines: 'total lines',
    uniqueLines: 'unique lines',
    removedLines: 'duplicates removed',
    removedTitle: 'Removed lines',
    removedLine: 'Line',
    removedCount: 'Copies removed',
    emptyLineLabel: '(empty line)',
    howTitle: 'What counts as a duplicate?',
    howNote: 'Two lines count as the same line when their comparison keys match. Ignore case lowercases both lines before comparing, so Apple and APPLE are one line. Trim removes leading and trailing spaces, and Normalize spaces also collapses every run of spaces or tabs inside a line to a single space, so "New  York" and "New York" match. The kept line always keeps its original casing: only the comparison is lowercased, never your text.',
    privacy: 'Privacy: deduplication runs locally in your browser. Nothing you paste is uploaded, stored or seen by anyone else.',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/text-diff-checker', label: 'Text Diff Checker' },
      { href: '/tools/case-converter', label: 'Case Converter' },
      { href: '/tools/word-counter', label: 'Word Counter' },
      { href: '/tools/character-counter', label: 'Character Counter' },
    ],
  },
  es: {
    optionsTitle: 'Opciones de deduplicación',
    modeLabel: 'Modo',
    keepFirst: 'Conservar la primera aparición',
    keepLast: 'Conservar la última aparición',
    onlyUnique: 'Solo líneas que aparecen una vez',
    onlyDuplicates: 'Solo líneas repetidas',
    optionsLabel: 'Opciones de limpieza',
    ignoreCase: 'Ignorar mayúsculas',
    trimLines: 'Recortar espacios',
    normalizeSpaces: 'Normalizar espacios',
    removeEmpty: 'Eliminar líneas vacías',
    sortLabel: 'Orden',
    sortPreserve: 'Mantener orden',
    sortAsc: 'A a Z',
    sortDesc: 'Z a A',
    inputLabel: 'Lista de entrada',
    inputPlaceholder: 'Pega tu lista aquí, un elemento por línea...',
    outputLabel: 'Lista limpia',
    sample: 'Lista de ejemplo',
    upload: 'Subir .txt / .csv',
    swap: 'Intercambiar',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    empty: 'Tu lista limpia aparecerá aquí.',
    totalLines: 'líneas en total',
    uniqueLines: 'líneas únicas',
    removedLines: 'duplicados eliminados',
    removedTitle: 'Líneas eliminadas',
    removedLine: 'Línea',
    removedCount: 'Copias eliminadas',
    emptyLineLabel: '(línea vacía)',
    howTitle: '¿Qué cuenta como duplicado?',
    howNote: 'Dos líneas cuentan como la misma línea cuando sus claves de comparación coinciden. Ignorar mayúsculas pasa ambas líneas a minúsculas antes de comparar, así Apple y APPLE son una línea. Recortar quita los espacios al inicio y al final, y Normalizar espacios también colapsa cada serie de espacios o tabulaciones dentro de una línea a un solo espacio, así "New  York" y "New York" coinciden. La línea conservada siempre mantiene su capitalización original: solo la comparación pasa a minúsculas, nunca tu texto.',
    privacy: 'Privacidad: la deduplicación corre localmente en tu navegador. Nada de lo que pegas se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/comparador-de-textos', label: 'Comparador de Textos' },
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de Mayúsculas' },
      { href: '/es/tools/contador-de-palabras', label: 'Contador de Palabras' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de Caracteres' },
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
const labelStyle = { fontSize: '0.95rem', fontWeight: 600 };
const areaStyle = {
  width: '100%',
  minHeight: 180,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const preStyle = {
  ...areaStyle,
  minHeight: 120,
  marginTop: 6,
  background: '#0f172a',
  color: '#e2e8f0',
  whiteSpace: 'pre-wrap',
  overflowX: 'auto',
  wordBreak: 'break-all',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 };
const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #d1d5db', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', verticalAlign: 'top' };

export default function DedupeTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('unique');
  const [keep, setKeep] = useState('first');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [normalizeSpaces, setNormalizeSpaces] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [sort, setSort] = useState('preserve');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input) return { lines: [], removed: [], stats: { total: 0, unique: 0, removed: 0 } };
    return dedupeLines(input, { mode, keep, ignoreCase, trimLines, normalizeSpaces, removeEmpty, sort });
  }, [input, mode, keep, ignoreCase, trimLines, normalizeSpaces, removeEmpty, sort]);

  const output = result.lines.join('\n');

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
    const blob = new Blob([output + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deduplicated-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pickMode = (m, k) => {
    setMode(m);
    if (k) setKeep(k);
  };

  const isActiveMode = (m, k) => mode === m && (m !== 'unique' || keep === k);

  const swap = () => {
    if (!output) return;
    setInput(output);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.optionsTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t.modeLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => pickMode('unique', 'first')} style={isActiveMode('unique', 'first') ? primaryBtnStyle : btnStyle}>{t.keepFirst}</button>
            <button type="button" onClick={() => pickMode('unique', 'last')} style={isActiveMode('unique', 'last') ? primaryBtnStyle : btnStyle}>{t.keepLast}</button>
            <button type="button" onClick={() => pickMode('onlyUnique')} style={isActiveMode('onlyUnique') ? primaryBtnStyle : btnStyle}>{t.onlyUnique}</button>
            <button type="button" onClick={() => pickMode('onlyDuplicates')} style={isActiveMode('onlyDuplicates') ? primaryBtnStyle : btnStyle}>{t.onlyDuplicates}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.optionsLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setIgnoreCase(!ignoreCase)} style={ignoreCase ? primaryBtnStyle : btnStyle}>{t.ignoreCase}</button>
            <button type="button" onClick={() => setTrimLines(!trimLines)} style={trimLines ? primaryBtnStyle : btnStyle}>{t.trimLines}</button>
            <button type="button" onClick={() => setNormalizeSpaces(!normalizeSpaces)} style={normalizeSpaces ? primaryBtnStyle : btnStyle}>{t.normalizeSpaces}</button>
            <button type="button" onClick={() => setRemoveEmpty(!removeEmpty)} style={removeEmpty ? primaryBtnStyle : btnStyle}>{t.removeEmpty}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.sortLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setSort('preserve')} style={sort === 'preserve' ? primaryBtnStyle : btnStyle}>{t.sortPreserve}</button>
            <button type="button" onClick={() => setSort('asc')} style={sort === 'asc' ? primaryBtnStyle : btnStyle}>{t.sortAsc}</button>
            <button type="button" onClick={() => setSort('desc')} style={sort === 'desc' ? primaryBtnStyle : btnStyle}>{t.sortDesc}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_LINES)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={swap} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setInput(String(r.result || '')); r.readAsText(f); e.target.value = ''; }} style={{ display: 'none' }} />
      </div>

      <label htmlFor="dedupe-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="dedupe-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>{t.outputLabel}</label>
        {output ? (
          <pre style={preStyle}>{output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {input && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {result.stats.total} {t.totalLines} · {result.stats.unique} {t.uniqueLines} · {result.stats.removed} {t.removedLines}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      {result.removed.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 4px' }}>{t.removedTitle}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t.removedLine}</th>
                  <th style={thStyle}>{t.removedCount}</th>
                </tr>
              </thead>
              <tbody>
                {result.removed.map((row, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{row.line === '' ? t.emptyLineLabel : row.line}</td>
                    <td style={tdStyle}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.15rem', margin: '24px 0 8px' }}>{t.howTitle}</h2>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.howNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>🔒 {t.privacy}</p>

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
