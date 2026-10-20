'use client';
/* Lorem Ipsum Generator - themed placeholder text (classic latin, startup,
   coffee, pirate), paragraph count, sentence length, copy + download.
   Differentiator: themed generators the thin micro-rankers lack. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { generateLorem, textStats, LOREM_THEME_KEYS } from '@/lib/text-tools';

const STR = {
  en: {
    themesTitle: 'Text theme',
    themes: {
      classic: 'Classic Latin',
      startup: 'Startup ipsum',
      coffee: 'Coffee ipsum',
      pirate: 'Pirate ipsum',
    },
    paragraphs: 'Paragraphs',
    length: 'Sentence length',
    lengths: { short: 'Short', medium: 'Medium', long: 'Long' },
    opener: 'Start with the classic "Lorem ipsum dolor sit amet…" opening',
    generate: 'Generate text',
    regenerate: 'Regenerate',
    outputLabel: 'Generated placeholder text',
    copy: 'Copy to clipboard',
    copied: 'Copied!',
    copyFail: 'Copy failed - select the text manually.',
    download: 'Download .txt',
    statParas: 'Paragraphs',
    statSentences: 'Sentences',
    statWords: 'Words',
    statChars: 'Characters',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/character-counter', label: 'Character Counter' },
      { href: '/tools/word-counter', label: 'Word Counter' },
      { href: '/tools/case-converter', label: 'Case Converter' },
    ],
  },
  es: {
    themesTitle: 'Tema del texto',
    themes: {
      classic: 'Latín clásico',
      startup: 'Startup ipsum',
      coffee: 'Coffee ipsum',
      pirate: 'Pirata ipsum',
    },
    paragraphs: 'Párrafos',
    length: 'Longitud de oraciones',
    lengths: { short: 'Cortas', medium: 'Medias', long: 'Largas' },
    opener: 'Empezar con la apertura clásica "Lorem ipsum dolor sit amet…"',
    generate: 'Generar texto',
    regenerate: 'Regenerar',
    outputLabel: 'Texto de relleno generado',
    copy: 'Copiar al portapapeles',
    copied: '¡Copiado!',
    copyFail: 'No se pudo copiar - selecciona el texto manualmente.',
    download: 'Descargar .txt',
    statParas: 'Párrafos',
    statSentences: 'Oraciones',
    statWords: 'Palabras',
    statChars: 'Caracteres',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
      { href: '/es/tools/contador-de-palabras', label: 'Contador de palabras' },
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de mayúsculas' },
    ],
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

export default function LoremIpsum({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [theme, setTheme] = useState('classic');
  const [paras, setParas] = useState(3);
  const [length, setLength] = useState('medium');
  const [opener, setOpener] = useState(true);
  const [nonce, setNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const paragraphs = useMemo(
    () => generateLorem(theme, paras, length, opener, nonce),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, paras, length, opener, nonce]
  );
  const text = paragraphs.join('\n\n');
  const s = useMemo(() => textStats(text), [text]);

  const onCopy = async () => {
    if (!text) return;
    const ok = await copyText(text);
    setCopied(ok);
    setFailed(!ok);
    if (ok) setTimeout(() => setCopied(false), 1800);
  };

  const onDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = theme + '-ipsum.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const area = {
    width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
    borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
  };

  const stats = [
    { label: t.statParas, value: s.paragraphs.toLocaleString(), highlight: true },
    { label: t.statSentences, value: s.sentences.toLocaleString() },
    { label: t.statWords, value: s.words.toLocaleString() },
    { label: t.statChars, value: s.chars.toLocaleString() },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 14px' }} role="group" aria-label={t.themesTitle}>
        {LOREM_THEME_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={'btn ' + (theme === k ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setTheme(k)}
            aria-pressed={theme === k}
            style={{ fontSize: '0.9rem' }}
          >
            {t.themes[k]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
        <div className="field" style={{ minWidth: 120 }}>
          <label htmlFor="lorem-paras">{t.paragraphs}</label>
          <input
            id="lorem-paras"
            type="number"
            min={1}
            max={10}
            value={paras}
            onChange={(e) => setParas(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            style={{ ...area, padding: '8px 12px' }}
          />
        </div>
        <div className="field">
          <label>{t.length}</label>
          <div style={{ display: 'flex', gap: 8 }} role="group" aria-label={t.length}>
            {['short', 'medium', 'long'].map((l) => (
              <button
                key={l}
                type="button"
                className={'btn ' + (length === l ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setLength(l)}
                aria-pressed={length === l}
                style={{ fontSize: '0.85rem' }}
              >
                {t.lengths[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {theme === 'classic' && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.95rem', marginBottom: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={opener} onChange={(e) => setOpener(e.target.checked)} />
          {t.opener}
        </label>
      )}

      <div className="field">
        <label htmlFor="lorem-output">{t.outputLabel}</label>
        <textarea id="lorem-output" value={text} rows={10} readOnly aria-label={t.outputLabel} style={{ ...area, background: '#f8fafc' }} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => setNonce((n) => n + 1)}>
          {t.regenerate}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCopy}>
          {copied ? t.copied : t.copy}
        </button>
        <button type="button" className="btn btn-ghost-light" onClick={onDownload}>
          {t.download}
        </button>
      </div>
      {failed && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: 8 }}>{t.copyFail}</p>}

      <div className="results" aria-live="polite" style={{ marginTop: 16 }}>
        {stats.map((o, i) => (
          <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
            <div className="lbl">{o.label}</div>
            <div className="val">{o.value}</div>
          </div>
        ))}
      </div>

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
