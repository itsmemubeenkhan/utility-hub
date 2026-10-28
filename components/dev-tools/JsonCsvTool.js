'use client';
/* JSON to CSV Converter (and back): paste JSON, get RFC 4180 CSV with
   flattened dot-notation columns; or paste CSV and get JSON. Everything
   runs in the browser; nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { extractRecords, jsonToCsv, parseCsv, detectDelimiter, csvToJson } from '@/lib/json-csv-utils';

const STR = {
  en: {
    modeJsonToCsv: 'JSON to CSV',
    modeCsvToJson: 'CSV to JSON',
    inputLabelJson: 'JSON input',
    inputPlaceholderJson: 'Paste a JSON array of objects, a single object, or a wrapped API response...',
    inputLabelCsv: 'CSV input',
    inputPlaceholderCsv: 'Paste CSV text, header row first...',
    delimiter: 'Delimiter',
    auto: 'Auto-detect',
    comma: 'Comma (,)',
    semicolon: 'Semicolon (;)',
    tab: 'Tab',
    pipe: 'Pipe (|)',
    headerRow: 'Include header row',
    firstRowHeader: 'First row is the header',
    inferTypes: 'Infer numbers and booleans',
    excelBom: 'UTF-8 BOM (Excel-safe download)',
    convert: 'Convert',
    sampleJson: 'Try a JSON example',
    sampleCsv: 'Try a CSV example',
    clear: 'Clear',
    copy: 'Copy result',
    copied: 'Copied!',
    downloadCsv: 'Download .csv',
    downloadJson: 'Download .json',
    empty: 'Your converted output will appear here. Paste input and press Convert.',
    errorPrefix: 'Could not convert: ',
    rows: 'rows',
    columns: 'columns',
    previewTitle: 'Preview (first 20 rows)',
    seeAlso: 'More developer tools',
    privacy: 'Privacy: conversion runs locally in your browser. Nothing you paste is uploaded or logged.',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/text-diff-checker', label: 'Text Diff Checker' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
    ],
  },
  es: {
    modeJsonToCsv: 'JSON a CSV',
    modeCsvToJson: 'CSV a JSON',
    inputLabelJson: 'Entrada JSON',
    inputPlaceholderJson: 'Pega un arreglo JSON de objetos, un solo objeto, o una respuesta de API envuelta...',
    inputLabelCsv: 'Entrada CSV',
    inputPlaceholderCsv: 'Pega texto CSV, con la fila de encabezados primero...',
    delimiter: 'Delimitador',
    auto: 'Detectar automáticamente',
    comma: 'Coma (,)',
    semicolon: 'Punto y coma (;)',
    tab: 'Tabulación',
    pipe: 'Barra vertical (|)',
    headerRow: 'Incluir fila de encabezados',
    firstRowHeader: 'La primera fila es el encabezado',
    inferTypes: 'Inferir números y booleanos',
    excelBom: 'BOM UTF-8 (descarga segura para Excel)',
    convert: 'Convertir',
    sampleJson: 'Probar un ejemplo JSON',
    sampleCsv: 'Probar un ejemplo CSV',
    clear: 'Limpiar',
    copy: 'Copiar resultado',
    copied: '¡Copiado!',
    downloadCsv: 'Descargar .csv',
    downloadJson: 'Descargar .json',
    empty: 'Tu salida convertida aparecerá aquí. Pega la entrada y pulsa Convertir.',
    errorPrefix: 'No se pudo convertir: ',
    rows: 'filas',
    columns: 'columnas',
    previewTitle: 'Vista previa (primeras 20 filas)',
    seeAlso: 'Más herramientas para desarrolladores',
    privacy: 'Privacidad: la conversión corre localmente en tu navegador. Nada de lo que pegas se sube ni se registra.',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/comparador-de-textos', label: 'Comparador de Textos' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
    ],
  },
};

const SAMPLE_JSON = '[\n  {\n    "id": 1,\n    "name": "Ana Torres",\n    "email": "ana@example.com",\n    "address": { "city": "Austin", "zip": "78701" },\n    "tags": ["vip", "newsletter"]\n  },\n  {\n    "id": 2,\n    "name": "Luis Vega",\n    "email": "luis@example.com",\n    "address": { "city": "Dallas", "zip": "75201" },\n    "tags": ["new"]\n  }\n]';
const SAMPLE_CSV = 'id,name,email,address.city,address.zip\n1,Ana Torres,ana@example.com,Austin,78701\n2,Luis Vega,luis@example.com,Dallas,75201';

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
  minHeight: 180,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};
const selectStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: '0.9rem',
  background: '#fff',
};

export default function JsonCsvTool({ lang }) {
  const s = STR[lang] || STR.en;
  const [mode, setMode] = useState('json2csv');
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState('auto');
  const [header, setHeader] = useState(true);
  const [infer, setInfer] = useState(true);
  const [bom, setBom] = useState(true);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = () => {
    setError('');
    setCopied(false);
    try {
      if (mode === 'json2csv') {
        const parsed = JSON.parse(input);
        const records = extractRecords(parsed);
        const delim = delimiter === 'auto' ? ',' : delimiter;
        const res = jsonToCsv(records, { delimiter: delim, header });
        setOutput(res.csv);
        setStats({ rows: res.rows, columns: res.columns, columnNames: res.columnNames });
      } else {
        const delim = delimiter === 'auto' ? detectDelimiter(input) : delimiter;
        const rows = parseCsv(input, delim);
        const res = csvToJson(rows, { header, inferTypes: infer });
        setOutput(JSON.stringify(res.records, null, 2));
        setStats({ rows: res.rows, columns: res.columns, columnNames: null });
      }
    } catch (e) {
      setOutput('');
      setStats(null);
      setError(e.message || String(e));
    }
  };

  const previewRows = useMemo(() => {
    if (mode !== 'json2csv' || !output) return null;
    const delim = delimiter === 'auto' ? ',' : delimiter;
    try {
      const rows = parseCsv(output, delim);
      return rows.slice(0, 21);
    } catch {
      return null;
    }
  }, [output, mode, delimiter]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const download = () => {
    const isCsv = mode === 'json2csv';
    const body = isCsv && bom ? '﻿' + output : output;
    const blob = new Blob([body], { type: isCsv ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isCsv ? 'converted.csv' : 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setMode('json2csv'); setOutput(''); setStats(null); setError(''); }} style={mode === 'json2csv' ? primaryBtnStyle : btnStyle}>{s.modeJsonToCsv}</button>
        <button type="button" onClick={() => { setMode('csv2json'); setOutput(''); setStats(null); setError(''); }} style={mode === 'csv2json' ? primaryBtnStyle : btnStyle}>{s.modeCsvToJson}</button>
      </div>

      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{mode === 'json2csv' ? s.inputLabelJson : s.inputLabelCsv}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'json2csv' ? s.inputPlaceholderJson : s.inputPlaceholderCsv}
        style={areaStyle}
        spellCheck={false}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {s.delimiter}{' '}
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={selectStyle}>
            <option value="auto">{s.auto}</option>
            <option value=",">{s.comma}</option>
            <option value=";">{s.semicolon}</option>
            <option value={'\t'}>{s.tab}</option>
            <option value="|">{s.pipe}</option>
          </select>
        </label>
        {mode === 'json2csv' ? (
          <>
            <label style={{ fontSize: '0.9rem' }}><input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} /> {s.headerRow}</label>
            <label style={{ fontSize: '0.9rem' }}><input type="checkbox" checked={bom} onChange={(e) => setBom(e.target.checked)} /> {s.excelBom}</label>
          </>
        ) : (
          <>
            <label style={{ fontSize: '0.9rem' }}><input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} /> {s.firstRowHeader}</label>
            <label style={{ fontSize: '0.9rem' }}><input type="checkbox" checked={infer} onChange={(e) => setInfer(e.target.checked)} /> {s.inferTypes}</label>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" onClick={run} style={primaryBtnStyle}>{s.convert}</button>
        <button type="button" onClick={() => setInput(mode === 'json2csv' ? SAMPLE_JSON : SAMPLE_CSV)} style={btnStyle}>{mode === 'json2csv' ? s.sampleJson : s.sampleCsv}</button>
        <button type="button" onClick={() => { setInput(''); setOutput(''); setStats(null); setError(''); }} style={btnStyle}>{s.clear}</button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12, marginBottom: 16, color: '#991b1b' }}>
          {s.errorPrefix}{error}
        </div>
      )}

      {stats && (
        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: '0.95rem' }}>
          <strong>{stats.rows} {s.rows}</strong> · <strong>{stats.columns} {s.columns}</strong>
          {stats.columnNames && <span style={{ color: '#475569' }}> — {stats.columnNames.join(', ')}</span>}
        </div>
      )}

      {output ? (
        <div>
          <textarea value={output} readOnly style={{ ...areaStyle, minHeight: 180, background: '#f8fafc' }} spellCheck={false} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <button type="button" onClick={copyResult} style={btnStyle}>{copied ? s.copied : s.copy}</button>
            <button type="button" onClick={download} style={btnStyle}>{mode === 'json2csv' ? s.downloadCsv : s.downloadJson}</button>
          </div>
          {previewRows && previewRows.length > 1 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '1.05rem' }}>{s.previewTitle}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.85rem', width: '100%' }}>
                  <tbody>
                    {previewRows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          ri === 0 ? (
                            <th key={ci} style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'left', background: '#f1f5f9' }}>{c}</th>
                          ) : (
                            <td key={ci} style={{ border: '1px solid #e2e8f0', padding: '6px 8px', whiteSpace: 'nowrap' }}>{c}</td>
                          )
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        !error && <p style={{ color: '#64748b' }}>{s.empty}</p>
      )}

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 20 }}>{s.privacy}</p>
      <p style={{ fontWeight: 600, marginTop: 16 }}>{s.seeAlso}:</p>
      <ul>
        {s.siblings.map((l) => (
          <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
