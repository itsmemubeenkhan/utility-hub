'use client';
/* SQL Formatter: real formatting with the `sql-formatter` library, loaded
   lazily in the browser (dynamic import inside lib/sql-formatter-utils,
   never during SSR), with a string-aware single-line collapse for
   minify mode. Dialects, indent, keyword case and line-break options
   are real sql-formatter options. Parse errors show the library's own
   message and return no output. Everything runs in the browser; nothing
   is uploaded and no query is ever executed. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  DIALECTS, SAMPLE_SQL, countSql, formatSql,
} from '@/lib/sql-formatter-utils';

const STR = {
  en: {
    dialectLabel: 'Dialect',
    indentLabel: 'Indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    caseLabel: 'Keyword case',
    caseUpper: 'UPPERCASE',
    caseLower: 'lowercase',
    casePreserve: 'As typed',
    opLabel: 'AND / OR position',
    opAfter: 'After line break (default)',
    opBefore: 'Before line break',
    optMinify: 'Minify: collapse to one line',
    optSemi: 'Semicolon on its own line',
    inputLabel: 'SQL input',
    inputPlaceholder: 'Paste your SQL here, e.g. SELECT id, name FROM users WHERE active = 1 ORDER BY name;',
    outputLabel: 'Formatted SQL',
    sample: 'Sample SQL',
    upload: 'Upload .sql file',
    swap: 'Use output as input',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    download: 'Download formatted.sql',
    empty: 'Your formatted SQL will appear here.',
    chars: 'characters',
    lines: 'lines',
    change: 'change',
    longer: 'longer',
    shorter: 'shorter',
    working: 'Formatting...',
    errorTitle: 'Could not format: the SQL has a syntax error.',
    errorHint: 'Fix the error above and the output will appear. Nothing broken was returned, and your SQL is never run anywhere.',
    note: 'Formatting only changes whitespace and letter case: it never changes what the query does, and it never runs the query. Pick the dialect your database uses, because each one has its own keywords and functions, then copy the result into your editor or client.',
    privacy:
      'Privacy: formatting runs locally in your browser with the sql-formatter library. Your SQL is never uploaded, stored or seen by anyone else, so queries with real table names and values stay on your device.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/json-to-csv-converter', label: 'JSON to CSV Converter' },
      { href: '/tools/json-to-xml-converter', label: 'JSON to XML Converter' },
      { href: '/tools/yaml-to-json-converter', label: 'YAML to JSON Converter' },
      { href: '/tools/regex-tester', label: 'Regex Tester' },
    ],
  },
  es: {
    dialectLabel: 'Dialecto',
    indentLabel: 'Sangría',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentTab: 'Tabulación',
    caseLabel: 'Mayúsculas de palabras clave',
    caseUpper: 'MAYÚSCULAS',
    caseLower: 'minúsculas',
    casePreserve: 'Como se escribió',
    opLabel: 'Posición de AND / OR',
    opAfter: 'Después del salto de línea (predeterminado)',
    opBefore: 'Antes del salto de línea',
    optMinify: 'Minificar: colapsar a una línea',
    optSemi: 'Punto y coma en su propia línea',
    inputLabel: 'Entrada SQL',
    inputPlaceholder: 'Pega tu SQL aquí, p. ej. SELECT id, nombre FROM usuarios WHERE activo = 1 ORDER BY nombre;',
    outputLabel: 'SQL formateado',
    sample: 'SQL de ejemplo',
    upload: 'Subir archivo .sql',
    swap: 'Usar la salida como entrada',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    download: 'Descargar formateado.sql',
    empty: 'Tu SQL formateado aparecerá aquí.',
    chars: 'caracteres',
    lines: 'líneas',
    change: 'cambio',
    longer: 'más largo',
    shorter: 'más corto',
    working: 'Formateando...',
    errorTitle: 'No se pudo formatear: el SQL tiene un error de sintaxis.',
    errorHint: 'Corrige el error y aparecerá la salida. No se devolvió nada roto, y tu SQL nunca se ejecuta en ningún lugar.',
    note: 'Formatear solo cambia los espacios en blanco y las mayúsculas: nunca cambia lo que hace la consulta, y nunca ejecuta la consulta. Elige el dialecto de tu base de datos, porque cada uno tiene sus propias palabras clave y funciones, luego copia el resultado en tu editor o cliente.',
    privacy:
      'Privacidad: el formateo corre localmente en tu navegador con la librería sql-formatter. Tu SQL nunca se sube, se guarda ni lo ve nadie más, así que las consultas con nombres reales de tablas y valores se quedan en tu dispositivo.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/convertidor-de-json-a-csv', label: 'Convertidor de JSON a CSV' },
      { href: '/es/tools/convertidor-de-json-a-xml', label: 'Convertidor de JSON a XML' },
      { href: '/es/tools/convertidor-de-yaml-a-json', label: 'Convertidor de YAML a JSON' },
      { href: '/es/tools/probador-de-regex', label: 'Probador de Regex' },
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
const selectStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  fontSize: '0.9rem',
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
const errorStyle = {
  ...preStyle,
  background: '#fef2f2',
  borderColor: '#fca5a5',
  color: '#991b1b',
  minHeight: 0,
};

export default function SqlFormatterTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [dialect, setDialect] = useState('sql');
  const [indent, setIndent] = useState(2);
  const [keywordCase, setKeywordCase] = useState('upper');
  const [logicalOperatorNewline, setLogicalOperatorNewline] = useState('after');
  const [minify, setMinify] = useState(false);
  const [newlineBeforeSemicolon, setNewlineBeforeSemicolon] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const runId = useRef(0);

  useEffect(() => {
    if (!input.trim()) {
      runId.current += 1;
      setOutput('');
      setError('');
      setBusy(false);
      return;
    }
    const id = ++runId.current;
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const formatted = await formatSql(input, {
          dialect,
          indent,
          keywordCase,
          logicalOperatorNewline,
          newlineBeforeSemicolon,
          minify,
        });
        if (runId.current !== id) return;
        setOutput(formatted);
        setError('');
      } catch (e) {
        if (runId.current !== id) return;
        setOutput('');
        setError(e && e.message ? String(e.message) : String(e));
      } finally {
        if (runId.current === id) setBusy(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [input, dialect, indent, keywordCase, logicalOperatorNewline, newlineBeforeSemicolon, minify]);

  const stats = input.trim() && output ? countSql(input, output) : null;

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
    const blob = new Blob([output], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginBottom: 12 }}>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.dialectLabel}
          <select value={dialect} onChange={(e) => setDialect(e.target.value)} style={selectStyle}>
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.indentLabel}
          <select value={String(indent)} onChange={(e) => setIndent(e.target.value === 'tab' ? 'tab' : Number(e.target.value))} style={selectStyle}>
            <option value="2">{t.indent2}</option>
            <option value="4">{t.indent4}</option>
            <option value="tab">{t.indentTab}</option>
          </select>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.caseLabel}
          <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value)} style={selectStyle}>
            <option value="upper">{t.caseUpper}</option>
            <option value="lower">{t.caseLower}</option>
            <option value="preserve">{t.casePreserve}</option>
          </select>
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.opLabel}
          <select value={logicalOperatorNewline} onChange={(e) => setLogicalOperatorNewline(e.target.value)} style={selectStyle}>
            <option value="after">{t.opAfter}</option>
            <option value="before">{t.opBefore}</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 12 }}>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={minify} onChange={() => setMinify(!minify)} /> {t.optMinify}
        </label>
        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: minify ? 0.5 : 1 }}>
          <input type="checkbox" checked={newlineBeforeSemicolon} disabled={minify} onChange={() => setNewlineBeforeSemicolon(!newlineBeforeSemicolon)} /> {t.optSemi}
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setInput(SAMPLE_SQL)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => output && setInput(output)} disabled={!output} style={btnStyle}>{t.swap}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".sql,.txt,text/plain" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.inputPlaceholder}
        style={{ ...areaStyle, marginTop: 6 }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.outputLabel}</label>
        {error ? (
          <div>
            <p style={{ color: '#991b1b', fontWeight: 700, marginTop: 6, marginBottom: 0 }}>{t.errorTitle}</p>
            <pre style={errorStyle}>{error}</pre>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{t.errorHint}</p>
          </div>
        ) : output ? (
          <pre style={preStyle}>{output}</pre>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 6 }}>{busy ? t.working : t.empty}</p>
        )}
        {stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {stats.inputChars} → {stats.outputChars}
            {' · ' + t.lines + ': ' + stats.inputLines + ' → ' + stats.outputLines}
            {' · ' + Math.abs(stats.change) + '% ' + t.change + ' (' + (stats.change >= 0 ? t.longer : t.shorter) + ')'}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
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
