'use client';
/* Readability Checker - six formulas at once (Flesch Reading Ease,
   Flesch-Kincaid Grade, Gunning Fog, SMOG, Coleman-Liau, ARI), live
   counts, a clickable long-sentence map and a target-audience check.
   Spanish page adds Fernandez-Huerta and Szigriszt-Pazos.
   Differentiator: six formulas + sentence map + bilingual Spanish
   formulas; most rankers offer only Flesch + grade. */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  analyzeText, audienceFit, fleschLabel,
  SAMPLE_EN, SAMPLE_ES,
} from '@/lib/readability-utils';

const FLESCH_LABELS = {
  en: {
    veryEasy: 'Very easy', easy: 'Easy', fairlyEasy: 'Fairly easy',
    standard: 'Standard', fairlyDifficult: 'Fairly difficult',
    difficult: 'Difficult', veryDifficult: 'Very difficult',
  },
  es: {
    veryEasy: 'Muy fácil', easy: 'Fácil', fairlyEasy: 'Bastante fácil',
    standard: 'Estándar', fairlyDifficult: 'Bastante difícil',
    difficult: 'Difícil', veryDifficult: 'Muy difícil',
  },
};

const STR = {
  en: {
    placeholder: 'Paste your essay, article or post here…',
    sample: 'Sample text', upload: 'Upload .txt', clear: 'Clear',
    copy: 'Copy summary', copied: 'Copied!',
    countsTitle: 'Counts',
    words: 'Words', sentences: 'Sentences', syllables: 'Syllables',
    characters: 'Characters', avgWords: 'Avg words / sentence',
    avgSyllables: 'Avg syllables / word', complex: 'Complex words (3+ syllables)',
    formulasTitle: 'Readability scores',
    flesch: 'Flesch Reading Ease', fk: 'Flesch-Kincaid Grade Level',
    fog: 'Gunning Fog Index', smog: 'SMOG Index',
    cli: 'Coleman-Liau Index', ari: 'Automated Readability Index (ARI)',
    fh: 'Fernandez-Huerta (Spanish)', sz: 'Szigriszt-Pazos (Spanish)',
    gradeSuffix: 'US grade', yearsSuffix: 'years of schooling',
    spanishNote: 'The English formulas above were built for English text. For Spanish text, trust the two Spanish formulas below: Fernandez-Huerta (206.84 - 0.60 x syllables per 100 words - 1.02 x sentences per 100 words) and Szigriszt-Pazos (206.835 - 62.3 x syllables per word - words per sentence).',
    estimateNote: 'Syllables are counted with a vowel-group heuristic (silent e and -ed handled), so counts are estimates. Aim for at least 100 words before trusting a grade level.',
    audienceTitle: 'Target audience',
    audiences: { general: 'General public', school: 'School', college: 'College', technical: 'Technical' },
    onTarget: 'On target for this audience.',
    easier: 'easier than this audience needs',
    harder: 'harder than this audience needs',
    gradeLevels: 'grade level(s)',
    empty: 'Type or paste at least a sentence to see scores.',
    longTitle: 'Long sentences (over 25 words)',
    longEmpty: 'No sentences over 25 words. Good.',
    longHint: 'Click a sentence to highlight it in your text.',
    wordsSuffix: 'words',
    seeAlso: 'More text tools',
    siblings: [
      { href: '/tools/word-counter', label: 'Word Counter' },
      { href: '/tools/character-counter', label: 'Character Counter' },
      { href: '/tools/case-converter', label: 'Case Converter' },
      { href: '/tools/markdown-to-html', label: 'Markdown to HTML' },
    ],
  },
  es: {
    placeholder: 'Pega tu ensayo, artículo o publicación aquí…',
    sample: 'Texto de ejemplo', upload: 'Subir .txt', clear: 'Borrar',
    copy: 'Copiar resumen', copied: '¡Copiado!',
    countsTitle: 'Conteos',
    words: 'Palabras', sentences: 'Oraciones', syllables: 'Sílabas',
    characters: 'Caracteres', avgWords: 'Prom. palabras / oración',
    avgSyllables: 'Prom. sílabas / palabra', complex: 'Palabras complejas (3+ sílabas)',
    formulasTitle: 'Puntuaciones de legibilidad',
    flesch: 'Facilidad de lectura de Flesch', fk: 'Nivel de grado Flesch-Kincaid',
    fog: 'Índice de niebla de Gunning', smog: 'Índice SMOG',
    cli: 'Índice de Coleman-Liau', ari: 'Índice de legibilidad automatizado (ARI)',
    fh: 'Fernández-Huerta (español)', sz: 'Szigriszt-Pazos (español)',
    gradeSuffix: 'grado en EE. UU.', yearsSuffix: 'años de escolaridad',
    spanishNote: 'Las fórmulas en inglés de arriba se crearon para textos en inglés. Para un texto en español, confía en las dos fórmulas españolas de abajo: Fernández-Huerta (206.84 - 0.60 x sílabas por cada 100 palabras - 1.02 x oraciones por cada 100 palabras) y Szigriszt-Pazos (206.835 - 62.3 x sílabas por palabra - palabras por oración).',
    estimateNote: 'Las sílabas se cuentan con una heurística de grupos vocálicos (e final muda y -ed), así que los conteos son estimaciones. Busca al menos 100 palabras antes de confiar en un nivel de grado.',
    audienceTitle: 'Público objetivo',
    audiences: { general: 'Público general', school: 'Escuela', college: 'Universidad', technical: 'Técnico' },
    onTarget: 'En el objetivo para este público.',
    easier: 'más fácil de lo que este público necesita',
    harder: 'más difícil de lo que este público necesita',
    gradeLevels: 'nivel(es) de grado',
    empty: 'Escribe o pega al menos una oración para ver las puntuaciones.',
    longTitle: 'Oraciones largas (más de 25 palabras)',
    longEmpty: 'No hay oraciones de más de 25 palabras. Bien.',
    longHint: 'Haz clic en una oración para resaltarla en tu texto.',
    wordsSuffix: 'palabras',
    seeAlso: 'Más herramientas de texto',
    siblings: [
      { href: '/es/tools/contador-de-palabras', label: 'Contador de palabras' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
      { href: '/es/tools/convertidor-de-mayusculas', label: 'Convertidor de mayúsculas' },
      { href: '/es/tools/convertidor-de-markdown-a-html', label: 'Convertidor de Markdown a HTML' },
    ],
  },
};

export default function ReadabilityTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const isEs = lang === 'es';
  const [text, setText] = useState('');
  const [audience, setAudience] = useState('general');
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const a = useMemo(() => analyzeText(text), [text]);
  const hasText = a.words > 0 && a.sentences > 0;
  const fit = audienceFit(a.fleschKincaid, audience);
  const fl = fleschLabel(a.flesch);

  const stats = [
    { label: t.words, value: a.words.toLocaleString(), highlight: true },
    { label: t.sentences, value: a.sentences.toLocaleString() },
    { label: t.syllables, value: a.syllables.toLocaleString() },
    { label: t.characters, value: a.characters.toLocaleString() },
    { label: t.avgWords, value: hasText ? String(a.avgWordsPerSentence) : '-' },
    { label: t.avgSyllables, value: hasText ? String(a.avgSyllablesPerWord) : '-' },
    { label: t.complex, value: a.complexWords.toLocaleString() },
  ];

  const formulas = [
    { label: t.flesch, value: a.flesch, sub: fl ? FLESCH_LABELS[lang][fl] : null, highlight: true },
    { label: t.fk, value: a.fleschKincaid, sub: a.fleschKincaid != null ? `${t.gradeSuffix} ${a.fleschKincaid}` : null },
    { label: t.fog, value: a.fog, sub: a.fog != null ? `${a.fog} ${t.yearsSuffix}` : null },
    { label: t.smog, value: a.smog, sub: a.smog != null ? `${a.smog} ${t.yearsSuffix}` : null },
    { label: t.cli, value: a.colemanLiau, sub: a.colemanLiau != null ? `${t.gradeSuffix} ${a.colemanLiau}` : null },
    { label: t.ari, value: a.ari, sub: a.ari != null ? `${t.gradeSuffix} ${a.ari}` : null },
  ];
  const spanishFormulas = isEs ? [
    { label: t.fh, value: a.fernandezHuerta, sub: null, highlight: true },
    { label: t.sz, value: a.szigrisztPazos, sub: null, highlight: true },
  ] : [];

  function highlightSentence(s) {
    const el = taRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(s.start, s.end);
  }

  function onUpload(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(f);
    e.target.value = '';
  }

  function copySummary() {
    if (!hasText) return;
    const lines = [
      t.formulasTitle,
      `${t.flesch}: ${a.flesch} (${fl ? FLESCH_LABELS[lang][fl] : ''})`,
      `${t.fk}: ${a.fleschKincaid}`,
      `${t.fog}: ${a.fog}`,
      `${t.smog}: ${a.smog}`,
      `${t.cli}: ${a.colemanLiau}`,
      `${t.ari}: ${a.ari}`,
      ...(isEs ? [`${t.fh}: ${a.fernandezHuerta}`, `${t.sz}: ${a.szigrisztPazos}`] : []),
      `${t.words}: ${a.words}, ${t.sentences}: ${a.sentences}, ${t.syllables}: ${a.syllables}, ${t.characters}: ${a.characters}`,
    ];
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lines.join('\n')).then(done, done);
    } else {
      const el = document.createElement('textarea');
      el.value = lines.join('\n');
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(el);
      done();
    }
  }

  return (
    <div>
      <div className="field">
        <textarea
          ref={taRef}
          value={text}
          rows={8}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          aria-label={t.words}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
            borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        <button type="button" className="btn" onClick={() => setText(isEs ? SAMPLE_ES : SAMPLE_EN)}>{t.sample}</button>
        <button type="button" className="btn" onClick={() => fileRef.current && fileRef.current.click()}>{t.upload}</button>
        <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={onUpload} style={{ display: 'none' }} />
        <button type="button" className="btn" onClick={() => setText('')}>{t.clear}</button>
        <button type="button" className="btn" onClick={copySummary} disabled={!hasText}>{copied ? t.copied : t.copy}</button>
      </div>

      {!hasText ? (
        <p style={{ color: '#666', fontSize: '0.95rem', marginTop: 18 }}>{t.empty}</p>
      ) : (
        <>
          <h2 style={{ fontSize: '1.15rem', margin: '22px 0 10px' }}>{t.countsTitle}</h2>
          <div className="results" aria-live="polite">
            {stats.map((o, i) => (
              <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
                <div className="lbl">{o.label}</div>
                <div className="val">{o.value}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.15rem', margin: '22px 0 10px' }}>{t.formulasTitle}</h2>
          <div className="results" aria-live="polite">
            {formulas.map((o, i) => (
              <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
                <div className="lbl">{o.label}</div>
                <div className="val">{o.value == null ? '-' : o.value}</div>
                {o.sub && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{o.sub}</div>}
              </div>
            ))}
          </div>

          {isEs && (
            <>
              <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: 14 }}>{t.spanishNote}</p>
              <div className="results" aria-live="polite">
                {spanishFormulas.map((o, i) => (
                  <div key={i} className={'result-box' + (o.highlight ? ' highlight' : '')}>
                    <div className="lbl">{o.label}</div>
                    <div className="val">{o.value == null ? '-' : o.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 12 }}>{t.estimateNote}</p>

          <div className="card" style={{ marginTop: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>{t.audienceTitle}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.keys(t.audiences).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="btn"
                  aria-pressed={audience === key}
                  onClick={() => setAudience(key)}
                  style={audience === key ? { background: '#0f766e', color: '#fff', borderColor: '#0f766e' } : {}}
                >
                  {t.audiences[key]}
                </button>
              ))}
            </div>
            {fit && (
              <p style={{ marginBottom: 0 }}>
                {fit.status === 'onTarget'
                  ? t.onTarget
                  : `${a.fleschKincaid} ${t.gradeSuffix} - ${fit.diff} ${t.gradeLevels} ${fit.status === 'easier' ? t.easier : t.harder}.`}
              </p>
            )}
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>{t.longTitle}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>{t.longHint}</p>
            {a.longSentences.length === 0 ? (
              <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: 0 }}>{t.longEmpty}</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {a.longSentences.map((s) => (
                  <li key={s.index} style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => highlightSentence(s)}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        textAlign: 'left', fontSize: '0.95rem', color: '#0f766e',
                        textDecoration: 'underline',
                      }}
                    >
                      {s.sentence}
                    </button>{' '}
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({s.words} {t.wordsSuffix})</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}

      <p style={{ marginTop: 26, fontSize: '0.95rem' }}>
        {t.seeAlso}:{' '}
        {t.siblings.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href}>{s.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
