'use client';
/* YAML to JSON Converter: two-way conversion with live results.
   YAML -> JSON (2/4-space or minified indent, multi-document files become
   JSON arrays) and JSON -> YAML (readable block style). Anchors and aliases
   expand, errors report exact line and column. Everything runs in the
   browser; nothing is uploaded. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  yamlToJson, jsonToYaml, countYaml,
  SAMPLE_YAML_K8S, SAMPLE_YAML_COMPOSE, SAMPLE_JSON,
} from '@/lib/yaml-utils';

const STR = {
  en: {
    dirYamlToJson: 'YAML to JSON',
    dirJsonToYaml: 'JSON to YAML',
    indentLabel: 'JSON indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentMin: 'Minified',
    inputLabelYaml: 'YAML input',
    inputLabelJson: 'JSON input',
    inputPlaceholderYaml: 'Paste your YAML here, e.g.\nname: web\nreplicas: 3\nports:\n  - 80',
    inputPlaceholderJson: 'Paste your JSON here, e.g.\n{\n  "name": "web",\n  "replicas": 3\n}',
    outputLabel: 'Output',
    sampleK8s: 'Sample: Kubernetes',
    sampleCompose: 'Sample: Docker Compose',
    sampleJson: 'Sample JSON',
    upload: 'Upload file',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    downloadJson: 'Download .json',
    downloadYaml: 'Download .yaml',
    empty: 'Your result will appear here.',
    invalid: 'Could not convert',
    line: 'Line',
    column: 'column',
    documents: 'documents',
    keys: 'keys',
    lines: 'lines',
    outChars: 'output characters',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/xml-formatter', label: 'XML Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
    ],
    privacy:
      'Privacy: conversion runs locally in your browser. Your YAML and JSON are never uploaded, stored or seen by anyone else, so config files with internal hostnames or credentials stay on your device.',
  },
  es: {
    dirYamlToJson: 'YAML a JSON',
    dirJsonToYaml: 'JSON a YAML',
    indentLabel: 'Sangría JSON',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentMin: 'Minificado',
    inputLabelYaml: 'Entrada YAML',
    inputLabelJson: 'Entrada JSON',
    inputPlaceholderYaml: 'Pega tu YAML aquí, p. ej.\nname: web\nreplicas: 3\nports:\n  - 80',
    inputPlaceholderJson: 'Pega tu JSON aquí, p. ej.\n{\n  "name": "web",\n  "replicas": 3\n}',
    outputLabel: 'Salida',
    sampleK8s: 'Ejemplo: Kubernetes',
    sampleCompose: 'Ejemplo: Docker Compose',
    sampleJson: 'JSON de ejemplo',
    upload: 'Subir archivo',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    downloadJson: 'Descargar .json',
    downloadYaml: 'Descargar .yaml',
    empty: 'Tu resultado aparecerá aquí.',
    invalid: 'No se pudo convertir',
    line: 'Línea',
    column: 'columna',
    documents: 'documentos',
    keys: 'claves',
    lines: 'líneas',
    outChars: 'caracteres de salida',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/formateador-xml', label: 'Formateador XML' },
      { href: '/es/tools/codificador-base64', label: 'Codificador y Decodificador Base64' },
    ],
    privacy:
      'Privacidad: la conversión corre localmente en tu navegador. Tu YAML y tu JSON nunca se suben, se guardan ni los ve nadie más, así que los archivos de configuración con nombres de host internos o credenciales se quedan en tu dispositivo.',
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
  minHeight: 160,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const preStyle = {
  ...areaStyle,
  minHeight: 160,
  marginTop: 6,
  background: '#f9fafb',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

export default function YamlTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [direction, setDirection] = useState('yaml2json');
  const [indent, setIndent] = useState(2);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null, stats: null, isJson: direction === 'yaml2json' };
    if (direction === 'json2yaml') {
      const r = jsonToYaml(input);
      if (!r.ok) return { output: '', error: r.error, stats: null, isJson: false };
      return { output: r.output, error: null, stats: null, isJson: false };
    }
    const r = yamlToJson(input, indent);
    if (!r.ok) return { output: '', error: r.error, stats: null, isJson: true };
    return { output: r.output, error: null, stats: countYaml(input), isJson: true };
  }, [input, direction, indent]);

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
    const ext = result.isJson ? 'json' : 'yaml';
    const blob = new Blob([result.output], { type: result.isJson ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (result.isJson ? 'yaml-output.' : 'json-output.') + ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      if (/\.json$/i.test(file.name)) setDirection('json2yaml');
      else setDirection('yaml2json');
      setInput(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const errorText = result.error
    ? result.error.message +
      ' (' + t.line + ' ' + result.error.line + ', ' + t.column + ' ' + result.error.column + ')'
    : null;

  const inputLines = input ? input.split('\n').length : 0;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setDirection('yaml2json')} style={direction === 'yaml2json' ? primaryBtnStyle : btnStyle}>{t.dirYamlToJson}</button>
        <button type="button" onClick={() => setDirection('json2yaml')} style={direction === 'json2yaml' ? primaryBtnStyle : btnStyle}>{t.dirJsonToYaml}</button>
        <button type="button" onClick={() => { setDirection('yaml2json'); setInput(SAMPLE_YAML_K8S); }} style={btnStyle}>{t.sampleK8s}</button>
        <button type="button" onClick={() => { setDirection('yaml2json'); setInput(SAMPLE_YAML_COMPOSE); }} style={btnStyle}>{t.sampleCompose}</button>
        <button type="button" onClick={() => { setDirection('json2yaml'); setInput(SAMPLE_JSON); }} style={btnStyle}>{t.sampleJson}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".yaml,.yml,.json,text/yaml,application/json" onChange={onFile} style={{ display: 'none' }} />
      </div>

      {direction === 'yaml2json' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.indentLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setIndent(2)} style={indent === 2 ? primaryBtnStyle : btnStyle}>{t.indent2}</button>
            <button type="button" onClick={() => setIndent(4)} style={indent === 4 ? primaryBtnStyle : btnStyle}>{t.indent4}</button>
            <button type="button" onClick={() => setIndent(0)} style={indent === 0 ? primaryBtnStyle : btnStyle}>{t.indentMin}</button>
          </div>
        </div>
      )}

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{direction === 'yaml2json' ? t.inputLabelYaml : t.inputLabelJson}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={direction === 'yaml2json' ? t.inputPlaceholderYaml : t.inputPlaceholderJson}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
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
        {input && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.lines}: {inputLines}
            {result.stats ? ' · ' + t.documents + ': ' + result.stats.documents + ' · ' + t.keys + ': ' + result.stats.keys : ''}
            {result.output ? ' · ' + t.outChars + ': ' + result.output.length : ''}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!result.output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!result.output} style={btnStyle}>{result.isJson ? t.downloadJson : t.downloadYaml}</button>
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
