'use client';
/* JSON to YAML Converter: paste JSON or upload a .json file and get live
   YAML, with control over indent (2 or 4 spaces), alphabetical key
   sorting, and block versus flow style. JSON parse errors report the exact
   line and column V8 gives. Strings YAML would misread ("yes", "on",
   "123", "a: b") are quoted automatically so values survive a round
   trip. 100% in your browser, nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { jsonToYaml, countJson, yamlToJsonString, SAMPLE_JSON } from '@/lib/json-yaml-utils';

const STR = {
  en: {
    optionsTitle: 'Conversion options',
    indentLabel: 'YAML indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    styleLabel: 'YAML style',
    styleBlock: 'Block style',
    styleFlow: 'Flow style',
    sortLabel: 'Sort keys alphabetically',
    inputLabel: 'JSON input',
    inputPlaceholder: 'Paste your JSON here, e.g. {"name": "my-app", "enabled": true, "limits": {"requests": 1000}}...',
    outputLabel: 'YAML output',
    sample: 'Sample JSON',
    upload: 'Upload .json file',
    swap: 'Swap (YAML back to JSON)',
    clear: 'Clear',
    copy: 'Copy YAML',
    copied: 'Copied!',
    download: 'Download .yaml',
    empty: 'Your YAML will appear here.',
    invalid: 'Invalid JSON',
    line: 'Line',
    column: 'column',
    chars: 'characters',
    keys: 'keys',
    lines: 'lines',
    outChars: 'output characters',
    howTitle: 'How does JSON become YAML?',
    howNote: 'Every JSON object becomes a YAML mapping and every array becomes a dash list, with nested values indented under their keys. Strings stay bare when they are safe, and js-yaml quotes the ones YAML would misread: yes, no, on, off, 123 and a: b all get quotes, so a string stays a string and a number stays a number when the file is read back. Block style is the readable default, one key per line, while flow style writes the whole value on one line with braces and brackets, which is handy for short values pasted into a script or a chat message.',
    quotingNote: 'Quoting rule: a value is quoted only when YAML would read it as something else. yes and on look like booleans to old YAML 1.1 parsers, 123 looks like a number, and a: b looks like a nested mapping, so all four are quoted. Plain words like my-app or Ada need no quotes and stay bare.',
    privacy: 'Privacy: parsing and conversion run locally in your browser. Your JSON is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/yaml-to-json-converter', label: 'YAML to JSON Converter' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/json-to-xml-converter', label: 'JSON to XML Converter' },
    ],
  },
  es: {
    optionsTitle: 'Opciones de conversión',
    indentLabel: 'Sangría YAML',
    indent2: '2 espacios',
    indent4: '4 espacios',
    styleLabel: 'Estilo YAML',
    styleBlock: 'Estilo de bloque',
    styleFlow: 'Estilo de flujo',
    sortLabel: 'Ordenar claves alfabéticamente',
    inputLabel: 'Entrada JSON',
    inputPlaceholder: 'Pega tu JSON aquí, p. ej. {"name": "my-app", "enabled": true, "limits": {"requests": 1000}}...',
    outputLabel: 'Salida YAML',
    sample: 'JSON de ejemplo',
    upload: 'Subir archivo .json',
    swap: 'Intercambiar (YAML a JSON)',
    clear: 'Limpiar',
    copy: 'Copiar YAML',
    copied: '¡Copiado!',
    download: 'Descargar .yaml',
    empty: 'Tu YAML aparecerá aquí.',
    invalid: 'JSON inválido',
    line: 'Línea',
    column: 'columna',
    chars: 'caracteres',
    keys: 'claves',
    lines: 'líneas',
    outChars: 'caracteres de salida',
    howTitle: '¿Cómo se convierte JSON a YAML?',
    howNote: 'Cada objeto JSON se convierte en un mapa YAML y cada arreglo en una lista con guiones, con los valores anidados con sangría bajo sus claves. Las cadenas quedan sin comillas cuando son seguras, y js-yaml entrecomilla las que YAML leería mal: yes, no, on, off, 123 y a: b llevan comillas, así una cadena sigue siendo cadena y un número sigue siendo número cuando se lee el archivo de nuevo. El estilo de bloque es el predeterminado y legible, una clave por línea, mientras el estilo de flujo escribe todo el valor en una línea con llaves y corchetes, útil para valores cortos que se pegan en un script o en un mensaje de chat.',
    quotingNote: 'Regla de comillas: un valor se entrecomilla solo cuando YAML lo leería como otra cosa. yes y on parecen booleanos para los analizadores YAML 1.1 antiguos, 123 parece un número, y a: b parece un mapa anidado, así que los cuatro llevan comillas. Las palabras simples como my-app o Ada no necesitan comillas y quedan sin ellas.',
    privacy: 'Privacidad: el análisis y la conversión corren localmente en tu navegador. Tu JSON nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/convertidor-de-yaml-a-json', label: 'Convertidor de YAML a JSON' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/convertidor-de-json-a-xml', label: 'Convertidor de JSON a XML' },
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
  minHeight: 180,
  marginTop: 6,
  background: '#0f172a',
  color: '#e2e8f0',
  whiteSpace: 'pre',
  overflowX: 'auto',
};
const checkRowStyle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' };

export default function JsonToYamlTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [flow, setFlow] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { yaml: '', error: null, counts: null };
    const r = jsonToYaml(input, { indent, sortKeys, flow });
    if (!r.ok) return { yaml: '', error: r.error, counts: null };
    return { yaml: r.output, error: null, counts: countJson(input) };
  }, [input, indent, sortKeys, flow]);

  const copy = async () => {
    if (!result.yaml) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!result.yaml) return;
    const blob = new Blob([result.yaml + '\n'], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.yaml';
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

  const swap = () => {
    if (!result.yaml) return;
    const back = yamlToJsonString(result.yaml, indent);
    if (back !== null) setInput(back);
  };

  const errorText = result.error
    ? result.error.message + ' (' + t.line + ' ' + result.error.line + ', ' + t.column + ' ' + result.error.column + ')'
    : null;

  return (
    <div>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>{t.optionsTitle}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t.indentLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setIndent(2)} style={indent === 2 ? primaryBtnStyle : btnStyle}>{t.indent2}</button>
            <button type="button" onClick={() => setIndent(4)} style={indent === 4 ? primaryBtnStyle : btnStyle}>{t.indent4}</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t.styleLabel}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setFlow(false)} style={!flow ? primaryBtnStyle : btnStyle}>{t.styleBlock}</button>
            <button type="button" onClick={() => setFlow(true)} style={flow ? primaryBtnStyle : btnStyle}>{t.styleFlow}</button>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <label style={checkRowStyle}>
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
          {t.sortLabel}
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_JSON)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={swap} disabled={!result.yaml} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".json,application/json,text/plain" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <label htmlFor="jsontoyaml-input" style={labelStyle}>{t.inputLabel}</label>
      <textarea
        id="jsontoyaml-input"
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
        ) : result.yaml ? (
          <pre style={preStyle}>{result.yaml}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {result.counts && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {result.counts.chars} · {t.keys}: {result.counts.keys} · {t.lines}: {result.counts.lines}
            {result.yaml ? ' · ' + t.outChars + ': ' + result.yaml.length : ''}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.yaml} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.yaml} style={btnStyle}>{t.download}</button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', margin: '24px 0 8px' }}>{t.howTitle}</h2>
      <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.7, margin: '0 0 12px' }}>{t.howNote}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>{t.quotingNote}</p>
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
