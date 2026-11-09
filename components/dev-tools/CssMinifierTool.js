'use client';
/* CSS Minifier & Beautifier: minify a stylesheet (strip comments and
   whitespace, shorten hex colors, drop units from zero values, remove
   empty rules) or beautify a minified one back into indented CSS.
   A string-aware scanner keeps calc() spaces, content strings and url()
   values intact. Everything runs in the browser; nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  minifyCss, beautifyCss, countCss, savedPercent, SAMPLE_CSS,
} from '@/lib/css-minifier-utils';

const STR = {
  en: {
    modeMinify: 'Minify',
    modeBeautify: 'Beautify',
    inputLabel: 'CSS input',
    inputPlaceholder: 'Paste your CSS here, e.g. .card { display: flex; padding: 24px; margin: 0px; }...',
    outputLabel: 'Output',
    sample: 'Sample CSS',
    upload: 'Upload .css file',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download .css',
    empty: 'Your result will appear here.',
    chars: 'characters',
    rules: 'rules',
    selectors: 'selectors',
    declarations: 'declarations',
    comments: 'comments',
    saved: 'saved',
    optComments: 'Remove comments',
    optImportant: 'Keep /*! license comments',
    optHex: 'Shorten hex colors (#ffffff to #fff)',
    optZero: 'Drop units from zero values (0px to 0)',
    optEmpty: 'Remove empty rules',
    note: 'Minifying only removes things a browser does not need: comments, whitespace, the last semicolon in a rule, and redundant characters. The page renders exactly the same, but the file is smaller, downloads sooner and blocks rendering for less time. CSS is render-blocking, so a smaller stylesheet improves First Contentful Paint and Largest Contentful Paint, two Core Web Vitals metrics.',
    privacy:
      'Privacy: minifying and beautifying run locally in your browser. Your CSS is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/css-gradient-generator', label: 'CSS Gradient Generator' },
      { href: '/tools/color-palette-generator', label: 'Color Palette Generator' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
      { href: '/tools/html-entities-encoder-decoder', label: 'HTML Entities Encoder' },
    ],
  },
  es: {
    modeMinify: 'Minificar',
    modeBeautify: 'Embellecer',
    inputLabel: 'Entrada CSS',
    inputPlaceholder: 'Pega tu CSS aquí, p. ej. .card { display: flex; padding: 24px; margin: 0px; }...',
    outputLabel: 'Salida',
    sample: 'CSS de ejemplo',
    upload: 'Subir archivo .css',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar .css',
    empty: 'Tu resultado aparecerá aquí.',
    chars: 'caracteres',
    rules: 'reglas',
    selectors: 'selectores',
    declarations: 'declaraciones',
    comments: 'comentarios',
    saved: 'ahorrado',
    optComments: 'Quitar comentarios',
    optImportant: 'Conservar comentarios de licencia /*!',
    optHex: 'Acortar colores hex (#ffffff a #fff)',
    optZero: 'Quitar unidades de los ceros (0px a 0)',
    optEmpty: 'Eliminar reglas vacías',
    note: 'Minificar solo quita lo que el navegador no necesita: comentarios, espacios en blanco, el último punto y coma de una regla y caracteres redundantes. La página se ve exactamente igual, pero el archivo es más pequeño, se descarga antes y bloquea el renderizado menos tiempo. El CSS bloquea el renderizado, así que una hoja más pequeña mejora el First Contentful Paint y el Largest Contentful Paint, dos métricas de Core Web Vitals.',
    privacy:
      'Privacidad: la minificación y el embellecimiento corren localmente en tu navegador. Tu CSS nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/generador-de-degradados-css', label: 'Generador de Degradados CSS' },
      { href: '/es/tools/generador-de-paletas-de-colores', label: 'Generador de Paletas de Colores' },
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
      { href: '/es/tools/codificador-de-entidades-html', label: 'Codificador de Entidades HTML' },
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
  minHeight: 180,
  marginTop: 6,
  background: '#f9fafb',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

export default function CssMinifierTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('minify');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({
    removeComments: true,
    keepImportant: true,
    shortenHex: true,
    zeroUnits: true,
    dropEmpty: true,
  });
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', stats: null, saved: null };
    const output = mode === 'minify' ? minifyCss(input, opts) : beautifyCss(input);
    const stats = countCss(input);
    const saved = mode === 'minify' ? savedPercent(input, output) : null;
    return { output, stats, saved };
  }, [input, mode, opts]);

  const toggle = (key) => setOpts((o) => ({ ...o, [key]: !o[key] }));

  const copy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'style.min.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('minify')} style={mode === 'minify' ? primaryBtnStyle : btnStyle}>{t.modeMinify}</button>
        <button type="button" onClick={() => setMode('beautify')} style={mode === 'beautify' ? primaryBtnStyle : btnStyle}>{t.modeBeautify}</button>
        <button type="button" onClick={() => setInput(SAMPLE_CSS)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".css,text/css" onChange={onFile} style={{ display: 'none' }} />
      </div>

      {mode === 'minify' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 12 }}>
          {[
            ['removeComments', t.optComments],
            ['keepImportant', t.optImportant],
            ['shortenHex', t.optHex],
            ['zeroUnits', t.optZero],
            ['dropEmpty', t.optEmpty],
          ].map(([key, label]) => (
            <label key={key} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)} /> {label}
            </label>
          ))}
        </div>
      )}

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {result.output ? (
          <pre style={preStyle}>{result.output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {result.stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {input.length} → {result.output.length}
            {result.saved !== null ? ' · ' + result.saved + '% ' + t.saved : ''}
            {' · ' + t.rules + ': ' + result.stats.rules + ' · ' + t.selectors + ': ' + result.stats.selectors + ' · ' + t.declarations + ': ' + result.stats.declarations + ' · ' + t.comments + ': ' + result.stats.comments}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>⚡ {t.note}</p>
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
