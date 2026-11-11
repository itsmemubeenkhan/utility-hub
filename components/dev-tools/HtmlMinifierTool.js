'use client';
/* HTML Minifier & Beautifier: a tag-aware scanner that minifies markup
   in the browser with no upload. It preserves <pre>, <textarea>,
   <script> and <style> contents verbatim, keeps conditional comments
   and the doctype, never joins two words, and only drops optional end
   tags and attribute quotes where the HTML spec allows it. Beautify
   re-indents minified HTML with an implicit-close table so dropped end
   tags never drift the depth. Everything runs in the browser; nothing
   is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  minifyHtml, beautifyHtml, countHtml, savedPercent, SAMPLE_HTML,
} from '@/lib/html-minifier-utils';

const STR = {
  en: {
    modeMinify: 'Minify',
    modeBeautify: 'Beautify',
    inputLabel: 'HTML input',
    inputPlaceholder: 'Paste your HTML here, e.g. <!DOCTYPE html><html><head><title>Page</title></head><body><h1>Hello</h1></body></html>...',
    outputLabel: 'Output',
    sample: 'Sample HTML',
    upload: 'Upload .html file',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    downloadMin: 'Download page.min.html',
    downloadPretty: 'Download page.html',
    empty: 'Your result will appear here.',
    chars: 'characters',
    bytes: 'bytes',
    lines: 'lines',
    tags: 'tags',
    comments: 'comments',
    saved: 'saved',
    optComments: 'Remove comments (conditional comments are always kept)',
    optWhitespace: 'Collapse whitespace',
    optOptional: 'Remove optional tags (</html>, </head>, </body>, </p>, </li>)',
    optQuotes: 'Remove attribute quotes where safe (URLs keep theirs)',
    optBooleans: 'Shorten boolean attributes (checked="checked" becomes checked)',
    note: 'Minifying shrinks a page by removing comments, whitespace, optional end tags and redundant attribute characters, so the file downloads sooner and parses faster. The page still renders exactly the same. The contents of pre, textarea, script and style elements are never touched, and inline CSS and JavaScript are left as they are: shrink those with the CSS and JavaScript minifiers first.',
    privacy:
      'Privacy: minifying and beautifying run locally in your browser. Your markup is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/css-minifier', label: 'CSS Minifier' },
      { href: '/tools/javascript-minifier', label: 'JavaScript Minifier' },
      { href: '/tools/html-entities-encoder-decoder', label: 'HTML Entities Encoder' },
      { href: '/tools/regex-tester', label: 'Regex Tester' },
    ],
  },
  es: {
    modeMinify: 'Minificar',
    modeBeautify: 'Embellecer',
    inputLabel: 'Entrada HTML',
    inputPlaceholder: 'Pega tu HTML aquí, p. ej. <!DOCTYPE html><html><head><title>Página</title></head><body><h1>Hola</h1></body></html>...',
    outputLabel: 'Salida',
    sample: 'HTML de ejemplo',
    upload: 'Subir archivo .html',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    downloadMin: 'Descargar page.min.html',
    downloadPretty: 'Descargar page.html',
    empty: 'Tu resultado aparecerá aquí.',
    chars: 'caracteres',
    bytes: 'bytes',
    lines: 'líneas',
    tags: 'etiquetas',
    comments: 'comentarios',
    saved: 'ahorrado',
    optComments: 'Quitar comentarios (los condicionales siempre se conservan)',
    optWhitespace: 'Colapsar espacios en blanco',
    optOptional: 'Quitar etiquetas opcionales (</html>, </head>, </body>, </p>, </li>)',
    optQuotes: 'Quitar comillas de atributos donde sea seguro (las URLs conservan las suyas)',
    optBooleans: 'Acortar atributos booleanos (checked="checked" se convierte en checked)',
    note: 'Minificar reduce una página quitando comentarios, espacios, etiquetas de cierre opcionales y caracteres redundantes en atributos, así el archivo se descarga antes y se analiza más rápido. La página se sigue viendo exactamente igual. El contenido de los elementos pre, textarea, script y style nunca se toca, y el CSS y el JavaScript en línea se dejan como están: achícalos primero con el Minificador de CSS y el Minificador de JavaScript.',
    privacy:
      'Privacidad: la minificación y el embellecimiento corren localmente en tu navegador. Tu código nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/minificador-de-css', label: 'Minificador de CSS' },
      { href: '/es/tools/minificador-de-javascript', label: 'Minificador de JavaScript' },
      { href: '/es/tools/codificador-de-entidades-html', label: 'Codificador de Entidades HTML' },
      { href: '/es/tools/probador-de-regex', label: 'Probador de Regex' },
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

export default function HtmlMinifierTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('minify');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    removeAttributeQuotes: true,
    shortenBooleans: true,
  });
  const fileRef = useRef(null);

  /* The scanner is synchronous and fast; recompute live as the user
     types or flips a toggle. */
  const output = useMemo(() => {
    if (!input.trim()) return '';
    return mode === 'minify' ? minifyHtml(input, opts) : beautifyHtml(input);
  }, [input, mode, opts]);

  const stats = input.trim() ? countHtml(input) : null;
  const saved = mode === 'minify' && output ? savedPercent(input, output) : null;

  const toggle = (key) => setOpts((o) => ({ ...o, [key]: !o[key] }));

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
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'minify' ? 'page.min.html' : 'page.html';
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
        <button type="button" onClick={() => setInput(SAMPLE_HTML)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={onFile} style={{ display: 'none' }} />
      </div>

      {mode === 'minify' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 12 }}>
          {[
            ['removeComments', t.optComments],
            ['collapseWhitespace', t.optWhitespace],
            ['removeOptionalTags', t.optOptional],
            ['removeAttributeQuotes', t.optQuotes],
            ['shortenBooleans', t.optBooleans],
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
        {output ? (
          <pre style={preStyle}>{output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {input.length} → {output.length}
            {saved !== null ? ' · ' + saved + '% ' + t.saved : ''}
            {' · ' + t.lines + ': ' + stats.lines + ' · ' + t.tags + ': ' + stats.tags + ' · ' + t.comments + ': ' + stats.comments}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{mode === 'minify' ? t.downloadMin : t.downloadPretty}</button>
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
