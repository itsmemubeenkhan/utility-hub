'use client';
/* Character Counter - live counts + per-platform limit meters.
   Differentiator: X/Twitter, Instagram bio and meta-description meters. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { textStats } from '@/lib/text-tools';

const STR = {
  en: {
    placeholder: 'Type or paste your text here…',
    chars: 'Characters',
    noSpaces: 'Characters (no spaces)',
    words: 'Words',
    lines: 'Lines',
    clear: 'Clear',
    metersTitle: 'Platform limits',
    over: 'over by',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/word-counter', label: 'Word Counter' },
      { href: '/tools/case-converter', label: 'Case Converter' },
    ],
    platforms: [
      { key: 'x', label: 'X / Twitter post', limit: 280 },
      { key: 'ig', label: 'Instagram bio', limit: 150 },
      { key: 'meta', label: 'Meta description', limit: 155 },
    ],
  },
  es: {
    placeholder: 'Escribe o pega tu texto aquí…',
    chars: 'Caracteres',
    noSpaces: 'Caracteres (sin espacios)',
    words: 'Palabras',
    lines: 'Líneas',
    clear: 'Borrar',
    metersTitle: 'Límites por plataforma',
    over: 'excede por',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/contador-de-palabras', label: 'Contador de palabras' },
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de mayúsculas' },
    ],
    platforms: [
      { key: 'x', label: 'Publicación de X / Twitter', limit: 280 },
      { key: 'ig', label: 'Biografía de Instagram', limit: 150 },
      { key: 'meta', label: 'Meta descripción', limit: 155 },
    ],
  },
};

function Meter({ label, used, limit, overText }) {
  const ratio = limit > 0 ? used / limit : 0;
  const color = ratio > 1 ? '#dc2626' : ratio > 0.85 ? '#d97706' : '#16a34a';
  const width = Math.min(100, ratio * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>
          {used.toLocaleString()} / {limit}
          {ratio > 1 && (
            <span style={{ fontWeight: 400 }}> ({overText} {used - limit})</span>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={label}
        style={{ height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}
      >
        <div style={{ height: '100%', width: width + '%', background: color, borderRadius: 999, transition: 'width .15s ease' }} />
      </div>
    </div>
  );
}

export default function CharacterCounter({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [text, setText] = useState('');
  const s = useMemo(() => textStats(text), [text]);

  const stats = [
    { label: t.chars, value: s.chars.toLocaleString(), highlight: true },
    { label: t.noSpaces, value: s.charsNoSpaces.toLocaleString() },
    { label: t.words, value: s.words.toLocaleString() },
    { label: t.lines, value: s.lines.toLocaleString() },
  ];

  return (
    <div>
      <div className="field">
        <textarea
          value={text}
          rows={7}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          aria-label={t.chars}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
            borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
          }}
        />
      </div>

      <div className="results" aria-live="polite" style={{ marginTop: 4 }}>
        {stats.map((o, i) => (
          <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
            <div className="lbl">{o.label}</div>
            <div className="val">{o.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>{t.metersTitle}</h2>
        {t.platforms.map((p) => (
          <Meter key={p.key} label={p.label} used={s.chars} limit={p.limit} overText={t.over} />
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost-light" onClick={() => setText('')}>
          {t.clear}
        </button>
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
