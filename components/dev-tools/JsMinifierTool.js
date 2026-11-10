'use client';
/* JavaScript Minifier & Beautifier: real parser-based minification with
   Terser (loaded lazily in the browser, never during SSR), with a safe
   string-aware scanner as fallback if Terser cannot load. Terser mangles
   local names, folds constants and drops dead code; the safe fallback
   only strips comments and whitespace and never renames anything.
   Parse errors show Terser's own message and never produce output.
   Everything runs in the browser; nothing is uploaded. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  minifyJsSafe, beautifyJsSafe, countJs, savedPercent, SAMPLE_JS,
} from '@/lib/js-minifier-utils';

const STR = {
  en: {
    modeMinify: 'Minify',
    modeBeautify: 'Beautify',
    inputLabel: 'JavaScript input',
    inputPlaceholder: 'Paste your JavaScript here, e.g. function greet(name) { console.log("Hello, " + name); }...',
    outputLabel: 'Output',
    sample: 'Sample JS',
    upload: 'Upload .js file',
    clear: 'Clear',
    copy: 'Copy output',
    copied: 'Copied!',
    downloadMin: 'Download script.min.js',
    downloadPretty: 'Download script.js',
    empty: 'Your result will appear here.',
    chars: 'characters',
    bytes: 'bytes',
    lines: 'lines',
    statements: 'statements',
    functions: 'functions',
    comments: 'comments',
    saved: 'saved',
    working: 'Minifying...',
    optMangle: 'Mangle names (shorten local variable names)',
    optCompress: 'Compress (dead-code removal, constant folding)',
    optConsole: 'Drop console calls',
    optLicense: 'Keep /*! license comments',
    engineTerser: 'Engine: Terser (real parser-based minification)',
    engineSafe: 'Safe mode: Terser could not load, using the built-in scanner. No variable renaming; for production bundles use Terser or your bundler.',
    errorTitle: 'Could not minify: the code has a syntax error.',
    errorHint: 'Fix the error above and the output will appear. Nothing broken was returned.',
    note: 'Minifying shrinks a script by removing comments and whitespace, shortening local names and folding constants, so the file downloads sooner and parses faster. The code still runs exactly the same. Terser parses your code into a real syntax tree first, so it never breaks a string, a template literal or a regex.',
    privacy:
      'Privacy: minifying and beautifying run locally in your browser. Your code is never uploaded, stored or seen by anyone else.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/css-minifier', label: 'CSS Minifier' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/html-entities-encoder-decoder', label: 'HTML Entities Encoder' },
      { href: '/tools/regex-tester', label: 'Regex Tester' },
    ],
  },
  es: {
    modeMinify: 'Minificar',
    modeBeautify: 'Embellecer',
    inputLabel: 'Entrada JavaScript',
    inputPlaceholder: 'Pega tu JavaScript aquí, p. ej. function saludar(nombre) { console.log("Hola, " + nombre); }...',
    outputLabel: 'Salida',
    sample: 'JS de ejemplo',
    upload: 'Subir archivo .js',
    clear: 'Limpiar',
    copy: 'Copiar salida',
    copied: '¡Copiado!',
    downloadMin: 'Descargar script.min.js',
    downloadPretty: 'Descargar script.js',
    empty: 'Tu resultado aparecerá aquí.',
    chars: 'caracteres',
    bytes: 'bytes',
    lines: 'líneas',
    statements: 'sentencias',
    functions: 'funciones',
    comments: 'comentarios',
    saved: 'ahorrado',
    working: 'Minificando...',
    optMangle: 'Acortar nombres (renombrar variables locales)',
    optCompress: 'Comprimir (quitar código muerto, plegar constantes)',
    optConsole: 'Quitar llamadas a console',
    optLicense: 'Conservar comentarios de licencia /*!',
    engineTerser: 'Motor: Terser (minificación real basada en el parser)',
    engineSafe: 'Modo seguro: Terser no pudo cargar y se usa el escáner integrado. Sin renombrar variables; para paquetes de producción usa Terser o tu bundler.',
    errorTitle: 'No se pudo minificar: el código tiene un error de sintaxis.',
    errorHint: 'Corrige el error y aparecerá la salida. No se devolvió nada roto.',
    note: 'Minificar reduce un script quitando comentarios y espacios, acortando nombres locales y plegando constantes, así el archivo se descarga antes y se analiza más rápido. El código sigue funcionando exactamente igual. Terser primero convierte tu código en un árbol de sintaxis real, así nunca rompe una cadena, un template literal o una expresión regular.',
    privacy:
      'Privacidad: la minificación y el embellecimiento corren localmente en tu navegador. Tu código nunca se sube, se guarda ni lo ve nadie más.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/minificador-de-css', label: 'Minificador de CSS' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-de-entidades-html', label: 'Codificador de Entidades HTML' },
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

async function runTerser(input, mode, opts) {
  const { minify } = await import('terser');
  const base = { ecma: 2020 };
  if (mode === 'beautify') {
    const res = await minify(input, {
      ...base, compress: false, mangle: false,
      format: { beautify: true, indent_level: 2, comments: true },
    });
    if (res.error) throw res.error;
    return res.code;
  }
  const options = {
    ...base,
    compress: opts.compress ? { drop_console: opts.dropConsole } : false,
    mangle: opts.mangle,
    format: { comments: opts.keepLicense ? /^!/ : false },
  };
  try {
    const res = await minify(input, options);
    if (res.error) throw res.error;
    return res.code;
  } catch (e) {
    /* ES module syntax (import / export) needs the module flag. */
    if (/import|export|module/i.test(e.message || '')) {
      const res = await minify(input, { ...options, module: true });
      if (res.error) throw res.error;
      return res.code;
    }
    throw e;
  }
}

