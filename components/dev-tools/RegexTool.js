'use client';
/* Regex Tester: test a JavaScript regular expression against text with live
   match highlighting, capture-group inspection, flag toggles, a pattern
   library and a find-and-replace preview. Everything runs in the browser;
   nothing is uploaded. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  VALID_FLAGS,
  FLAG_DESCRIPTIONS,
  testPattern,
  highlightSegments,
  applyReplacement,
  COMMON_PATTERNS,
  DEFAULT_PATTERN,
  DEFAULT_TEXT,
} from '@/lib/regex-utils';

const STR = {
  en: {
    patternLabel: 'Regular expression (without surrounding slashes)',
    patternPlaceholder: '(\\w+)@([\\w.-]+\\.[a-z]{2,})',
    flagsLabel: 'Flags',
    flagHelp: {
      g: 'Global: every match',
      i: 'Case-insensitive',
      m: 'Multiline: ^ $ per line',
      s: 'Dot matches newlines',
      u: 'Unicode mode',
      y: 'Sticky: match at lastIndex only',
    },
    textLabel: 'Test string',
    tryExample: 'Load example',
    clear: 'Clear',
    matchCount: 'matches',
    noMatches: 'No matches. Try a simpler pattern, or check the flags.',
    invalidPattern: 'Invalid pattern: ',
    highlightedTitle: 'Highlighted matches',
    matchesTitle: 'Match details',
    matchCol: 'Match',
    indexCol: 'Index',
    groupsCol: 'Capture groups',
    namedCol: 'Named groups',
    noneCol: 'none',
    replaceTitle: 'Substitution (find and replace)',
    replaceLabel: 'Replacement ($1, $2, $<name>, $& supported)',
    replacePlaceholder: '$1 at $2',
    replaceResult: 'Replacement result',
    replaceNote: 'Replacement uses your flags exactly as typed: without g, only the first match is replaced, just like String.replace in JavaScript.',
    libraryTitle: 'Common patterns',
    libraryHint: 'Pick one to load it into the pattern field.',
    snippetTitle: 'Use it in code',
    copy: 'Copy',
    copied: 'Copied!',
    snippetNote: 'The snippet uses matchAll, so it lists every match with its capture groups.',
    privacy: 'Privacy: matching runs locally in your browser with the JavaScript RegExp engine. Your pattern and test text are never uploaded, stored or logged.',
    seeAlso: 'More developer tools',
    siblings: [
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
      { href: '/tools/base64-encoder-decoder', label: 'Base64 Encoder & Decoder' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
      { href: '/tools/text-diff-checker', label: 'Text Diff Checker' },
    ],
  },
  es: {
    patternLabel: 'Expresión regular (sin barras alrededor)',
    patternPlaceholder: '(\\w+)@([\\w.-]+\\.[a-z]{2,})',
    flagsLabel: 'Banderas',
    flagHelp: {
      g: 'Global: todas las coincidencias',
      i: 'Sin distinción de mayúsculas',
      m: 'Multilínea: ^ $ por línea',
      s: 'El punto acepta saltos de línea',
      u: 'Modo Unicode',
      y: 'Fija: solo en lastIndex',
    },
    textLabel: 'Texto de prueba',
    tryExample: 'Cargar ejemplo',
    clear: 'Limpiar',
    matchCount: 'coincidencias',
    noMatches: 'Sin coincidencias. Prueba un patrón más simple o revisa las banderas.',
    invalidPattern: 'Patrón inválido: ',
    highlightedTitle: 'Coincidencias resaltadas',
    matchesTitle: 'Detalle de coincidencias',
    matchCol: 'Coincidencia',
    indexCol: 'Índice',
    groupsCol: 'Grupos de captura',
    namedCol: 'Grupos con nombre',
    noneCol: 'ninguno',
    replaceTitle: 'Sustitución (buscar y reemplazar)',
    replaceLabel: 'Reemplazo ($1, $2, $<nombre>, $& soportados)',
    replacePlaceholder: '$1 en $2',
    replaceResult: 'Resultado del reemplazo',
    replaceNote: 'El reemplazo usa tus banderas tal como las escribiste: sin g, solo se reemplaza la primera coincidencia, igual que String.replace en JavaScript.',
    libraryTitle: 'Patrones comunes',
    libraryHint: 'Elige uno para cargarlo en el campo del patrón.',
    snippetTitle: 'Úsalo en código',
    copy: 'Copiar',
    copied: '¡Copiado!',
    snippetNote: 'El fragmento usa matchAll, así que lista cada coincidencia con sus grupos de captura.',
    privacy: 'Privacidad: la comparación corre localmente en tu navegador con el motor RegExp de JavaScript. Tu patrón y tu texto nunca se suben, guardan ni registran.',
    seeAlso: 'Más herramientas para desarrolladores',
    siblings: [
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
      { href: '/es/tools/codificador-base64', label: 'Codificador Base64' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
      { href: '/es/tools/comparador-de-textos', label: 'Comparador de Textos' },
    ],
  },
};

export default function RegexTool({ lang = 'en' }) {
  const s = STR[lang] || STR.en;
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(DEFAULT_TEXT);
  const [replacement, setReplacement] = useState('$1 at $2');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => testPattern(pattern, flags, text), [pattern, flags, text]);
  const segments = useMemo(
    () => (result.error ? [] : highlightSegments(text, result.matches)),
    [result, text]
  );
  const replaced = useMemo(
    () => (result.error ? { result: '', error: null } : applyReplacement(pattern, flags, text, replacement)),
    [result, pattern, flags, text, replacement]
  );

  const toggleFlag = (f) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  const snippet = `const re = /${pattern}/${flags.includes('g') ? flags : flags + 'g'};\nconst matches = [...text.matchAll(re)];\n// matches[i][0] = full match, matches[i][1..] = capture groups`;

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: user can still select the text */
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: '1rem',
    fontFamily: 'ui-monospace, monospace',
    boxSizing: 'border-box',
  };

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.patternLabel}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <span style={{ padding: '10px 4px 10px 10px', fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder={s.patternPlaceholder}
          style={{ ...inputStyle, borderLeft: 'none', borderRight: 'none', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }}
          aria-label={s.patternLabel}
        />
        <span style={{ padding: '10px 10px 10px 4px', fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>/{flags}</span>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.flagsLabel}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VALID_FLAGS.map((f) => (
            <label
              key={f}
              title={FLAG_DESCRIPTIONS[f]}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                border: flags.includes(f) ? '2px solid #0f766e' : '1px solid #cbd5e1',
                borderRadius: 999,
                cursor: 'pointer',
                background: flags.includes(f) ? '#ecfdf5' : '#fff',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              <input type="checkbox" checked={flags.includes(f)} onChange={() => toggleFlag(f)} />
              {f} <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', color: '#475569' }}>{s.flagHelp[f]}</span>
            </label>
          ))}
        </div>
      </div>

      <label style={{ display: 'block', fontWeight: 600, marginTop: 18, marginBottom: 6 }}>{s.textLabel}</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ ...inputStyle, resize: 'vertical' }}
        aria-label={s.textLabel}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setPattern(DEFAULT_PATTERN); setFlags('g'); setText(DEFAULT_TEXT); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', cursor: 'pointer' }}>
          {s.tryExample}
        </button>
        <button type="button" onClick={() => { setPattern(''); setText(''); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
          {s.clear}
        </button>
      </div>

      {result.error ? (
        <p style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
          {s.invalidPattern}{result.error}
        </p>
      ) : (
        <>
          <h3 style={{ marginTop: 24 }}>{s.highlightedTitle} ({result.matches.length} {s.matchCount})</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, fontSize: '0.95rem', lineHeight: 1.6 }}>
            {segments.map((seg, i) =>
              seg.matched ? (
                <mark key={i} style={{ background: '#fde68a', padding: '1px 2px', borderRadius: 3 }}>{seg.text}</mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </pre>
          {result.matches.length === 0 && <p style={{ color: '#475569' }}>{s.noMatches}</p>}

          {result.matches.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>{s.matchesTitle}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 10px 8px 0' }}>#</th>
                      <th style={{ padding: 8 }}>{s.matchCol}</th>
                      <th style={{ padding: 8 }}>{s.indexCol}</th>
                      <th style={{ padding: 8 }}>{s.groupsCol}</th>
                      <th style={{ padding: 8 }}>{s.namedCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matches.slice(0, 100).map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px 8px 0', color: '#64748b' }}>{i + 1}</td>
                        <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>{m.text === '' ? '(empty)' : m.text}</td>
                        <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>{m.index}</td>
                        <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                          {m.groups.length === 0 ? s.noneCol : m.groups.map((g, gi) => `${gi + 1}: ${g === undefined ? '(undefined)' : JSON.stringify(g)}`).join(', ')}
                        </td>
                        <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                          {Object.keys(m.named).length === 0 ? s.noneCol : Object.entries(m.named).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.matches.length > 100 && (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing the first 100 of {result.matches.length} matches.</p>
              )}
            </>
          )}
        </>
      )}

      <h3 style={{ marginTop: 28 }}>{s.replaceTitle}</h3>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{s.replaceLabel}</label>
      <input value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder={s.replacePlaceholder} style={inputStyle} aria-label={s.replaceLabel} />
      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{s.replaceNote}</p>
      {!result.error && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, fontSize: '0.95rem' }}>
          {replaced.result}
        </pre>
      )}

      <h3 style={{ marginTop: 28 }}>{s.libraryTitle}</h3>
      <p style={{ color: '#475569', marginTop: 0 }}>{s.libraryHint}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {COMMON_PATTERNS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
            style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <h3 style={{ marginTop: 28 }}>{s.snippetTitle}</h3>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: 14, fontSize: '0.9rem' }}>
        {snippet}
      </pre>
      <button type="button" onClick={() => copyText(snippet)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
        {copied ? s.copied : s.copy}
      </button>
      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{s.snippetNote}</p>

      <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: 20 }}>{s.privacy}</p>
      <p>
        <strong>{s.seeAlso}:</strong>{' '}
        {s.siblings.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ', '}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
