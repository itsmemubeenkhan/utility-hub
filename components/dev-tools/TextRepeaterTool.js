'use client';
/* Text Repeater: repeat any text 1 to 10,000 times with a separator,
   optional numbering and an optional trailing separator. Repetition is
   grapheme-cluster safe via Intl.Segmenter, so emoji, flags and skin-tone
   modifiers never split in half. Live counts, exact output-size math,
   copy and .txt download. Output is capped at 500,000 characters: when a
   request exceeds the cap, whole copies are produced up to the cap and the
   tool says exactly how many were made. 100% in your browser, nothing is
   uploaded. Do not paste repeated walls into real chats: platforms flag
   that as spam. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  repeatText,
  measureText,
  outputSizeMath,
  clampCount,
  MAX_REPEAT_COUNT,
  MAX_OUTPUT_CHARS,
  SAMPLE_TEXT,
} from '@/lib/text-repeater-utils';

const STR = {
  en: {
    inputTitle: 'Text to repeat',
    inputLabel: 'Your text',
    inputPlaceholder: 'Type or paste your text here... emoji welcome 🎉',
    countLabel: 'Repeat count (1 to 10,000)',
    countHint: 'Quick presets:',
    sepLabel: 'Separator between copies',
    sepNone: 'None',
    sepSpace: 'Space',
    sepNewline: 'New line',
    sepComma: 'Comma',
    sepCustom: 'Custom',
    customLabel: 'Custom separator',
    customPlaceholder: 'e.g.  |  or  -  or  • ',
    numberLabel: 'Number each copy (1. 2. 3.)',
    trailingLabel: 'Trailing separator after the last copy',
    outputTitle: 'Repeated text',
    inputCounts: 'Input: {graphemes} graphemes · {chars} chars · {words} words · {lines} lines · {bytes} bytes',
    outputCounts: 'Output: {graphemes} graphemes · {chars} chars · {words} words · {lines} lines · {bytes} bytes',
    sizeMath: 'Size math: {formula}',
    cappedNote: 'Output cap reached: produced {produced} of {requested} requested copies (500,000 character cap). Shorten the text or lower the count to get them all.',
    emptyOutput: 'Type some text above and the repeated result appears here live.',
    sample: 'Sample',
    swap: 'Repeat the output',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    download: 'Download .txt',
    spamNote: 'Please do not paste repeated walls of text into real chats or comment boxes: messaging platforms flag that as spam and can restrict your account. This tool is for test data, repeated patterns, placeholders and drafts.',
    privacy: 'Privacy: repetition, counting and downloads run locally in your browser. Nothing you type is uploaded, stored or seen by anyone else.',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/case-converter', label: 'Case Converter' },
      { href: '/tools/word-counter', label: 'Word Counter' },
      { href: '/tools/character-counter', label: 'Character Counter' },
      { href: '/tools/remove-duplicate-lines', label: 'Remove Duplicate Lines' },
    ],
  },
  es: {
    inputTitle: 'Texto a repetir',
    inputLabel: 'Tu texto',
    inputPlaceholder: 'Escribe o pega tu texto aquí... los emoji son bienvenidos 🎉',
    countLabel: 'Cantidad de repeticiones (1 a 10.000)',
    countHint: 'Ajustes rápidos:',
    sepLabel: 'Separador entre copias',
    sepNone: 'Ninguno',
    sepSpace: 'Espacio',
    sepNewline: 'Línea nueva',
    sepComma: 'Coma',
    sepCustom: 'Personalizado',
    customLabel: 'Separador personalizado',
    customPlaceholder: 'p. ej.  |  o  -  o  • ',
    numberLabel: 'Numerar cada copia (1. 2. 3.)',
    trailingLabel: 'Separador final después de la última copia',
    outputTitle: 'Texto repetido',
    inputCounts: 'Entrada: {graphemes} grafemas · {chars} caracteres · {words} palabras · {lines} líneas · {bytes} bytes',
    outputCounts: 'Salida: {graphemes} grafemas · {chars} caracteres · {words} palabras · {lines} líneas · {bytes} bytes',
    sizeMath: 'Cálculo de tamaño: {formula}',
    cappedNote: 'Límite de salida alcanzado: se produjeron {produced} de {requested} copias pedidas (límite de 500.000 caracteres). Acorta el texto o baja el conteo para obtenerlas todas.',
    emptyOutput: 'Escribe un texto arriba y el resultado repetido aparece aquí en vivo.',
    sample: 'Ejemplo',
    swap: 'Repetir la salida',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    download: 'Descargar .txt',
    spamNote: 'Por favor no pegues muros de texto repetido en chats reales ni en cajas de comentarios: las plataformas de mensajería lo marcan como spam y pueden restringir tu cuenta. Esta herramienta es para datos de prueba, patrones repetidos, marcadores de posición y borradores.',
    privacy: 'Privacidad: la repetición, el conteo y las descargas corren localmente en tu navegador. Nada de lo que escribes se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de Mayúsculas' },
      { href: '/es/tools/contador-de-palabras', label: 'Contador de Palabras' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de Caracteres' },
      { href: '/es/tools/eliminar-lineas-duplicadas', label: 'Eliminar Líneas Duplicadas' },
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
  minHeight: 110,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const selectStyle = { ...inputStyle, fontFamily: 'inherit' };

function fill(template, values) {
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.replace('{' + k + '}', String(v)),
    template
  );
}

export default function TextRepeaterTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [countRaw, setCountRaw] = useState('10');
  const [separator, setSeparator] = useState('space');
  const [customSeparator, setCustomSeparator] = useState('');
  const [numberEach, setNumberEach] = useState(false);
  const [trailingSeparator, setTrailingSeparator] = useState(false);
  const [copied, setCopied] = useState(false);

  const count = clampCount(countRaw);
  const result = useMemo(
    () => repeatText({ text: input, count, separator, customSeparator, numberEach, trailingSeparator }),
    [input, count, separator, customSeparator, numberEach, trailingSeparator]
  );
  const inputStats = useMemo(() => measureText(input), [input]);
  const outputStats = useMemo(() => measureText(result.output), [result.output]);
  const sizeMath = useMemo(
    () => outputSizeMath(input, count, separator, customSeparator, numberEach),
    [input, count, separator, customSeparator, numberEach]
  );

  const copyResult = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadResult = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repeated-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.inputTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_TEXT)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => setInput(result.output)} disabled={!result.output} style={btnStyle}>{t.swap}</button>
        <button
          type="button"
          onClick={() => { setInput(''); setCountRaw('10'); setSeparator('space'); setCustomSeparator(''); setNumberEach(false); setTrailingSeparator(false); }}
          style={btnStyle}
        >
          {t.clear}
        </button>
      </div>
      <label htmlFor="text-repeater-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="text-repeater-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />
      <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 8 }}>
        {fill(t.inputCounts, inputStats)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
        <div>
          <label htmlFor="text-repeater-count" style={labelStyle}>{t.countLabel}</label>
          <input
            id="text-repeater-count"
            type="number"
            min="1"
            max={MAX_REPEAT_COUNT}
            value={countRaw}
            onChange={(e) => setCountRaw(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
          />
          <p style={{ color: '#374151', fontSize: '0.9rem', marginTop: 8 }}>
            {t.countHint}{' '}
            {[10, 100, 1000, 10000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCountRaw(String(preset))}
                style={{ ...btnStyle, padding: '4px 10px', marginRight: 6 }}
              >
                {preset.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}
              </button>
            ))}
          </p>
        </div>
        <div>
          <label htmlFor="text-repeater-separator" style={labelStyle}>{t.sepLabel}</label>
          <select
            id="text-repeater-separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            style={{ ...selectStyle, marginTop: 6 }}
          >
            <option value="none">{t.sepNone}</option>
            <option value="space">{t.sepSpace}</option>
            <option value="newline">{t.sepNewline}</option>
            <option value="comma">{t.sepComma}</option>
            <option value="custom">{t.sepCustom}</option>
          </select>
          {separator === 'custom' && (
            <input
              aria-label={t.customLabel}
              value={customSeparator}
              onChange={(e) => setCustomSeparator(e.target.value)}
              placeholder={t.customPlaceholder}
              style={{ ...inputStyle, marginTop: 8 }}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={numberEach} onChange={(e) => setNumberEach(e.target.checked)} />
          {t.numberLabel}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={trailingSeparator} onChange={(e) => setTrailingSeparator(e.target.checked)} />
          {t.trailingLabel}
        </label>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.outputTitle}</h2>
        {result.output ? (
          <div>
            <textarea value={result.output} readOnly style={{ ...areaStyle, minHeight: 160 }} aria-label={t.outputTitle} />
            <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 8 }}>
              {fill(t.outputCounts, outputStats)}
            </p>
            <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 4 }}>
              {fill(t.sizeMath, { formula: sizeMath.formula })}
            </p>
            {result.capped && (
              <p style={{ color: '#b45309', fontSize: '0.95rem', fontWeight: 600, marginTop: 4 }}>
                {fill(t.cappedNote, { produced: result.copiesProduced.toLocaleString('en-US'), requested: result.requestedCopies.toLocaleString('en-US') })}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={copyResult} style={primaryBtnStyle}>{copied ? t.copied : t.copy}</button>
              <button type="button" onClick={downloadResult} style={btnStyle}>{t.download}</button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 12 }}>{t.emptyOutput}</p>
        )}
      </div>

      <p style={{ color: '#92400e', fontSize: '0.9rem', marginTop: 24 }}>⚠️ {t.spamNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 8 }}>🔒 {t.privacy}</p>

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
