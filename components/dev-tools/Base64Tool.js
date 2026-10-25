'use client';
/* Base64 Encoder & Decoder: UTF-8-safe text conversion, URL-safe variant,
   optional padding strip, file-to-base64 encode, auto-detect hint, copy and
   download. Everything runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { encodeText, decodeText, encodeBytes, looksLikeBase64 } from '@/lib/base64-utils';

const STR = {
  en: {
    modeEncode: 'Encode',
    modeDecode: 'Decode',
    inputLabel: 'Input',
    inputPlaceholderEncode: 'Type or paste text to encode...',
    inputPlaceholderDecode: 'Paste Base64 (or a data URI) to decode...',
    outputLabel: 'Output',
    urlSafe: 'URL-safe (uses - and _ instead of + and /)',
    noPadding: 'Strip = padding',
    swap: 'Swap',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download .txt',
    clear: 'Clear',
    encodeFile: 'Or encode a file to Base64',
    fileNote: 'File is read locally in your browser and never uploaded.',
    hint: 'This looks like Base64. Switch to Decode?',
    switchToDecode: 'Decode this',
    error: 'Could not decode that. Check for typos, stray characters, or text that was never Base64.',
    empty: 'Your result will appear here.',
    statsIn: 'Input',
    statsOut: 'Output',
    chars: 'characters',
    bytes: 'bytes',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB' },
    ],
    privacy:
      'Privacy: conversion runs locally in your browser. Base64 is encoding, not encryption: anyone can decode it, so never use it to hide a password or API key.',
  },
  es: {
    modeEncode: 'Codificar',
    modeDecode: 'Decodificar',
    inputLabel: 'Entrada',
    inputPlaceholderEncode: 'Escribe o pega texto para codificar...',
    inputPlaceholderDecode: 'Pega Base64 (o una URI de datos) para decodificar...',
    outputLabel: 'Salida',
    urlSafe: 'Seguro para URL (usa - y _ en vez de + y /)',
    noPadding: 'Quitar relleno =',
    swap: 'Intercambiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    clear: 'Limpiar',
    encodeFile: 'O codifica un archivo a Base64',
    fileNote: 'El archivo se lee localmente en tu navegador y nunca se sube.',
    hint: 'Esto parece Base64. ¿Cambiar a Decodificar?',
    switchToDecode: 'Decodificar esto',
    error: 'No se pudo decodificar. Revisa errores de tipeo, caracteres extraños o texto que nunca fue Base64.',
    empty: 'Tu resultado aparecerá aquí.',
    statsIn: 'Entrada',
    statsOut: 'Salida',
    chars: 'caracteres',
    bytes: 'bytes',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
    ],
    privacy:
      'Privacidad: la conversión corre localmente en tu navegador. Base64 es codificación, no cifrado: cualquiera puede decodificarlo, así que nunca lo uses para ocultar una contraseña o clave de API.',
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

export default function Base64Tool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [noPadding, setNoPadding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileOutput, setFileOutput] = useState('');

  const { output, error } = useMemo(() => {
    if (fileOutput) return { output: fileOutput, error: '' };
    if (!input.trim()) return { output: '', error: '' };
    try {
      if (mode === 'encode') return { output: encodeText(input, { urlSafe, noPadding }), error: '' };
      return { output: decodeText(input), error: '' };
    } catch {
      return { output: '', error: t.error };
    }
  }, [input, mode, urlSafe, noPadding, t.error, fileOutput]);

  const showHint = mode === 'encode' && looksLikeBase64(input);

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input]);

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
    a.download = mode === 'encode' ? 'base64-output.txt' : 'base64-decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const buf = new Uint8Array(reader.result);
      setInput('');
      setFileOutput(encodeBytes(buf, { urlSafe, noPadding }));
      setFileName(file.name + ' (' + buf.length + ' ' + t.bytes + ')');
    };
    reader.readAsArrayBuffer(file);
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => { setMode('encode'); setFileOutput(''); }} style={mode === 'encode' ? primaryBtnStyle : btnStyle}>{t.modeEncode}</button>
        <button type="button" onClick={() => { setMode('decode'); setFileOutput(''); }} style={mode === 'decode' ? primaryBtnStyle : btnStyle}>{t.modeDecode}</button>
        <button type="button" onClick={swap} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => { setInput(''); setFileName(''); setFileOutput(''); }} style={btnStyle}>{t.clear}</button>
      </div>

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setFileOutput(''); }}
        placeholder={mode === 'encode' ? t.inputPlaceholderEncode : t.inputPlaceholderDecode}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      {showHint && (
        <p style={{ fontSize: '0.9rem', marginTop: 8 }}>
          {t.hint}{' '}
          <button type="button" onClick={() => setMode('decode')} style={{ ...btnStyle, padding: '4px 10px' }}>{t.switchToDecode}</button>
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.urlSafe}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={noPadding} onChange={(e) => setNoPadding(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
          {t.noPadding}
        </label>
      </div>

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
          {t.statsIn}: {input.length} {t.chars} / {inputBytes} {t.bytes}
          {output ? ' · ' + t.statsOut + ': ' + output.length + ' ' + t.chars : ''}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.encodeFile}</label>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>{t.fileNote}</p>
        <input type="file" onChange={onFile} style={{ marginTop: 6, fontSize: '0.9rem' }} />
        {fileName && <p style={{ fontSize: '0.9rem', marginTop: 6 }}>{fileName}</p>}
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
