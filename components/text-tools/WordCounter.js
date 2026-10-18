'use client';
/* Word Counter - live counts, reading/speaking time, keyword density top-5.
   Differentiator: keyword density table (SEO writers) + dual time estimates. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { textStats, readingSeconds, formatDuration, keywordDensity } from '@/lib/text-tools';

const STR = {
  en: {
    placeholder: 'Paste your essay, article or post here…',
    words: 'Words',
    chars: 'Characters',
    sentences: 'Sentences',
    paragraphs: 'Paragraphs',
    reading: 'Reading time',
    speaking: 'Speaking time',
    clear: 'Clear',
    densityTitle: 'Keyword density (top 5)',
    densityEmpty: 'Type at least a few words to see keyword density.',
    thKeyword: 'Keyword',
    thCount: 'Count',
    thDensity: 'Density',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/character-counter', label: 'Character Counter' },
      { href: '/tools/case-converter', label: 'Case Converter' },
    ],
    extra: { href: '/tools/salary-paycheck-calculator', label: 'Salary Paycheck Calculator', note: 'Freelancer? See what your words are worth - calculate your take-home pay.' },
  },
  es: {
    placeholder: 'Pega tu ensayo, artículo o publicación aquí…',
    words: 'Palabras',
    chars: 'Caracteres',
    sentences: 'Oraciones',
    paragraphs: 'Párrafos',
    reading: 'Tiempo de lectura',
    speaking: 'Tiempo de narración',
    clear: 'Borrar',
    densityTitle: 'Densidad de palabras clave (top 5)',
    densityEmpty: 'Escribe algunas palabras para ver la densidad.',
    thKeyword: 'Palabra clave',
    thCount: 'Veces',
    thDensity: 'Densidad',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de mayúsculas' },
    ],
    extra: { href: '/es/tools/calculadora-de-salario', label: 'Calculadora de salario', note: '¿Freelancer? Calcula cuánto te queda de tu trabajo.' },
  },
};

export default function WordCounter({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [text, setText] = useState('');
  const s = useMemo(() => textStats(text), [text]);
  const density = useMemo(() => keywordDensity(text, 5), [text]);

  const stats = [
    { label: t.words, value: s.words.toLocaleString(), highlight: true },
    { label: t.chars, value: s.chars.toLocaleString() },
    { label: t.sentences, value: s.sentences.toLocaleString() },
    { label: t.paragraphs, value: s.paragraphs.toLocaleString() },
    { label: t.reading, value: formatDuration(readingSeconds(s.words, 200), lang) },
    { label: t.speaking, value: formatDuration(readingSeconds(s.words, 150), lang) },
  ];

  return (
    <div>
      <div className="field">
        <textarea
          value={text}
          rows={7}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          aria-label={t.words}
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
        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>{t.densityTitle}</h2>
        {density.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.95rem' }}>{t.densityEmpty}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '8px 6px' }}>{t.thKeyword}</th>
                  <th style={{ padding: '8px 6px' }}>{t.thCount}</th>
                  <th style={{ padding: '8px 6px' }}>{t.thDensity}</th>
                </tr>
              </thead>
              <tbody>
                {density.map((d) => (
                  <tr key={d.word} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 6px', fontWeight: 600 }}>{d.word}</td>
                    <td style={{ padding: '8px 6px' }}>{d.count}</td>
                    <td style={{ padding: '8px 6px' }}>{d.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
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
        <br />
        <span style={{ fontSize: '0.9rem' }}>
          {t.extra.note}{' '}
          <Link href={t.extra.href}>{t.extra.label}</Link>
        </span>
      </div>
    </div>
  );
}