export default function JsMinifierTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('minify');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [engine, setEngine] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({
    mangle: true,
    compress: true,
    dropConsole: false,
    keepLicense: true,
  });
  const fileRef = useRef(null);
  const runId = useRef(0);

  useEffect(() => {
    if (!input.trim()) {
      runId.current += 1;
      setOutput('');
      setError('');
      setEngine(null);
      setBusy(false);
      return;
    }
    const id = ++runId.current;
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const code = await runTerser(input, mode, opts);
        if (runId.current !== id) return;
        setOutput(code);
        setError('');
        setEngine('terser');
      } catch (e) {
        if (runId.current !== id) return;
        const message = e && e.message ? String(e.message) : String(e);
        /* A parse error is the code's fault, not the engine's: show it
           and return nothing. Only a failed Terser load falls back. */
        if (/failed to fetch|loading chunk|ChunkLoadError|Cannot find module|Failed to load/i.test(message)) {
          try {
            const fallback = mode === 'minify'
              ? minifyJsSafe(input, { keepImportant: opts.keepLicense })
              : beautifyJsSafe(input);
            setOutput(fallback);
            setError('');
            setEngine('safe');
          } catch {
            setOutput('');
            setError(message);
            setEngine(null);
          }
        } else {
          setOutput('');
          setError(message);
          setEngine(null);
        }
      } finally {
        if (runId.current === id) setBusy(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [input, mode, opts]);

  const stats = input.trim() ? countJs(input) : null;
  const saved = mode === 'minify' && output ? savedPercent(input, output) : null;

  const toggle = (key) => setOpts((o) => ({ ...o, [key]: !o[key] }));

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
    const blob = new Blob([output], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'minify' ? 'script.min.js' : 'script.js';
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
        <button type="button" onClick={() => setMode('minify')} style={mode === 'minify' ? primaryBtnStyle : btnStyle}>{t.modeMinify}</button>
        <button type="button" onClick={() => setMode('beautify')} style={mode === 'beautify' ? primaryBtnStyle : btnStyle}>{t.modeBeautify}</button>
        <button type="button" onClick={() => setInput(SAMPLE_JS)} style={btnStyle}>{t.sample}</button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={btnStyle}>{t.upload}</button>
        <button type="button" onClick={() => setInput('')} style={btnStyle}>{t.clear}</button>
        <input ref={fileRef} type="file" accept=".js,.mjs,text/javascript" onChange={onFile} style={{ display: 'none' }} />
      </div>

      {mode === 'minify' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 12 }}>
          {[
            ['mangle', t.optMangle],
            ['compress', t.optCompress],
            ['dropConsole', t.optConsole],
            ['keepLicense', t.optLicense],
          ].map(([key, label]) => (
            <label key={key} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: key === 'dropConsole' && !opts.compress ? 0.5 : 1 }}>
              <input type="checkbox" checked={opts[key]} disabled={key === 'dropConsole' && !opts.compress} onChange={() => toggle(key)} /> {label}
            </label>
          ))}
        </div>
      )}

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
        {engine && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {engine === 'terser' ? '⚙️ ' + t.engineTerser : '⚠️ ' + t.engineSafe}
          </p>
        )}
        {stats && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
            {t.chars}: {input.length} → {output.length}
            {saved !== null ? ' · ' + saved + '% ' + t.saved : ''}
            {' · ' + t.lines + ': ' + stats.lines + ' · ' + t.statements + ': ' + stats.statements + ' · ' + t.functions + ': ' + stats.functions + ' · ' + t.comments + ': ' + stats.comments}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <button type="button" onClick={copy} disabled={!output} style={btnStyle}>{copied ? t.copied : t.copy}</button>
          <button type="button" onClick={download} disabled={!output} style={btnStyle}>{mode === 'minify' ? t.downloadMin : t.downloadPretty}</button>
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
