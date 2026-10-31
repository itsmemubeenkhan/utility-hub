'use client';
/* Markdown to HTML Converter: paste Markdown, see a live rendered preview
   and the raw HTML side by side. Output is sanitized by construction (the
   parser escapes source HTML), so the result is safe to paste into a CMS.
   Everything runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { markdownToHtml, markdownStats, SAMPLE_MARKDOWN } from '@/lib/markdown-utils';

const STR = {
  en: {
    inputLabel: 'Markdown',
    inputPlaceholder: 'Type or paste Markdown here...',
    loadSample: 'Load sample',
    clear: 'Clear',
    upload: 'Upload .md file',
    viewPreview: 'Preview',
    viewHtml: 'HTML source',
    copyHtml: 'Copy HTML',
    copyMd: 'Copy Markdown',
    copied: 'Copied!',
    downloadHtml: 'Download .html',
    downloadNote: 'Downloads a complete standalone HTML document with basic styling.',
    empty: 'Your converted HTML will appear here. Type Markdown on the left, or load the sample to see how it works.',
    stats: 'Document stats',
    statWords: 'Words',
    statChars: 'Characters',
    statHeadings: 'Headings',
    statLinks: 'Links',
    statCode: 'Code blocks',
    statTables: 'Tables',
    statBytes: 'HTML size',
    privacy: 'Privacy: conversion runs locally in your browser. Your document is never uploaded, stored or logged.',
    safeNote: 'Safe output: any HTML typed into the input is escaped, never executed, so the HTML you copy is safe to paste into a blog or CMS.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/jwt-decoder', label: 'JWT Decoder' },
    ],
  },
  es: {
    inputLabel: 'Markdown',
    inputPlaceholder: 'Escribe o pega Markdown aquí...',
    loadSample: 'Cargar ejemplo',
    clear: 'Limpiar',
    upload: 'Subir archivo .md',
    viewPreview: 'Vista previa',
    viewHtml: 'Código HTML',
    copyHtml: 'Copiar HTML',
    copyMd: 'Copiar Markdown',
    copied: '¡Copiado!',
    downloadHtml: 'Descargar .html',
    downloadNote: 'Descarga un documento HTML completo e independiente con estilos básicos.',
    empty: 'Tu HTML convertido aparecerá aquí. Escribe Markdown a la izquierda, o carga el ejemplo para ver cómo funciona.',
    stats: 'Estadísticas del documento',
    statWords: 'Palabras',
    statChars: 'Caracteres',
    statHeadings: 'Encabezados',
    statLinks: 'Enlaces',
    statCode: 'Bloques de código',
    statTables: 'Tablas',
    statBytes: 'Tamaño del HTML',
    privacy: 'Privacidad: la conversión corre localmente en tu navegador. Tu documento nunca se sube, guarda ni registra.',
    safeNote: 'Salida segura: cualquier HTML escrito en la entrada se escapa, nunca se ejecuta, así que el HTML que copies es seguro para pegar en un blog o CMS.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/decodificador-jwt', label: 'Decodificador JWT' },
    ],
  },
};

export default function MarkdownTool({ lang = 'en' }) {
  const S = STR[lang] || STR.en;
  const [source, setSource] = useState('');
  const [view, setView] = useState('preview');
  const [copied, setCopied] = useState('');

  const html = useMemo(() => (source.trim() === '' ? '' : markdownToHtml(source)), [source]);
  const stats = useMemo(() => markdownStats(source), [source]);

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const download = () => {
    const doc = '<!DOCTYPE html>\n<html lang="' + lang + '">\n<head>\n<meta charset="utf-8">\n<title>Converted from Markdown</title>\n<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:.4rem .6rem}pre{background:#f4f4f4;padding:1rem;overflow:auto}blockquote{border-left:4px solid #ccc;margin-left:0;padding-left:1rem;color:#555}</style>\n</head>\n<body>\n' + html + '\n</body>\n</html>\n';
    const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'converted.html'; a.click();
    URL.revokeObjectURL(url);
  };

  const upload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result || ''));
    reader.readAsText(file);
  };

  return (
    <div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '.4rem' }}>{S.inputLabel}</label>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={S.inputPlaceholder}
            rows={18}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '.9rem', padding: '.6rem', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
            <button type="button" onClick={() => setSource(SAMPLE_MARKDOWN)}>{S.loadSample}</button>
            <button type="button" onClick={() => setSource('')}>{S.clear}</button>
            <label style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {S.upload}
              <input type="file" accept=".md,.markdown,.txt" onChange={upload} style={{ display: 'none' }} />
            </label>
            <button type="button" onClick={() => copy(source, 'md')}>{copied === 'md' ? S.copied : S.copyMd}</button>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.4rem' }}>
            <button type="button" onClick={() => setView('preview')} style={{ fontWeight: view === 'preview' ? 700 : 400 }}>{S.viewPreview}</button>
            <button type="button" onClick={() => setView('html')} style={{ fontWeight: view === 'html' ? 700 : 400 }}>{S.viewHtml}</button>
            <button type="button" onClick={() => copy(html, 'html')} disabled={!html}>{copied === 'html' ? S.copied : S.copyHtml}</button>
            <button type="button" onClick={download} disabled={!html}>{S.downloadHtml}</button>
          </div>
          {html === '' ? (
            <p>{S.empty}</p>
          ) : view === 'preview' ? (
            <div dangerouslySetInnerHTML={{ __html: html }} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', fontSize: '.85rem' }}>{html}</pre>
          )}
          <p style={{ fontSize: '.85rem', color: '#555' }}>{S.downloadNote}</p>
        </div>
      </div>
      <h3 style={{ marginTop: '1.5rem' }}>{S.stats}</h3>
      <ul>
        <li>{S.statWords}: {stats.words}</li>
        <li>{S.statChars}: {stats.chars}</li>
        <li>{S.statHeadings}: {stats.headings}</li>
        <li>{S.statLinks}: {stats.links}</li>
        <li>{S.statCode}: {stats.codeBlocks}</li>
        <li>{S.statTables}: {stats.tables}</li>
        <li>{S.statBytes}: {stats.htmlBytes} bytes</li>
      </ul>
      <p style={{ fontSize: '.9rem', color: '#555' }}>{S.privacy}</p>
      <p style={{ fontSize: '.9rem', color: '#555' }}>{S.safeNote}</p>
      <h3>{S.seeAlso}</h3>
      <ul>
        {S.siblings.map((s) => (
          <li key={s.href}><Link href={s.href}>{s.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
