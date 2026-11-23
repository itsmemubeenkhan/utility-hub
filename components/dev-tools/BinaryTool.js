'use client';
/* Binary to Text Converter: text to binary and binary to text, both ways,
   with auto-detect direction. Text encodes as UTF-8 (accents and emoji
   survive), with a 7-bit ASCII mode for the textbook form. Binary input
   accepts spaced, comma-separated, continuous and 0b-prefixed groups, and
   errors name their exact position instead of guessing. A byte table shows
   every character as binary, hex and decimal. 100% in your browser,
   nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { textToBinary, binaryToText, detectBinary, byteTable, countBinary, SAMPLE_TEXT, SAMPLE_BINARY } from '@/lib/binary-utils';

const STR = {
  en: {
    optionsTitle: 'Conversion options',
    directionLabel: 'Direction',
    auto: 'Auto-detect',
    toBinary: 'Text to Binary',
    toText: 'Binary to Text',
    bitsLabel: 'Encoding',
    bits8: '8-bit UTF-8',
    bits7: '7-bit ASCII',
    sepLabel: 'Group separator',
    sepSpace: 'Spaces',
    sepNone: 'None',
    sepComma: 'Commas',
    inputLabel: 'Input',
    inputPlaceholder: 'Type text, or paste binary like 01001000 01101001...',
    outputLabel: 'Result',
    sampleText: 'Sample text',
    sampleBinary: 'Sample binary',
    swap: 'Swap direction',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    empty: 'Your result will appear here.',
    invalid: 'Could not convert',
    position: 'at position',
    chars: 'characters',
    bytes: 'bytes',
    groups: 'groups',
    outChars: 'output characters',
    tableTitle: 'Byte table: how each character is stored',
    tableChar: 'Character',
    tableCode: 'Code point',
    tableBinary: 'Binary',
    tableHex: 'Hex',
    tableDec: 'Decimal',
    tableBytes: 'Bytes',
    howTitle: 'Why UTF-8 matters',
    howNote: 'ASCII covers only the first 128 characters, so an ASCII-only converter has no way to write an accented letter or an emoji and usually turns it into a question mark. UTF-8 writes those characters as two to four bytes each, which is how they are actually stored everywhere, so café, naïve and a waving hand decode back to exactly what you typed. The 7-bit mode is the classic textbook form, one group per character, and it refuses non-ASCII input with a named error instead of mangling it.',
    privacy: 'Privacy: encoding and decoding run locally in your browser with the built-in TextEncoder and TextDecoder. Nothing you type is uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/url-encoder-decoder', label: 'URL Encoder & Decoder' },
      { href: '/tools/hex-to-rgb', label: 'Hex to RGB Converter' },
      { href: '/tools/hash-generator', label: 'Hash Generator' },
    ],
  },
  es: {
    optionsTitle: 'Opciones de conversión',
    directionLabel: 'Dirección',
    auto: 'Detección automática',
    toBinary: 'Texto a Binario',
    toText: 'Binario a Texto',
    bitsLabel: 'Codificación',
    bits8: 'UTF-8 de 8 bits',
    bits7: 'ASCII de 7 bits',
    sepLabel: 'Separador de grupos',
    sepSpace: 'Espacios',
    sepNone: 'Ninguno',
    sepComma: 'Comas',
    inputLabel: 'Entrada',
    inputPlaceholder: 'Escribe texto, o pega binario como 01001000 01101001...',
    outputLabel: 'Resultado',
    sampleText: 'Texto de ejemplo',
    sampleBinary: 'Binario de ejemplo',
    swap: 'Cambiar dirección',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    empty: 'Tu resultado aparecerá aquí.',
    invalid: 'No se pudo convertir',
    position: 'en la posición',
    chars: 'caracteres',
    bytes: 'bytes',
    groups: 'grupos',
    outChars: 'caracteres de salida',
    tableTitle: 'Tabla de bytes: cómo se guarda cada carácter',
    tableChar: 'Carácter',
    tableCode: 'Punto de código',
    tableBinary: 'Binario',
    tableHex: 'Hex',
    tableDec: 'Decimal',
    tableBytes: 'Bytes',
    howTitle: 'Por qué importa UTF-8',
    howNote: 'ASCII cubre solo los primeros 128 caracteres, así que un conversor de solo ASCII no tiene forma de escribir una letra acentuada o un emoji y suele convertirlo en un signo de interrogación. UTF-8 escribe esos caracteres con dos a cuatro bytes cada uno, que es como se guardan en todas partes, así café, naïve y una mano saludando se decodifican de vuelta exactamente como los escribiste. El modo de 7 bits es la forma clásica de los libros de texto, un grupo por carácter, y rechaza la entrada no ASCII con un error nombrado en vez de deformarla.',
    privacy: 'Privacidad: la codificación y decodificación corren localmente en tu navegador con TextEncoder y TextDecoder integrados. Nada de lo que escribes se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/codificador-decodificador-url', label: 'Codificador de URL' },
      { href: '/es/tools/convertidor-de-hex-a-rgb', label: 'Convertidor de Hex a RGB' },
      { href: '/es/tools/generador-de-hash', label: 'Generador de Hash' },
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

export default function BinaryTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState('auto');
  const [bits, setBits] = useState(8);
  const [separator, setSeparator] = useState('space');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null, mode: null, counts: null, rows: null };
    const isBinary = direction === 'toText' || (direction === 'auto' && detectBinary(input));
    if (isBinary) {
      const r = binaryToText(input, { bits });
      if (!r.ok) return { output: '', error: r.error, mode: 'toText', counts: null, rows: null };
      return { output: r.output, error: null, mode: 'toText', counts: countBinary(r.output), rows: byteTable(r.output) };
    }
    const r = textToBinary(input, { separator, bits });
    if (!r.ok) return { output: '', error: r.error, mode: 'toBinary', counts: null, rows: null };
    return { output: r.output, error: null, mode: 'toBinary', counts: countBinary(input), rows: byteTable(input) };
  }, [input, direction, bits, separator]);

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
    const blob = new Blob([result.output + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'binary-conversion.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = (which) => {
    setInput(which === 'binary' ? SAMPLE_BINARY : SAMPLE_TEXT);
    if (which === 'binary') setDirection('toText');
    else setDirection('toBinary');
  };

  const swap = () => {
    if (!result.output) return;
    setInput(result.output);
    setDirection(result.mode === 'toBinary' ? 'toText' : 'toBinary');
  };

  const errorText = result.error
    ? result.error.message + (typeof result.error.position === 'number' && result.error.position > 0 ? ' (' + t.position + ' ' + (result.error.position + 1) + ')' : '')
    : null;

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.optionsTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t.directionLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setDirection('auto')} style={direction === 'auto' ? primaryBtnStyle : btnStyle}>{t.auto}</button>
            <button type="button" onClick={() => setDirection('toBinary')} style={direction === 'toBinary' ? primaryBtnStyle : btnStyle}>{t.toBinary}</button>
            <button type="button" onClick={() => setDirection('toText')} style={direction === 'toText' ? primaryBtnStyle : btnStyle}>{t.toText}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.bitsLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setBits(8)} style={bits === 8 ? primaryBtnStyle : btnStyle}>{t.bits8}</button>
            <button type="button" onClick={() => setBits(7)} style={bits === 7 ? primaryBtnStyle : btnStyle}>{t.bits7}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.sepLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setSeparator('space')} style={separator === 'space' ? primaryBtnStyle : btnStyle}>{t.sepSpace}</button>
            <button type="button" onClick={() => setSeparator('none')} style={separator === 'none' ? primaryBtnStyle : btnStyle}>{t.sepNone}</button>
            <button type="button" onClick={() => setSeparator('comma')} style={separator === 'comma' ? primaryBtnStyle : btnStyle}>{t.sepComma}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => loadSample('text')} style={btnStyle}>{t.sampleText}</button>
        <button type="button" onClick={() => loadSample('binary')} style={btnStyle}>{t.sampleBinary}</button>
        <button type="button" onClick={swap} disabled={!result.output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setInput(String(r.result || '')); r.readAsText(f); e.target.value = ''; }} style={{ display: 'none' }} />
      </div>

      <label htmlFor="binary-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="binary-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>{t.outputLabel}</label>
        {result.error ? (
          <div style={{ marginTop: 6, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px', color: '#7f1d1d' }}>{t.invalid}</p>
            <p style={{ fontSize: '0.9rem', margin: 0, color: '#7f1d1d' }}>{errorText}</p>
          </div>
        ) : result.output ? (
          <pre style={preStyle}>{result.output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {result.counts && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {result.counts.chars} · {t.bytes}: {result.counts.bytes} · {t.groups}: {result.counts.groups}
            {result.output ? ' · ' + t.outChars + ': ' + result.output.length : ''}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      {result.rows && result.rows.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 4px' }}>{t.tableTitle}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t.tableChar}</th>
                  <th style={thStyle}>{t.tableCode}</th>
                  <th style={thStyle}>{t.tableBinary}</th>
                  <th style={thStyle}>{t.tableHex}</th>
                  <th style={thStyle}>{t.tableDec}</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{row.char === ' ' ? '(space)' : row.char}</td>
                    <td style={tdStyle}>{row.codePoint}</td>
                    <td style={tdStyle}>{row.binary}</td>
                    <td style={tdStyle}>{row.hex}</td>
                    <td style={tdStyle}>{row.dec}</td>
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
