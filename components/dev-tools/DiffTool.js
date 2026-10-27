'use client';
/* Text Diff Checker: paste an original and a revised text, see every
   added and removed line highlighted, with the exact changed words
   marked inside changed line pairs. Line diff via LCS, word diff via
   token LCS. Everything runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { diffLines, summarizeDiff, wordDiff, toUnifiedText } from '@/lib/diff-utils';

const STR = {
  en: {
    originalLabel: 'Original text',
    originalPlaceholder: 'Paste the original version here...',
    revisedLabel: 'Revised text',
    revisedPlaceholder: 'Paste the revised version here...',
    ignoreWhitespace: 'Ignore whitespace differences',
    ignoreCase: 'Ignore case differences',
    onlyChanges: 'Only show changes',
    compare: 'Compare texts',
    swap: 'Swap sides',
    clear: 'Clear both',
    example: 'Try an example',
    copyDiff: 'Copy diff',
    copied: 'Copied!',
    downloadPatch: 'Download .patch',
    empty: 'Your comparison will appear here. Paste both texts and press Compare.',
    identical: 'No differences: the two texts are identical.',
    added: 'lines added',
    removed: 'lines removed',
    unchanged: 'lines unchanged',
    statsTitle: 'Summary',
    removedLabel: 'Removed',
    addedLabel: 'Added',
    unchangedLabel: 'Unchanged',
    seeAlso: 'More developer tools',
    privacy: 'Privacy: comparison runs locally in your browser. Nothing you paste is uploaded or logged.',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder' },
      { href: '/tools/url-encoder-decoder', label: 'URL Encoder' },
    ],
  },
  es: {
    originalLabel: 'Texto original',
    originalPlaceholder: 'Pega la versión original aquí...',
    revisedLabel: 'Texto revisado',
    revisedPlaceholder: 'Pega la versión revisada aquí...',
    ignoreWhitespace: 'Ignorar diferencias de espacios',
    ignoreCase: 'Ignorar diferencias de mayúsculas',
    onlyChanges: 'Mostrar solo los cambios',
    compare: 'Comparar textos',
    swap: 'Intercambiar lados',
    clear: 'Limpiar ambos',
    example: 'Probar un ejemplo',
    copyDiff: 'Copiar diff',
    copied: '¡Copiado!',
    downloadPatch: 'Descargar .patch',
    empty: 'Tu comparación aparecerá aquí. Pega ambos textos y pulsa Comparar.',
    identical: 'Sin diferencias: los dos textos son idénticos.',
    added: 'líneas añadidas',
    removed: 'líneas eliminadas',
    unchanged: 'líneas sin cambios',
    statsTitle: 'Resumen',
    removedLabel: 'Eliminado',
    addedLabel: 'Añadido',
    unchangedLabel: 'Sin cambios',
    seeAlso: 'Más herramientas para desarrolladores',
    privacy: 'Privacidad: la comparación corre localmente en tu navegador. Nada de lo que pegas se sube ni se registra.',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/codificador-decodificador-url', label: 'Codificador de URL' },
    ],
  },
};

const EXAMPLE_A = 'The club meets on Friday at 5 pm.\nBring your notebook and a pen.\nDues are $10 per term.\nThe trip is on March 3.';
const EXAMPLE_B = 'The club meets on Friday at 6 pm.\nBring your notebook and a pen.\nSign-up closes on March 1.\nDues are $10 per term.\nThe trip is on March 3.';

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
const areaStyle = {
  width: '100%',
  minHeight: 150,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};

/* Render one diff line, with word-level highlights when it is half of a
   changed pair (a removal immediately followed by an addition). */
