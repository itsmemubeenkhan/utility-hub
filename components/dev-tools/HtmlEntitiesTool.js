'use client';
/* HTML Entities Encoder & Decoder: live encode/decode with 4 encode levels,
   named + decimal + hex decoding, unknown/invalid entity warnings,
   double-encoding detection, a clickable entity reference table, copy and
   download. Everything runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  encodeHtml, decodeHtml, looksEncoded, looksDoubleEncoded,
  countEntities, COMMON_ENTITIES,
} from '@/lib/html-entities-utils';

const STR = {
  en: {
    modeEncode: 'Encode',
    modeDecode: 'Decode',
    inputLabel: 'Input',
    inputPlaceholderEncode: 'Type or paste text to encode, e.g. Tom & Jerry <3 €10...',
    inputPlaceholderDecode: 'Paste HTML entities to decode, e.g. Tom &amp; Jerry &lt;3 &#8364;10...',
    outputLabel: 'Output',
    levelLabel: 'Encode level',
    levels: [
      { value: 'minimal', label: 'Minimal (only & < > " \')' },
      { value: 'named', label: 'Named (common named entities)' },
      { value: 'numeric', label: 'Numeric (decimal &#NN;)' },
      { value: 'all', label: 'All non-ASCII (named, else decimal)' },
    ],
    levelHints: {
      minimal: 'Only the 5 characters that break HTML. Best for escaping user text before it reaches a page.',
      named: 'Also turns common symbols into readable names like &copy; and &euro;.',
      numeric: 'Every non-ASCII character becomes a decimal code like &#8364;. Safest when file encoding is uncertain.',
      all: 'Prefers a named entity where one exists, falls back to decimal otherwise.',
    },
    swap: 'Swap',
    copy: 'Copy output',
    copied: 'Copied!',
    downloadTxt: 'Download .txt',
    downloadHtml: 'Download .html',
    clear: 'Clear',
    sample: 'Sample text',
    sampleEncode: 'Tom & Jerry <3 "café" - 50% off © 2026, €10 or £8!',
    sampleDecode: 'Tom &amp; Jerry &lt;3 &quot;caf&eacute;&quot; &mdash; 50% off &copy; 2026, &euro;10 or &pound;8!',
    hint: 'This looks encoded already. Switch to Decode?',
    switchToDecode: 'Decode this',
    doubleWarn: 'Warning: this looks double-encoded (e.g. &amp;amp;). Decoding once will give &amp;, not &. Encode only text that has not been encoded yet.',
    warningsTitle: 'Entities we could not decode',
    warningUnknown: 'unknown named entity',
    warningInvalid: 'invalid numeric reference',
    empty: 'Your result will appear here.',
    statsIn: 'Input',
    statsOut: 'Output',
    chars: 'characters',
    entities: 'entities',
    refTitle: 'Common entities (click to insert)',
    refNoteEncode: 'Click a row to insert the character into the input.',
    refNoteDecode: 'Click a row to insert the entity code into the input.',
    refChar: 'Character',
    refEntity: 'Entity',
    refName: 'Name',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/url-encoder-decoder', label: 'URL Encoder & Decoder' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/jwt-decoder', label: 'JWT Decoder' },
    ],
    privacy:
      'Privacy: conversion runs locally in your browser. Encoding is not encryption: anyone can decode entities, so never use it to hide a password or API key. Encoding user text before it reaches HTML is a core XSS defense.',
  },
  es: {
    modeEncode: 'Codificar',
    modeDecode: 'Decodificar',
    inputLabel: 'Entrada',
    inputPlaceholderEncode: 'Escribe o pega texto para codificar, p. ej. Tom & Jerry <3 €10...',
    inputPlaceholderDecode: 'Pega entidades HTML para decodificar, p. ej. Tom &amp; Jerry &lt;3 &#8364;10...',
    outputLabel: 'Salida',
    levelLabel: 'Nivel de codificación',
    levels: [
      { value: 'minimal', label: 'Mínimo (solo & < > " \')' },
      { value: 'named', label: 'Con nombre (entidades comunes)' },
      { value: 'numeric', label: 'Numérico (decimal &#NN;)' },
      { value: 'all', label: 'Todo no ASCII (con nombre, si no decimal)' },
    ],
    levelHints: {
      minimal: 'Solo los 5 caracteres que rompen el HTML. Lo mejor para escapar texto de usuario antes de que llegue a una página.',
      named: 'También convierte símbolos comunes en nombres legibles como &copy; y &euro;.',
      numeric: 'Cada carácter no ASCII se convierte en un código decimal como &#8364;. Lo más seguro cuando la codificación del archivo no es segura.',
      all: 'Prefiere una entidad con nombre donde existe una, y recurre al decimal en los demás casos.',
    },
    swap: 'Intercambiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    downloadTxt: 'Descargar .txt',
    downloadHtml: 'Descargar .html',
    clear: 'Limpiar',
    sample: 'Texto de ejemplo',
    sampleEncode: 'Tom & Jerry <3 "café" - 50% de descuento © 2026, €10 u £8!',
    sampleDecode: 'Tom &amp; Jerry &lt;3 &quot;caf&eacute;&quot; &mdash; 50% de descuento &copy; 2026, &euro;10 u &pound;8!',
    hint: 'Esto ya parece codificado. ¿Cambiar a Decodificar?',
    switchToDecode: 'Decodificar esto',
    doubleWarn: 'Advertencia: esto parece doblemente codificado (p. ej. &amp;amp;). Decodificar una vez dará &amp;, no &. Codifica solo texto que aún no ha sido codificado.',
    warningsTitle: 'Entidades que no pudimos decodificar',
    warningUnknown: 'entidad con nombre desconocida',
    warningInvalid: 'referencia numérica inválida',
    empty: 'Tu resultado aparecerá aquí.',
    statsIn: 'Entrada',
    statsOut: 'Salida',
    chars: 'caracteres',
    entities: 'entidades',
    refTitle: 'Entidades comunes (haz clic para insertar)',
    refNoteEncode: 'Haz clic en una fila para insertar el carácter en la entrada.',
    refNoteDecode: 'Haz clic en una fila para insertar el código de la entidad en la entrada.',
    refChar: 'Carácter',
    refEntity: 'Entidad',
    refName: 'Nombre',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/codificador-base64', label: 'Codificador y Decodificador Base64' },
      { href: '/es/tools/codificador-decodificador-url', label: 'Codificador y Decodificador de URL' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/decodificador-jwt', label: 'Decodificador JWT' },
    ],
    privacy:
      'Privacidad: la conversión corre localmente en tu navegador. Codificar no es cifrar: cualquiera puede decodificar entidades, así que nunca lo uses para ocultar una contraseña o clave de API. Codificar el texto de usuario antes de que llegue al HTML es una defensa central contra XSS.',
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

export default function HtmlEntitiesTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('encode');
  const [level, setLevel] = useState('named');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, warnings } = useMemo(() => {
    if (!input) return { output: '', warnings: [] };
    if (mode === 'encode') return { output: encodeHtml(input, level), warnings: [] };
    const { text, warnings: w } = decodeHtml(input);
    return { output: text, warnings: w };
  }, [input, mode, level]);

  const showHint = mode === 'encode' && looksEncoded(input);
  const showDoubleWarn = mode === 'encode' && looksDoubleEncoded(input);
  const entityCount = useMemo(() => countEntities(mode === 'decode' ? input : output), [input, output, mode]);

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

  const download = (ext) => {
    if (!output) return;
    const content = ext === 'html'
      ? '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>HTML entities output</title>\n</head>\n<body>\n<p>' + output + '</p>\n</body>\n</html>\n'
      : output;
    const blob = new Blob([content], { type: ext === 'html' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'html-entities-output.' + ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const loadSample = () => {
    setInput(mode === 'encode' ? t.sampleEncode : t.sampleDecode);
  };

  const insertFromTable = (row) => {
    setInput((prev) => prev + (mode === 'encode' ? row.char : row.entity));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('encode')} style={mode === 'encode' ? primaryBtnStyle : btnStyle}>{t.modeEncode}</button>
        <button type="button" onClick={() => setMode('decode')} style={mode === 'decode' ? primaryBtnStyle : btnStyle}>{t.modeDecode}</button>
        <button type="button" onClick={swap} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={loadSample} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
      </div>

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? t.inputPlaceholderEncode : t.inputPlaceholderDecode}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      {showHint && (
        <p style={{ fontSize: '0.9rem', marginTop: 8 }}>
          {t.hint}{' '}
          <button type="button" onClick={() => setMode('decode')} style={{ ...btnStyle, padding: '4px 10px' }}>{t.switchToDecode}</button>
        </p>
      )}

      {showDoubleWarn && (
        <p style={{ color: '#b45309', fontSize: '0.9rem', marginTop: 8 }}>{t.doubleWarn}</p>
      )}

      {mode === 'encode' && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.levelLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {t.levels.map((l) => (
              <button key={l.value} type="button" onClick={() => setLevel(l.value)} style={level === l.value ? primaryBtnStyle : btnStyle}>{l.label}</button>
            ))}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>{t.levelHints[level]}</p>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {output ? (
          <textarea value={output} readOnly style={{ ...areaStyle, marginTop: 6, background: '#f9fafb' }} />
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {warnings.length > 0 && (
          <div style={{ marginTop: 8, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 6px' }}>{t.warningsTitle}</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem', color: '#7f1d1d' }}>
              {warnings.map((w, i) => (
                <li key={i}>
                  <code>{w.ref}</code> {w.reason === 'unknown' ? t.warningUnknown : t.warningInvalid}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
          {t.statsIn}: {input.length} {t.chars}
          {output ? ' · ' + t.statsOut + ': ' + output.length + ' ' + t.chars : ''}
          {entityCount > 0 ? ' · ' + entityCount + ' ' + t.entities : ''}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={() => download('txt')} disabled={!output} style={btnStyle}>{t.downloadTxt}</button>
          <button type="button" onClick={() => download('html')} disabled={!output} style={btnStyle}>{t.downloadHtml}</button>
        </div>
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{t.refTitle}</p>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 0 }}>{mode === 'encode' ? t.refNoteEncode : t.refNoteDecode}</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '6px 8px' }}>{t.refChar}</th>
                <th style={{ padding: '6px 8px' }}>{t.refEntity}</th>
                <th style={{ padding: '6px 8px' }}>{t.refName}</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_ENTITIES.map((row) => (
                <tr key={row.entity} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => insertFromTable(row)}>
                  <td style={{ padding: '6px 8px', fontSize: '1.1rem' }}>{row.char}</td>
                  <td style={{ padding: '6px 8px' }}><code>{row.entity}</code></td>
                  <td style={{ padding: '6px 8px', color: '#6b7280' }}>{row.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
