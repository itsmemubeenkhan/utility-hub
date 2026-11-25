'use client';
/* ROT13 and Caesar Cipher Encoder/Decoder: type and watch ROT13, ROT5,
   ROT18, ROT47 or any Caesar shift from 0 to 25 transform your text live.
   An encode/decode toggle flips Caesar shifts, a brute-force cracker tries
   all 25 shifts and ranks them by English-likeness, and a ROT13 wheel shows
   the letter pairs. Copy and .txt download included. 100% in your browser,
   nothing is uploaded. ROT13 is obfuscation, not encryption. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  transform,
  crackCaesar,
  rot13Pairs,
  SAMPLE_ROT13,
  SAMPLE_SPOILER,
  SAMPLE_CAESAR3,
  SAMPLE_CRACKER,
} from '@/lib/rot13-utils';

const VARIANTS = [
  { key: 'caesar', fixedShift: null },
  { key: 'rot13', fixedShift: 13 },
  { key: 'rot5', fixedShift: 5 },
  { key: 'rot18', fixedShift: 18 },
  { key: 'rot47', fixedShift: 47 },
];

const STR = {
  en: {
    optionsTitle: 'Cipher options',
    variantLabel: 'Variant',
    variantCaesar: 'Caesar (custom shift)',
    variantRot13: 'ROT13 (letters)',
    variantRot5: 'ROT5 (digits)',
    variantRot18: 'ROT18 (letters + digits)',
    variantRot47: 'ROT47 (all printable)',
    directionLabel: 'Direction',
    encode: 'Encode',
    decode: 'Decode',
    shiftLabel: 'Caesar shift',
    shiftNote: 'Decode uses 26 minus the shift. ROT13, ROT5, ROT18 and ROT47 are their own inverses, so encode and decode are the same step.',
    inputLabel: 'Input text',
    inputPlaceholder: 'Type or paste text to encode or decode...',
    outputLabel: 'Output',
    sample: 'Sample',
    sampleRot13: 'ROT13: "Uryyb, Jbeyq!"',
    sampleSpoiler: 'Spoiler sentence',
    sampleCaesar: 'Caesar shift 3',
    sampleCracker: 'Cracker sample',
    swap: 'Swap',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    empty: 'Your transformed text will appear here.',
    inChars: 'characters in',
    outChars: 'characters out',
    crackerTitle: 'Brute-force cracker',
    crackerNote: 'Paste a Caesar ciphertext above, then crack it: all 25 shifts are tried and ranked by how English-like each decoding looks.',
    crackButton: 'Crack it',
    crackEmpty: 'Type a Caesar ciphertext above first.',
    crackShort: 'Very short texts have too little signal to rank reliably, so treat the ranking as a hint.',
    crackRank: 'Rank',
    crackShift: 'Shift',
    crackScore: 'Score',
    crackText: 'Decoded text',
    crackApply: 'Use this text',
    wheelTitle: 'ROT13 wheel: letter pairs',
    wheelNote: 'Each letter pairs with the letter 13 places away. Encoding swaps each pair, which is why ROT13 undoes itself.',
    warnTitle: 'Honest warning',
    warnNote: 'ROT13 is obfuscation, NOT encryption. Anyone can reverse it in one click, and a cracker tries all 25 Caesar shifts in milliseconds. Never use it for passwords or anything that must stay secret.',
    privacy: 'Privacy: encoding, decoding and cracking run locally in your browser. Nothing you type is uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder' },
      { href: '/tools/hash-generator', label: 'Hash Generator' },
      { href: '/tools/binary-to-text-converter', label: 'Binary to Text Converter' },
      { href: '/tools/password-generator', label: 'Password Generator' },
    ],
  },
  es: {
    optionsTitle: 'Opciones de cifrado',
    variantLabel: 'Variante',
    variantCaesar: 'César (desplazamiento a medida)',
    variantRot13: 'ROT13 (letras)',
    variantRot5: 'ROT5 (dígitos)',
    variantRot18: 'ROT18 (letras + dígitos)',
    variantRot47: 'ROT47 (todos los imprimibles)',
    directionLabel: 'Dirección',
    encode: 'Codificar',
    decode: 'Decodificar',
    shiftLabel: 'Desplazamiento César',
    shiftNote: 'Decodificar usa 26 menos el desplazamiento. ROT13, ROT5, ROT18 y ROT47 son sus propios inversos, así que codificar y decodificar son el mismo paso.',
    inputLabel: 'Texto de entrada',
    inputPlaceholder: 'Escribe o pega texto para codificar o decodificar...',
    outputLabel: 'Salida',
    sample: 'Ejemplo',
    sampleRot13: 'ROT13: "Uryyb, Jbeyq!"',
    sampleSpoiler: 'Frase de spoiler',
    sampleCaesar: 'César desplazamiento 3',
    sampleCracker: 'Ejemplo para descifrar',
    swap: 'Intercambiar',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    empty: 'Tu texto transformado aparecerá aquí.',
    inChars: 'caracteres de entrada',
    outChars: 'caracteres de salida',
    crackerTitle: 'Descifrador de fuerza bruta',
    crackerNote: 'Pega un texto cifrado con César arriba, luego descífralo: se prueban los 25 desplazamientos y se ordenan por qué tan parecido al inglés se ve cada decodificación.',
    crackButton: 'Descifrar',
    crackEmpty: 'Primero escribe un texto cifrado con César arriba.',
    crackShort: 'Los textos muy cortos tienen muy poca señal para ordenarse bien, así que toma el ranking como una pista.',
    crackRank: 'Puesto',
    crackShift: 'Desplazamiento',
    crackScore: 'Puntuación',
    crackText: 'Texto decodificado',
    crackApply: 'Usar este texto',
    wheelTitle: 'Rueda ROT13: pares de letras',
    wheelNote: 'Cada letra se empareja con la letra a 13 lugares. Codificar intercambia cada par, por eso ROT13 se deshace a sí mismo.',
    warnTitle: 'Advertencia honesta',
    warnNote: 'ROT13 es ofuscación, NO cifrado. Cualquiera lo revierte con un clic, y un descifrador prueba los 25 desplazamientos César en milisegundos. Nunca lo uses para contraseñas ni nada que deba mantenerse secreto.',
    privacy: 'Privacidad: codificar, decodificar y descifrar corren localmente en tu navegador. Nada de lo que escribes se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas de desarrollo',
    siblings: [
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/generador-de-hash', label: 'Generador de Hash' },
      { href: '/es/tools/convertidor-de-binario-a-texto', label: 'Convertidor de Binario a Texto' },
      { href: '/es/tools/generador-de-contrasenas-aleatorias', label: 'Generador de Contraseñas' },
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

export default function Rot13Tool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [variant, setVariant] = useState('rot13');
  const [shift, setShift] = useState(13);
  const [direction, setDirection] = useState('decode');
  const [copied, setCopied] = useState(false);
  const [crackResults, setCrackResults] = useState(null);

  const output = useMemo(
    () => (input ? transform(input, variant, shift, direction) : ''),
    [input, variant, shift, direction]
  );

  const pickVariant = (key) => {
    setVariant(key);
    const v = VARIANTS.find((x) => x.key === key);
    if (v && v.fixedShift !== null) setShift(v.fixedShift);
  };

  const loadSample = (text, v, s, dir) => {
    setInput(text);
    setVariant(v);
    setShift(s);
    setDirection(dir);
    setCrackResults(null);
  };

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
    a.download = 'rot13-cipher.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
  };

  const crack = () => {
    if (!input) return;
    setCrackResults(crackCaesar(input).slice(0, 5));
  };

  const applyCrack = (text) => {
    setInput(text);
    setVariant('caesar');
    setShift(0);
    setDirection('encode');
    setCrackResults(null);
  };

  const pairs = useMemo(() => rot13Pairs(), []);

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.optionsTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t.variantLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => pickVariant('caesar')} style={variant === 'caesar' ? primaryBtnStyle : btnStyle}>{t.variantCaesar}</button>
            <button type="button" onClick={() => pickVariant('rot13')} style={variant === 'rot13' ? primaryBtnStyle : btnStyle}>{t.variantRot13}</button>
            <button type="button" onClick={() => pickVariant('rot5')} style={variant === 'rot5' ? primaryBtnStyle : btnStyle}>{t.variantRot5}</button>
            <button type="button" onClick={() => pickVariant('rot18')} style={variant === 'rot18' ? primaryBtnStyle : btnStyle}>{t.variantRot18}</button>
            <button type="button" onClick={() => pickVariant('rot47')} style={variant === 'rot47' ? primaryBtnStyle : btnStyle}>{t.variantRot47}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.directionLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setDirection('encode')} style={direction === 'encode' ? primaryBtnStyle : btnStyle}>{t.encode}</button>
            <button type="button" onClick={() => setDirection('decode')} style={direction === 'decode' ? primaryBtnStyle : btnStyle}>{t.decode}</button>
          </div>
        </div>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label htmlFor="rot13-shift" style={labelStyle}>{t.shiftLabel}: {shift}</label>
          <input
            id="rot13-shift"
            type="range"
            min="0"
            max="25"
            value={shift}
            disabled={variant !== 'caesar'}
            onChange={(e) => setShift(Number(e.target.value))}
            style={{ width: '100%', marginTop: 10 }}
          />
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '4px 0 0' }}>{t.shiftNote}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => loadSample(SAMPLE_ROT13, 'rot13', 13, 'decode')} style={btnStyle}>{t.sampleRot13}</button>
        <button type="button" onClick={() => loadSample(SAMPLE_SPOILER, 'rot13', 13, 'decode')} style={btnStyle}>{t.sampleSpoiler}</button>
        <button type="button" onClick={() => loadSample(SAMPLE_CAESAR3, 'caesar', 3, 'decode')} style={btnStyle}>{t.sampleCaesar}</button>
        <button type="button" onClick={() => loadSample(SAMPLE_CRACKER, 'caesar', 3, 'decode')} style={btnStyle}>{t.sampleCracker}</button>
        <button type="button" onClick={swap} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => { setInput(''); setCrackResults(null); }} style={btnStyle}>{t.clear}</button>
      </div>

      <label htmlFor="rot13-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="rot13-input"
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
            {input.length} {t.inChars} · {output.length} {t.outChars}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.crackerTitle}</h2>
        <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.crackerNote}</p>
        <button type="button" onClick={crack} disabled={!input} style={primaryBtnStyle}>{t.crackButton}</button>
        {crackResults && crackResults.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t.crackRank}</th>
                  <th style={thStyle}>{t.crackShift}</th>
                  <th style={thStyle}>{t.crackScore}</th>
                  <th style={thStyle}>{t.crackText}</th>
                  <th style={thStyle} />
                </tr>
              </thead>
              <tbody>
                {crackResults.map((r, i) => (
                  <tr key={r.shift}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{r.shift}</td>
                    <td style={tdStyle}>{r.score.toFixed(1)}</td>
                    <td style={tdStyle}>{r.text}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => applyCrack(r.text)} style={{ ...btnStyle, padding: '4px 10px', fontSize: '0.82rem' }}>{t.crackApply}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>{t.crackShort}</p>
          </div>
        )}
        {crackResults && crackResults.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.crackEmpty}</p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.wheelTitle}</h2>
        <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.wheelNote}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pairs.map((p) => (
            <span key={p.plain} style={{ ...btnStyle, cursor: 'default', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              {p.plain} {'<->'} {p.cipher}
            </span>
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '24px 0 8px' }}>{t.warnTitle}</h2>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.warnNote}</p>
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
