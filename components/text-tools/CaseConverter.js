'use client';
/* Case Converter — 6 transforms, copy-to-clipboard, live stats.
   Differentiator: alternating + inverse case modes most micro-rankers lack. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { convertCase, textStats, CASE_MODES } from '@/lib/text-tools';

const STR = {
  en: {
    placeholder: 'Type or paste your text here…',
    outputLabel: 'Converted text',
    copy: 'Copy to clipboard',
    copied: 'Copied!',
    copyFail: 'Copy failed — select the text manually.',
    clear: 'Clear',
    chars: 'Characters',
    words: 'Words',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/character-counter', label: 'Character Counter' },
      { href: '/tools/word-counter', label: 'Word Counter' },
    ],
    modes: {
      upper: 'UPPER CASE',
      lower: 'lower case',
      title: 'Title Case',
      sentence: 'Sentence case',
      alternating: 'aLtErNaTiNg cAsE',
      inverse: 'InVeRsE CaSe',
    },
  },
  es: {
    placeholder: 'Escribe o pega tu texto aquí…',
    outputLabel: 'Texto convertido',
    copy: 'Copiar al portapapeles',
    copied: '¡Copiado!',
    copyFail: 'No se pudo copiar — selecciona el texto manualmente.',
    clear: 'Borrar',
    chars: 'Caracteres',
    words: 'Palabras',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
      { href: '/es/tools/contador-de-palabras', label: 'Contador de palabras' },
    ],
    modes: {
      upper: 'MAYÚSCULAS',
      lower: 'minúsculas',
      title: 'Tipo Título',
      sentence: 'Tipo oración',
      alternating: 'aLtErNaDo',
      inverse: 'InVeRsO',
    },
  },
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CaseConverter({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [text, setText] = useState('');
  const [mode, setMode] = useState('upper');
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const output = useMemo(() => convertCase(text, mode), [text, mode]);
  const s = useMemo(() => textStats(output), [output]);

  const onCopy = async () => {
    if (!output) return;
    const ok = await copyText(output);
    setCopied(ok);
    setFailed(!ok);
    if (ok) setTimeout(() => setCopied(false), 1800);
  };

  const area = {
    width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
    borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
  };

  return (
    <div>
      <div className="field">
        <textarea
          value={text}
          rows={5}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          aria-label={t.placeholder}
          style={area}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0' }} role="group" aria-label={t.outputLabel}>
        {CASE_MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={'btn ' + (mode === m ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            style={{ fontSize: '0.9rem' }}
          >
            {t.modes[m]}
          </button>
        ))}
      </div>

      <div className="field">
        <label>{t.outputLabel}</label>
        <textarea value={output} rows={5} readOnly aria-label={t.outputLabel} style={{ ...area, background: '#f8fafc' }} />
      </div>

      <div className="results" aria-live="polite" style={{ marginTop: 4 }}>
        <div className="result-box">
          <div className="lbl">{t.chars}</div>
          <div className="val">{s.chars.toLocaleString()}</div>
        </div>
        <div className="result-box">
          <div className="lbl">{t.words}</div>
          <div className="val">{s.words.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={onCopy} disabled={!output}>
          {copied ? t.copied : t.copy}
        </button>
        <button type="button" className="btn btn-ghost-light" onClick={() => setText('')}>
          {t.clear}
        </button>
      </div>
      {failed && <div className="warn-box" style={{ marginTop: 10 }}>{t.copyFail}</div>}

      <div className="note-box" style={{ marginTop: 18 }}>
        <strong>{t.seeAlso}:</strong>{' '}
        {t.siblings.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