function DiffLine({ op, pairLine, ignoreCase }) {
  if (op.type === 'same') {
    return (
      <div style={{ display: 'flex', gap: 8, padding: '3px 8px', background: '#f8fafc' }}>
        <span style={{ width: 20, textAlign: 'center', color: '#94a3b8' }}>&nbsp;</span>
        <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{op.aLine}</code>
      </div>
    );
  }
  if (op.type === 'remove') {
    let segs = null;
    if (pairLine != null) segs = wordDiff(op.aLine, pairLine, { ignoreCase }).oldSegs;
    return (
      <div style={{ display: 'flex', gap: 8, padding: '3px 8px', background: '#fef2f2' }}>
        <span style={{ width: 20, textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>-</span>
        <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {segs ? segs.map((s, i) => (
            <span key={i} style={s.changed ? { background: '#fecaca', fontWeight: 700 } : undefined}>{s.text}</span>
          )) : op.aLine}
        </code>
      </div>
    );
  }
  let segs = null;
  if (pairLine != null) segs = wordDiff(pairLine, op.bLine, { ignoreCase }).newSegs;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 8px', background: '#f0fdf4' }}>
      <span style={{ width: 20, textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>+</span>
      <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {segs ? segs.map((s, i) => (
          <span key={i} style={s.changed ? { background: '#bbf7d0', fontWeight: 700 } : undefined}>{s.text}</span>
        )) : op.bLine}
      </code>
    </div>
  );
}

export default function DiffTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const prefix = lang === 'es' ? '/es' : '';
  const [original, setOriginal] = useState('');
  const [revised, setRevised] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [compared, setCompared] = useState(false);
  const [copied, setCopied] = useState(false);

  const ops = useMemo(() => {
    if (!compared) return null;
    return diffLines(original, revised, { ignoreWhitespace, ignoreCase });
  }, [compared, original, revised, ignoreWhitespace, ignoreCase]);
  const summary = ops ? summarizeDiff(ops) : null;
  const unified = ops ? toUnifiedText(ops) : '';

  const run = () => setCompared(true);
  const swap = () => { setOriginal(revised); setRevised(original); setCompared(false); };
  const clear = () => { setOriginal(''); setRevised(''); setCompared(false); };
  const example = () => { setOriginal(EXAMPLE_A); setRevised(EXAMPLE_B); setCompared(true); };
  const copy = async () => {
    if (!unified) return;
    try {
      await navigator.clipboard.writeText(unified);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  const download = () => {
    if (!unified) return;
    const blob = new Blob([unified], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff.patch';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* For each op, find its changed-pair partner line (if any). */
  const pairFor = (idx) => {
    if (!ops) return null;
    const op = ops[idx];
    if (op.type === 'remove' && ops[idx + 1] && ops[idx + 1].type === 'add') return ops[idx + 1].bLine;
    if (op.type === 'add' && ops[idx - 1] && ops[idx - 1].type === 'remove') return ops[idx - 1].aLine;
    return null;
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.originalLabel}</label>
          <textarea
            value={original}
            onChange={(e) => { setOriginal(e.target.value); setCompared(false); }}
            placeholder={t.originalPlaceholder}
            style={{ ...areaStyle, marginTop: 6 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.revisedLabel}</label>
          <textarea
            value={revised}
            onChange={(e) => { setRevised(e.target.value); setCompared(false); }}
            placeholder={t.revisedPlaceholder}
            style={{ ...areaStyle, marginTop: 6 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.ignoreWhitespace}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.ignoreCase}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyChanges} onChange={(e) => setOnlyChanges(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.onlyChanges}
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <button type="button" onClick={run} style={primaryBtnStyle}>{t.compare}</button>
        <button type="button" onClick={swap} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={clear} style={btnStyle}>{t.clear}</button>
        <button type="button" onClick={example} style={btnStyle}>{t.example}</button>
        {ops && (
          <>
            <button type="button" onClick={copy} style={btnStyle}>{copied ? t.copied : t.copyDiff}</button>
            <button type="button" onClick={download} style={btnStyle}>{t.downloadPatch}</button>
          </>
        )}
      </div>

      {!ops && <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: 16 }}>{t.empty}</p>}

      {ops && summary && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {t.statsTitle}: <span style={{ color: '#16a34a' }}>{summary.added} {t.added}</span>
            {' · '}<span style={{ color: '#dc2626' }}>{summary.removed} {t.removed}</span>
            {' · '}<span style={{ color: '#475569' }}>{summary.unchanged} {t.unchanged}</span>
          </p>
          {summary.added === 0 && summary.removed === 0 ? (
            <p style={{ fontSize: '0.95rem', color: '#166534' }}>{t.identical}</p>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', fontSize: '0.95rem' }}>
              {ops.map((op, idx) => {
                if (onlyChanges && op.type === 'same') return null;
                return <DiffLine key={idx} op={op} pairLine={pairFor(idx)} ignoreCase={ignoreCase} />;
              })}
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 16 }}>{t.privacy}</p>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 20 }}>{t.seeAlso}</p>
      <ul style={{ marginTop: 4 }}>
        {t.siblings.map((s) => (
          <li key={s.href}><Link href={prefix + s.href}>{s.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
