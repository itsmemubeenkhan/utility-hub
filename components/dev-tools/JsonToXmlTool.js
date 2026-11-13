'use client';
/* JSON to XML Converter: paste JSON, get well-formed XML. The
   conversion runs entirely in the browser with pure functions from
   lib/json-xml-utils.js: keys starting with @ become attributes,
   #text becomes element text, arrays repeat the item element, nulls
   follow the selected mode (empty element, omitted, or xsi:nil),
   text is escaped so the output is always well-formed, and keys
   that are not valid XML names are repaired with a warning. JSON
   errors are reported with the exact line and column. Supports
   .json file upload, copy, .xml download, swap, and live counts. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  convertJsonToXml, SAMPLE_JSON,
} from '@/lib/json-xml-utils';

const STR = {
  en: {
    inputLabel: 'JSON input',
    inputPlaceholder: 'Paste your JSON here, e.g. {"catalog": {"book": [{"@id": "bk101", "title": "XML Guide"}]}}...',
    outputLabel: 'XML output',
    sample: 'Sample JSON',
    upload: 'Upload .json file',
    swap: 'Swap',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download data.xml',
    empty: 'Your XML will appear here.',
    rootName: 'Root element',
    itemName: 'Array item element',
    indent: 'Indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    nullMode: 'Null values',
    nullEmpty: 'Empty element',
    nullOmit: 'Omit element',
    nullNil: 'xsi:nil',
    declaration: 'Include XML declaration',
    elements: 'elements',
    attributes: 'attributes',
    depth: 'max depth',
    chars: 'characters',
    lines: 'lines',
    invalid: 'Invalid JSON',
    line: 'Line',
    column: 'column',
    warnings: 'Notes',
    note: 'This converter turns JSON into well-formed XML: objects become elements, arrays repeat the item element, @keys become attributes, #text becomes element text, and nulls follow the mode you pick. Invalid keys are repaired automatically and listed below, and text is escaped so the output is always valid XML. Everything runs locally in your browser.',
    privacy:
      'Privacy: conversion runs locally in your browser. Your JSON is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/xml-formatter', label: 'XML Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/yaml-to-json-converter', label: 'YAML to JSON Converter' },
    ],
  },
  es: {
    inputLabel: 'Entrada JSON',
    inputPlaceholder: 'Pega tu JSON aquí, p. ej. {"catalogo": {"libro": [{"@id": "bk101", "titulo": "Guía XML"}]}}...',
    outputLabel: 'Salida XML',
    sample: 'JSON de ejemplo',
    upload: 'Subir archivo .json',
    swap: 'Intercambiar',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar datos.xml',
    empty: 'Tu XML aparecerá aquí.',
    rootName: 'Elemento raíz',
    itemName: 'Elemento de ítem de arreglo',
    indent: 'Sangría',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentTab: 'Tabulación',
    nullMode: 'Valores nulos',
    nullEmpty: 'Elemento vacío',
    nullOmit: 'Omitir elemento',
    nullNil: 'xsi:nil',
    declaration: 'Incluir declaración XML',
    elements: 'elementos',
    attributes: 'atributos',
    depth: 'profundidad máx.',
    chars: 'caracteres',
    lines: 'líneas',
    invalid: 'JSON no válido',
    line: 'Línea',
    column: 'columna',
    warnings: 'Notas',
    note: 'Este conversor convierte JSON en XML bien formado: los objetos se convierten en elementos, los arreglos repiten el elemento ítem, las claves @ se convierten en atributos, #text se convierte en texto del elemento, y los nulos siguen el modo que elijas. Las claves no válidas se reparan automáticamente y se listan abajo, y el texto se escapa para que la salida siempre sea XML válido. Todo corre localmente en tu navegador.',
    privacy:
      'Privacidad: la conversión corre localmente en tu navegador. Tu JSON nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/formateador-xml', label: 'Formateador XML' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/convertidor-de-yaml-a-json', label: 'Convertidor de YAML a JSON' },
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
const inputStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: '0.9rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};

export default function JsonToXmlTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({
    rootName: 'root',
    itemName: 'item',
    declaration: true,
    indent: '  ',
    nullMode: 'empty',
  });
  const fileRef = useRef(null);

  /* Conversion is synchronous and fast; recompute live as the user
     types or flips an option. */
  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convertJsonToXml(input, opts);
  }, [input, opts]);

  const output = result && result.ok ? result.xml : '';
  const stats = result && result.ok ? result.stats : null;

  const setOpt = (key, value) => setOpts((o) => ({ ...o, [key]: value }));

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
    const blob = new Blob([output], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.xml';
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
        <button type="button" onClick={() => setInput(SAMPLE_JSON)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => { if (output) setInput(output); }} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', marginBottom: 12, alignItems: 'flex-end' }}>
        <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {t.rootName}
          <input
            type="text"
            value={opts.rootName}
            onChange={(e) => setOpt('rootName', e.target.value)}
            style={{ ...inputStyle, width: 130 }}
          />
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {t.itemName}
          <input
            type="text"
            value={opts.itemName}
            onChange={(e) => setOpt('itemName', e.target.value)}
            style={{ ...inputStyle, width: 130 }}
          />
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {t.indent}
          <select value={opts.indent} onChange={(e) => setOpt('indent', e.target.value)} style={{ ...inputStyle, width: 130 }}>
            <option value="  ">{t.indent2}</option>
            <option value="    ">{t.indent4}</option>
            <option value={'\t'}>{t.indentTab}</option>
          </select>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {t.nullMode}
          <select value={opts.nullMode} onChange={(e) => setOpt('nullMode', e.target.value)} style={{ ...inputStyle, width: 150 }}>
            <option value="empty">{t.nullEmpty}</option>
            <option value="omit">{t.nullOmit}</option>
            <option value="nil">{t.nullNil}</option>
          </select>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', paddingBottom: 8 }}>
          <input type="checkbox" checked={opts.declaration} onChange={() => setOpt('declaration', !opts.declaration)} /> {t.declaration}
        </label>
      </div>

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      {result && !result.ok && result.error && (
        <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: 8 }}>
          {t.invalid}: {t.line} {result.error.line}, {t.column} {result.error.column} — {result.error.message}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {output ? (
          <pre style={preStyle}>{output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{t.empty}</p>
        )}
        {stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.elements}: {stats.elements}
            {' · ' + t.attributes + ': ' + stats.attributes}
            {' · ' + t.depth + ': ' + stats.depth}
            {' · ' + t.chars + ': ' + output.length}
            {' · ' + t.lines + ': ' + output.split('\n').length}
          </p>
        )}
        {result && result.ok && result.warnings && result.warnings.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t.warnings}</p>
            <ul style={{ color: '#92400e', fontSize: '0.85rem', margin: '0 0 0 18px', padding: 0 }}>
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
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
