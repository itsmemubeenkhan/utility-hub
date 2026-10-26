'use client';
/* URL Encoder & Decoder: encodeURIComponent vs encodeURI scopes, %20 vs +
   space handling, double-encoding detection, URL parts breakdown, and a
   query-string parser/builder. Everything runs in the browser. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  encodeComponent, encodeWhole, decodeComponent, decodeWhole,
  isDoubleEncoded, parseQuery, buildQuery, splitUrl,
} from '@/lib/url-utils';

const STR = {
  en: {
    modeEncode: 'Encode',
    modeDecode: 'Decode',
    scopeComponent: 'One value (encodeURIComponent)',
    scopeWhole: 'Whole URL (encodeURI)',
    spacePlus: 'Space as + (form style)',
    plusAsSpace: 'Treat + as space when decoding',
    inputLabel: 'Input',
    inputPlaceholderEncode: 'Paste a URL or text to encode...',
    inputPlaceholderDecode: 'Paste an encoded URL or text to decode...',
    outputLabel: 'Output',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download .txt',
    clear: 'Clear',
    swap: 'Swap',
    error: 'Could not decode that. Check for a bare % not followed by two hex digits, or text that was never encoded.',
    empty: 'Your result will appear here.',
    doubleNote: 'This looks double-encoded: decoding once still leaves % sequences behind. Decode again to resolve it, then fix the step that encoded it twice.',
    statsIn: 'Input',
    statsOut: 'Output',
    chars: 'characters',
    partsTitle: 'URL parts (from your input)',
    paramsTitle: 'Query parameters (from your input)',
    noParams: 'No query parameters in this input.',
    builderTitle: 'Build a query string',
    addRow: 'Add row',
    generate: 'Generate query string',
    builtLabel: 'Built query string',
    keyPlaceholder: 'name',
    valuePlaceholder: 'value',
    seeAlso: 'More developer tools',
    privacy: 'Privacy: encoding runs locally in your browser. Nothing you paste is uploaded or logged.',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
    ],
  },
  es: {
    modeEncode: 'Codificar',
    modeDecode: 'Decodificar',
    scopeComponent: 'Un valor (encodeURIComponent)',
    scopeWhole: 'URL completa (encodeURI)',
    spacePlus: 'Espacio como + (estilo de formulario)',
    plusAsSpace: 'Tratar + como espacio al decodificar',
    inputLabel: 'Entrada',
    inputPlaceholderEncode: 'Pega una URL o texto para codificar...',
    inputPlaceholderDecode: 'Pega una URL o texto codificado para decodificar...',
    outputLabel: 'Salida',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    clear: 'Limpiar',
    swap: 'Intercambiar',
    error: 'No se pudo decodificar. Revisa un % sin dos dígitos hexadecimales después, o texto que nunca fue codificado.',
    empty: 'Tu resultado aparecerá aquí.',
    doubleNote: 'Esto parece doblemente codificado: al decodificar una vez aún quedan secuencias %. Decodifica de nuevo para resolverlo y corrige el paso que lo codificó dos veces.',
    statsIn: 'Entrada',
    statsOut: 'Salida',
    chars: 'caracteres',
    partsTitle: 'Partes de la URL (de tu entrada)',
    paramsTitle: 'Parámetros de consulta (de tu entrada)',
    noParams: 'Sin parámetros de consulta en esta entrada.',
    builderTitle: 'Construir una cadena de consulta',
    addRow: 'Añadir fila',
    generate: 'Generar cadena de consulta',
    builtLabel: 'Cadena de consulta construida',
    keyPlaceholder: 'nombre',
    valuePlaceholder: 'valor',
    seeAlso: 'Más herramientas para desarrolladores',
    privacy: 'Privacidad: la codificación corre localmente en tu navegador. Nada de lo que pegas se sube ni se registra.',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
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
const areaStyle = {
  width: '100%',
  minHeight: 130,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};

export default function UrlTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('encode');
  const [scope, setScope] = useState('component');
  const [spacePlus, setSpacePlus] = useState(false);
  const [plusAsSpace, setPlusAsSpace] = useState(false);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [rows, setRows] = useState([{ key: 'q', value: 'hello world' }, { key: 'lang', value: 'en' }]);
  const [built, setBuilt] = useState('');

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      if (mode === 'encode') {
        const fn = scope === 'component' ? encodeComponent : encodeWhole;
        return { output: fn(input, { spacePlus }), error: '' };
      }
      const fn = scope === 'component' ? decodeComponent : decodeWhole;
      return { output: fn(input, { plusAsSpace }), error: '' };
    } catch {
      return { output: '', error: t.error };
    }
  }, [input, mode, scope, spacePlus, plusAsSpace, t.error]);

  const doubleEncoded = mode === 'decode' && input.trim() && isDoubleEncoded(input);
  const parts = useMemo(() => {
    try { return splitUrl(input); } catch { return null; }
  }, [input]);
  const params = useMemo(() => {
    if (!input.includes('?') && !input.includes('=') && !input.includes('&')) return [];
    try { return parseQuery(input); } catch { return []; }
  }, [input]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'url-encoded.txt' : 'url-decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('encode')} style={mode === 'encode' ? primaryBtnStyle : btnStyle}>{t.modeEncode}</button>
        <button type="button" onClick={() => setMode('decode')} style={mode === 'decode' ? primaryBtnStyle : btnStyle}>{t.modeDecode}</button>
        <button type="button" onClick={swap} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="radio" name="url-scope" checked={scope === 'component'} onChange={() => setScope('component')} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.scopeComponent}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="radio" name="url-scope" checked={scope === 'whole'} onChange={() => setScope('whole')} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.scopeWhole}
        </label>
      </div>

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? t.inputPlaceholderEncode : t.inputPlaceholderDecode}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
        {mode === 'encode' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={spacePlus} onChange={(e) => setSpacePlus(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
            {t.spacePlus}
          </label>
        ) : (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={plusAsSpace} onChange={(e) => setPlusAsSpace(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
            {t.plusAsSpace}
          </label>
        )}
      </div>

      {doubleEncoded && <p style={{ fontSize: '0.9rem', marginTop: 10, color: '#92400e' }}>{t.doubleNote}</p>}

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {error ? (
          <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: 6 }}>{error}</p>
        ) : output ? (
          <textarea value={output} readOnly style={{ ...areaStyle, marginTop: 6, background: '#f9fafb' }} />
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
          {t.statsIn}: {input.length} {t.chars}
          {output ? ' · ' + t.statsOut + ': ' + output.length + ' ' + t.chars : ''}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      {parts && (
        <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.partsTitle}</p>
          <p style={{ fontSize: '0.9rem', fontFamily: 'ui-monospace, monospace', margin: '4px 0' }}>{parts.protocol}//{parts.host}{parts.pathname}{parts.search}{parts.hash}</p>
        </div>
      )}

      {input.trim() && (
        <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.paramsTitle}</p>
          {params.length ? (
            <ul style={{ fontSize: '0.9rem', margin: 0, paddingLeft: 20 }}>
              {params.map((p, i) => (
                <li key={i} style={{ fontFamily: 'ui-monospace, monospace' }}>{p.key} = {p.value}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t.noParams}</p>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>{t.builderTitle}</p>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={row.key}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))}
              placeholder={t.keyPlaceholder}
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
            <input
              value={row.value}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
              placeholder={t.valuePlaceholder}
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
            <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} style={btnStyle}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setRows([...rows, { key: '', value: '' }])} style={btnStyle}>{t.addRow}</button>
          <button type="button" onClick={() => setBuilt(buildQuery(rows))} style={primaryBtnStyle}>{t.generate}</button>
        </div>
        {built && <p style={{ fontSize: '0.9rem', fontFamily: 'ui-monospace, monospace', marginTop: 10 }}>{t.builtLabel}: {built}</p>}
      </div>

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
