'use client';
/* HTML to Text Converter: paste HTML, get clean plain text. The
   extraction runs entirely in the browser with a tag-aware scanner:
   scripts never run and nothing is fetched, because the input is
   treated as inert text. Block elements start on new lines, paragraphs
   and headings are separated by a blank line, lists get bullet or
   number markers, table rows land on new lines with tab-separated
   cells, and pre content keeps its line breaks. Options show link
   URLs, keep image alt text, and uppercase headings. Supports .html
   file upload, copy, .txt download, swap, and live counts. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  htmlToText, countHtmlToText, SAMPLE_HTML,
} from '@/lib/html-to-text-utils';

const STR = {
  en: {
    inputLabel: 'HTML input',
    inputPlaceholder: 'Paste your HTML here, e.g. <h1>Hello</h1><p>Some <a href="https://example.com">text</a>.</p>...',
    outputLabel: 'Plain text output',
    sample: 'Sample HTML',
    upload: 'Upload .html file',
    swap: 'Swap',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download text.txt',
    empty: 'Your plain text will appear here.',
    chars: 'characters',
    words: 'words',
    lines: 'lines',
    tagsRemoved: 'tags removed',
    optLinks: 'Show link URLs as "text (https://...)"',
    optAlt: 'Keep image alt text as [alt text]',
    optUpper: 'Uppercase headings',
    note: 'This converter turns HTML into readable plain text: headings and paragraphs on their own lines, lists with bullets or numbers, tables as tab-separated rows, and entities decoded. Script, style and head content is dropped, and the contents of pre blocks keep their line breaks. Everything runs locally in your browser, so it is safe for pages that are not published yet.',
    privacy:
      'Privacy: conversion runs locally in your browser. Your HTML is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/markdown-to-html', label: 'Markdown to HTML' },
      { href: '/tools/html-minifier', label: 'HTML Minifier' },
      { href: '/tools/html-entities-encoder-decoder', label: 'HTML Entities Encoder' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
    ],
  },
  es: {
    inputLabel: 'Entrada HTML',
    inputPlaceholder: 'Pega tu HTML aquí, p. ej. <h1>Hola</h1><p>Un <a href="https://example.com">texto</a>.</p>...',
    outputLabel: 'Texto plano',
    sample: 'HTML de ejemplo',
    upload: 'Subir archivo .html',
    swap: 'Intercambiar',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar texto.txt',
    empty: 'Tu texto plano aparecerá aquí.',
    chars: 'caracteres',
    words: 'palabras',
    lines: 'líneas',
    tagsRemoved: 'etiquetas quitadas',
    optLinks: 'Mostrar las URLs de los enlaces como "texto (https://...)"',
    optAlt: 'Conservar el texto alternativo de imágenes como [texto alt]',
    optUpper: 'Encabezados en mayúsculas',
    note: 'Este conversor convierte HTML en texto plano legible: encabezados y párrafos en sus propias líneas, listas con viñetas o números, tablas como filas separadas por tabulaciones y entidades decodificadas. El contenido de script, style y head se descarta, y el contenido de los bloques pre conserva sus saltos de línea. Todo corre localmente en tu navegador, así que es seguro para páginas aún no publicadas.',
    privacy:
      'Privacidad: la conversión corre localmente en tu navegador. Tu HTML nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/convertidor-de-markdown-a-html', label: 'Convertidor de Markdown a HTML' },
      { href: '/es/tools/minificador-de-html', label: 'Minificador de HTML' },
      { href: '/es/tools/codificador-de-entidades-html', label: 'Codificador de Entidades HTML' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
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

export default function HtmlToTextTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({
    showLinkUrls: true,
    keepAltText: true,
    uppercaseHeadings: false,
  });
  const fileRef = useRef(null);

  /* The scanner is synchronous and fast; recompute live as the user
     types or flips a toggle. */
  const output = useMemo(() => {
    if (!input.trim()) return '';
    return htmlToText(input, opts);
  }, [input, opts]);

  const stats = input.trim() ? countHtmlToText(input, output) : null;

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
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text.txt';
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
        <button type="button" onClick={() => setInput(SAMPLE_HTML)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => { const o = output; setInput(o); }} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 12 }}>
        {[
          ['showLinkUrls', t.optLinks],
          ['keepAltText', t.optAlt],
          ['uppercaseHeadings', t.optUpper],
        ].map(([key, label]) => (
          <label key={key} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)} /> {label}
          </label>
        ))}
      </div>

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
            {t.chars}: {stats.chars}
            {' · ' + t.words + ': ' + stats.words}
            {' · ' + t.lines + ': ' + stats.lines}
            {' · ' + t.tagsRemoved + ': ' + stats.tagsRemoved}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{t.download}</button>
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
