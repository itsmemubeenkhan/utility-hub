'use client';
/* Password Strength Checker: live score, entropy and crack-time
   estimates for a typed password, with pattern warnings, an 8-point
   checklist and specific improvement tips. All analysis runs in the
   browser via lib/password-strength-utils; nothing is ever sent or
   stored. The copy-summary button never includes the password itself. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  SAMPLE_WEAK, analyzePassword, randomStrongPassword,
} from '@/lib/password-strength-utils';

const LABELS = {
  'very-weak': { en: 'Very Weak', es: 'Muy débil' },
  weak: { en: 'Weak', es: 'Débil' },
  fair: { en: 'Fair', es: 'Regular' },
  good: { en: 'Good', es: 'Buena' },
  strong: { en: 'Strong', es: 'Fuerte' },
  'very-strong': { en: 'Very Strong', es: 'Muy fuerte' },
};

const BAR_COLORS = {
  'very-weak': '#dc2626',
  weak: '#ea580c',
  fair: '#ca8a04',
  good: '#65a30d',
  strong: '#16a34a',
  'very-strong': '#059669',
};

const UNIT_LABELS = {
  instant: { en: 'instant', es: 'instantáneo' },
  second: { en: ['second', 'seconds'], es: ['segundo', 'segundos'] },
  minute: { en: ['minute', 'minutes'], es: ['minuto', 'minutos'] },
  hour: { en: ['hour', 'hours'], es: ['hora', 'horas'] },
  day: { en: ['day', 'days'], es: ['día', 'días'] },
  month: { en: ['month', 'months'], es: ['mes', 'meses'] },
  year: { en: ['year', 'years'], es: ['año', 'años'] },
  century: { en: ['century', 'centuries'], es: ['siglo', 'siglos'] },
  'thousand-years': { en: ['thousand years', 'thousand years'], es: ['mil años', 'mil años'] },
  'million-years': { en: ['million years', 'million years'], es: ['millones de años', 'millones de años'] },
  'billion-years': { en: ['billion years', 'billion years'], es: ['miles de millones de años', 'miles de millones de años'] },
  'trillion-years': { en: ['trillion years', 'trillion years'], es: ['billones de años', 'billones de años'] },
};

function formatDurationText(duration, lang) {
  if (!duration || duration.unit === 'instant') return UNIT_LABELS.instant[lang] || UNIT_LABELS.instant.en;
  const labels = UNIT_LABELS[duration.unit][lang] || UNIT_LABELS[duration.unit].en;
  const num = Number(duration.value).toLocaleString('en-US', { maximumFractionDigits: 1 });
  return num + ' ' + (duration.value === 1 ? labels[0] : labels[1]);
}

const STR = {
  en: {
    inputLabel: 'Password to check',
    inputPlaceholder: 'Type a password to check it, e.g. Summer2024!!',
    show: 'Show',
    hide: 'Hide',
    tryWeak: 'Try a weak example',
    tryStrong: 'Try a strong example',
    generate: 'Generate a strong password',
    copySummary: 'Copy score summary',
    copied: 'Copied!',
    empty: 'Type a password above to see its score, entropy and crack time.',
    score: 'Score',
    outOf: 'out of 100',
    entropy: 'Entropy',
    bits: 'bits',
    length: 'Length',
    chars: 'characters',
    pool: 'Character pool',
    crackTitle: 'Estimated time to crack',
    crackNote: 'Estimates assume the stated guess rates and that the password is random apart from the patterns found. Dictionary and rule-based attacks crack patterned passwords much faster.',
    scenarios: {
      throttled: 'Online, throttled login',
      unthrottled: 'Online, unthrottled',
      slowHash: 'Offline, slow hash (bcrypt)',
      fastHash: 'Offline, fast hash (MD5)',
    },
    rates: {
      throttled: 'about 100 guesses/sec',
      unthrottled: 'about 1,000 guesses/sec',
      slowHash: 'about 10 guesses/sec',
      fastHash: 'about 10 billion guesses/sec',
    },
    checklistTitle: 'Strength checklist',
    checklist: {
      len8: 'At least 8 characters',
      len12: 'At least 12 characters',
      lower: 'Lowercase letter (a-z)',
      upper: 'Uppercase letter (A-Z)',
      digit: 'Digit (0-9)',
      symbol: 'Symbol (!, @, #, ...)',
      'no-repeat': 'No 3+ repeated characters',
      'not-common': 'Not a common password',
    },
    warningsTitle: 'Warnings',
    warning: (w) => ({
      common: 'This password is on the most-common list ("' + w.detail + '"). Attackers try it first.',
      'common-part': 'Contains the common password "' + w.detail + '". Attackers try that part first.',
      'common-word': 'Contains the dictionary word "' + w.detail + '".',
      keyboard: 'Contains the keyboard walk "' + w.detail + '".',
      sequence: 'Contains the sequence "' + w.detail + '".',
      repeat: 'Repeated characters "' + w.detail + '".',
      year: 'Contains the year ' + w.detail + ', which is easy to guess.',
      date: 'Contains the date ' + w.detail + '.',
      short: 'Only ' + w.detail + ' characters long.',
    }[w.type] || ''),
    tipsTitle: 'How to make it stronger',
    tip: (t) => ({
      'avoid-common': 'Do not use a password from the most-common lists.',
      'avoid-common-part': 'Remove the common password "' + t.detail + '" hidden inside it.',
      'add-length': 'Add ' + t.detail + ' more characters to reach 12.',
      'add-upper': 'Add an uppercase letter (A-Z).',
      'add-lower': 'Add a lowercase letter (a-z).',
      'add-digit': 'Add a digit (0-9).',
      'add-symbol': 'Add a symbol such as !, @, # or %.',
      'break-repeat': 'Break up the repeated characters "' + t.detail + '".',
      'avoid-word': 'Avoid the dictionary word "' + t.detail + '".',
      'avoid-keyboard': 'Avoid keyboard patterns like "' + t.detail + '".',
      'avoid-sequence': 'Avoid sequences like "' + t.detail + '".',
      'avoid-year': 'Avoid the year ' + t.detail + '.',
      'avoid-date': 'Avoid the date ' + t.detail + '.',
      'strong-keep': 'Strong password. Store it in a password manager and never reuse it.',
    }[t.code] || ''),
    privacy: 'Privacy: the check runs entirely in your browser. Your password is never sent, stored or logged.',
    lookalike: 'Tip: test a lookalike, not a real password you use. Change a few characters first.',
    seeAlso: 'More security tools',
    siblings: [
      { href: '/tools/password-generator', label: 'Password Generator' },
      { href: '/tools/uuid-generator', label: 'UUID Generator' },
      { href: '/tools/regex-tester', label: 'Regex Tester' },
      { href: '/tools/json-formatter', label: 'JSON Formatter' },
    ],
    summaryPrefix: 'Password strength: ',
    summaryEntropy: 'Entropy: ',
    summaryCrack: 'Estimated crack time: ',
    summaryChecklist: 'Checklist: ',
    summaryOf: ' of 8 passed. ',
    summarySuffix: 'Checked with the Free Password Strength Checker at The Utility Hub. No password included.',
  },
  es: {
    inputLabel: 'Contraseña a comprobar',
    inputPlaceholder: 'Escribe una contraseña para comprobarla, p. ej. Summer2024!!',
    show: 'Mostrar',
    hide: 'Ocultar',
    tryWeak: 'Probar un ejemplo débil',
    tryStrong: 'Probar un ejemplo fuerte',
    generate: 'Generar una contraseña fuerte',
    copySummary: 'Copiar resumen del puntaje',
    copied: '¡Copiado!',
    empty: 'Escribe una contraseña arriba para ver su puntaje, entropía y tiempo de descifrado.',
    score: 'Puntaje',
    outOf: 'sobre 100',
    entropy: 'Entropía',
    bits: 'bits',
    length: 'Longitud',
    chars: 'caracteres',
    pool: 'Conjunto de caracteres',
    crackTitle: 'Tiempo estimado de descifrado',
    crackNote: 'Las estimaciones suponen las tasas de intentos indicadas y que la contraseña es aleatoria aparte de los patrones encontrados. Los ataques de diccionario y por reglas descifran las contraseñas con patrones mucho más rápido.',
    scenarios: {
      throttled: 'En línea, con límite de intentos',
      unthrottled: 'En línea, sin límite',
      slowHash: 'Sin conexión, hash lento (bcrypt)',
      fastHash: 'Sin conexión, hash rápido (MD5)',
    },
    rates: {
      throttled: 'unos 100 intentos/s',
      unthrottled: 'unos 1.000 intentos/s',
      slowHash: 'unos 10 intentos/s',
      fastHash: 'unos 10.000 millones intentos/s',
    },
    checklistTitle: 'Lista de fortaleza',
    checklist: {
      len8: 'Al menos 8 caracteres',
      len12: 'Al menos 12 caracteres',
      lower: 'Minúscula (a-z)',
      upper: 'Mayúscula (A-Z)',
      digit: 'Número (0-9)',
      symbol: 'Símbolo (!, @, #, ...)',
      'no-repeat': 'Sin 3+ caracteres repetidos',
      'not-common': 'No es una contraseña común',
    },
    warningsTitle: 'Advertencias',
    warning: (w) => ({
      common: 'Esta contraseña está en la lista de las más comunes ("' + w.detail + '"). Los atacantes la prueban primero.',
      'common-part': 'Contiene la contraseña común "' + w.detail + '". Los atacantes prueban esa parte primero.',
      'common-word': 'Contiene la palabra de diccionario "' + w.detail + '".',
      keyboard: 'Contiene el recorrido de teclado "' + w.detail + '".',
      sequence: 'Contiene la secuencia "' + w.detail + '".',
      repeat: 'Caracteres repetidos "' + w.detail + '".',
      year: 'Contiene el año ' + w.detail + ', fácil de adivinar.',
      date: 'Contiene la fecha ' + w.detail + '.',
      short: 'Solo tiene ' + w.detail + ' caracteres.',
    }[w.type] || ''),
    tipsTitle: 'Cómo hacerla más fuerte',
    tip: (t) => ({
      'avoid-common': 'No uses una contraseña de las listas más comunes.',
      'avoid-common-part': 'Quita la contraseña común "' + t.detail + '" escondida dentro.',
      'add-length': 'Agrega ' + t.detail + ' caracteres más para llegar a 12.',
      'add-upper': 'Agrega una mayúscula (A-Z).',
      'add-lower': 'Agrega una minúscula (a-z).',
      'add-digit': 'Agrega un número (0-9).',
      'add-symbol': 'Agrega un símbolo como !, @, # o %.',
      'break-repeat': 'Separa los caracteres repetidos "' + t.detail + '".',
      'avoid-word': 'Evita la palabra de diccionario "' + t.detail + '".',
      'avoid-keyboard': 'Evita patrones de teclado como "' + t.detail + '".',
      'avoid-sequence': 'Evita secuencias como "' + t.detail + '".',
      'avoid-year': 'Evita el año ' + t.detail + '.',
      'avoid-date': 'Evita la fecha ' + t.detail + '.',
      'strong-keep': 'Contraseña fuerte. Guárdala en un gestor de contraseñas y no la reutilices.',
    }[t.code] || ''),
    privacy: 'Privacidad: la comprobación corre por completo en tu navegador. Tu contraseña nunca se envía, se guarda ni se registra.',
    lookalike: 'Consejo: prueba una parecida, no una contraseña real que uses. Cambia algunos caracteres primero.',
    seeAlso: 'Más herramientas de seguridad',
    siblings: [
      { href: '/es/tools/generador-de-contrasenas-aleatorias', label: 'Generador de Contraseñas' },
      { href: '/es/tools/generador-de-uuid', label: 'Generador de UUID' },
      { href: '/es/tools/probador-de-regex', label: 'Probador de Regex' },
      { href: '/es/tools/formateador-json', label: 'Formateador JSON' },
    ],
    summaryPrefix: 'Fortaleza de contraseña: ',
    summaryEntropy: 'Entropía: ',
    summaryCrack: 'Tiempo estimado de descifrado: ',
    summaryChecklist: 'Lista: ',
    summaryOf: ' de 8 superados. ',
    summarySuffix: 'Comprobado con el Comprobador de Fortaleza de Contraseña gratis de The Utility Hub. Sin contraseña incluida.',
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
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: '1rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  boxSizing: 'border-box',
};

export default function PasswordStrengthTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => analyzePassword(pw), [pw]);
  const label = LABELS[result.label][lang] || LABELS[result.label].en;
  const color = BAR_COLORS[result.label];
  const passedCount = result.checklist.filter((c) => c.pass).length;

  const copySummary = async () => {
    if (!pw) return;
    const crack = result.crackTimes
      .map((c) => t.scenarios[c.id] + ' (' + t.rates[c.id] + '): ' + formatDurationText(c.duration, lang))
      .join('; ');
    const text = t.summaryPrefix + label + ' (' + result.score + '/100). '
      + t.summaryEntropy + result.entropy + ' ' + t.bits + '. '
      + t.summaryCrack + crack + '. '
      + t.summaryChecklist + passedCount + t.summaryOf + t.summarySuffix;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.inputLabel}</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <input
          type={show ? 'text' : 'password'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder={t.inputPlaceholder}
          autoComplete="off"
          spellCheck={false}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="button" onClick={() => setShow(!show)} style={btnStyle}>{show ? t.hide : t.show}</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => setPw(SAMPLE_WEAK)} style={btnStyle}>{t.tryWeak}</button>
        <button type="button" onClick={() => setPw(randomStrongPassword())} style={btnStyle}>{t.tryStrong}</button>
        <Link href={lang === 'es' ? '/es/tools/generador-de-contrasenas-aleatorias' : '/tools/password-generator'} style={{ ...primaryBtnStyle, textDecoration: 'none', display: 'inline-block' }}>{t.generate}</Link>
        <button type="button" onClick={copySummary} disabled={!pw} style={btnStyle}>{copied ? t.copied : t.copySummary}</button>
      </div>

      {!pw ? (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 18 }}>{t.empty}</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{result.score}</span>
            <span style={{ color: '#6b7280' }}>{t.outOf}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{label}</span>
          </div>
          <div style={{ height: 12, borderRadius: 6, background: '#e5e7eb', overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: result.score + '%', height: '100%', background: color, transition: 'width 0.2s' }} />
          </div>
          <p style={{ color: '#374151', fontSize: '0.95rem', marginTop: 12 }}>
            {t.entropy}: <strong>{result.entropy} {t.bits}</strong>
            {' · ' + t.length + ': ' + result.length + ' ' + t.chars}
            {' · ' + t.pool + ': ' + result.poolSize}
          </p>

          <h3 style={{ fontSize: '1.05rem', marginTop: 22, marginBottom: 8 }}>{t.crackTitle}</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {result.crackTimes.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                <span>{t.scenarios[c.id]} <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>({t.rates[c.id]})</span></span>
                <strong>{formatDurationText(c.duration, lang)}</strong>
              </div>
            ))}
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 8 }}>{t.crackNote}</p>

          <h3 style={{ fontSize: '1.05rem', marginTop: 22, marginBottom: 8 }}>{t.checklistTitle} ({passedCount}/8)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 6 }}>
            {result.checklist.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: c.pass ? '#f0fdf4' : '#fef2f2' }}>
                <span style={{ color: c.pass ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{c.pass ? '✓' : '✗'}</span>
                <span>{t.checklist[c.id]}</span>
              </div>
            ))}
          </div>

          {result.warnings.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 8, color: '#991b1b' }}>{t.warningsTitle}</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {result.warnings.map((w, i) => (
                  <li key={i} style={{ color: '#991b1b', marginBottom: 4 }}>{t.warning(w)}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{t.tipsTitle}</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{t.tip(tip)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 18 }}>🔒 {t.privacy}</p>
      <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 6 }}>⚠️ {t.lookalike}</p>

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
