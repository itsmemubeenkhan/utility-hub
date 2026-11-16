/* Pure password-strength analysis (no DOM, so it runs in both browser
   and node). 100% client-side: nothing is sent or stored anywhere.
   Entropy is length x log2(pool size), where the pool is the character
   classes actually present (lower 26, upper 26, digits 10, symbols 32).
   The score starts from entropy (capped at 100) and loses points for
   guessable patterns, because entropy alone overrates passwords built
   from dictionary words, keyboard walks, sequences or years. Crack
   times are estimates: average guesses = 2^(entropy-1) at the stated
   rate, and a password on the common list is treated as guessable in
   about 5 tries (exact match) or 5,000 tries (contains a common one). */

export const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345', '12345678', 'qwerty', '1234567', '111111', '1234567890', '123123',
  'abc123', '1234', 'password1', 'iloveyou', '1q2w3e4r', '000000', 'qwerty123', 'zaq12wsx', 'dragon', 'monkey',
  'letmein', '696969', 'abcdef', 'mustang', 'michael', '654321', 'football', '123321', 'ashley', 'bailey',
  'passw0rd', 'shadow', '123456a', 'sunshine', 'master', 'superman', 'qazwsx', 'michael1', 'jordan23', '123456789a',
  'jesus', 'hunter', 'buster', 'soccer', 'harley', 'andrew', 'tigger', 'sunshine1', 'charlie', 'thomas',
  'jordan', 'hockey', 'ranger', 'daniel', 'starwars', 'klaster', '112233', 'george', 'asshole', 'computer',
  'michelle', 'jessica', 'pepper', '11111111', 'zxcvbnm', '555555', '1111111111', '131313', 'freedom', '777777',
  'pass', 'fuck', 'maggie', '159753', 'aaaaaa', 'ginger', 'princess', 'joshua', 'cheese', 'amanda',
  'summer', 'love', 'ashley1', '6969', 'nicole', 'chelsea', 'biteme', 'matthew', 'access', 'yankees',
  '987654321', 'dallas', 'austin', 'thunder', 'taylor', 'matrix', 'william', 'corvette', 'hello', 'martin',
  'heather', 'secret', 'fucker', 'merlin', 'diamond', '1234qwer', 'gfhjkm', 'hammer', 'silver', '222222',
  '888888', 'anthony', 'justin', 'test', 'bailey1', 'q1w2e3r4t5', 'daniel1', '7777777', 'george1', 'computer1', 'admin',
]);

/* Dictionary words that make a password guessable when embedded in it.
   Only words of 4+ letters are matched, so short fragments do not
   false-positive. */
export const COMMON_WORDS = [
  'password', 'summer', 'winter', 'spring', 'autumn', 'hello', 'secret', 'welcome', 'admin', 'login',
  'monkey', 'dragon', 'football', 'sunshine', 'master', 'superman', 'michael', 'ashley', 'bailey', 'shadow',
  'princess', 'iloveyou', 'qwerty', 'hunter', 'soccer', 'hockey', 'ranger', 'thomas', 'daniel', 'jordan',
  'charlie', 'jessica', 'matthew', 'martin', 'heather', 'diamond', 'silver', 'hammer', 'merlin', 'matrix',
  'thunder', 'dallas', 'austin', 'taylor', 'william', 'anthony', 'justin', 'nicole', 'chelsea', 'maggie',
  'ginger', 'cheese', 'amanda', 'joshua', 'buster', 'harley', 'andrew', 'tigger', 'george', 'pepper',
  'freedom', 'computer', 'access', 'yankees', 'correct', 'horse', 'battery', 'staple',
  'january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november',
  'december',
];

const KEYBOARD_ROWS = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890',
  'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz', '0987654321',
  '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik,9ol.0p;/',
  '/;p0.lo9m8n7b6v5c4x3z2a1s9q8w7e6r5t4y3u2i1o0p',
];

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

export const SAMPLE_WEAK = 'password123';
export const SAMPLE_STRONG = 'K7$mQ2!vX9#pL4&wR8z';

export const LABEL_KEYS = ['very-weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];

export function labelForScore(score) {
  if (score < 20) return 'very-weak';
  if (score < 40) return 'weak';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  if (score < 90) return 'strong';
  return 'very-strong';
}

/* Character pool from the classes actually present in the password. */
export function poolSize(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return pool;
}

export function entropyBits(pw) {
  const pool = poolSize(pw);
  if (!pw.length || !pool) return 0;
  return pw.length * Math.log2(pool);
}

function findKeyboardWalk(pwLower) {
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i + 3 <= row.length; i += 1) {
      const walk = row.slice(i, i + 3);
      if (pwLower.includes(walk)) return walk;
    }
  }
  return null;
}

function findSequence(pwLower) {
  const sources = [ALPHA, DIGITS, [...ALPHA].reverse().join(''), [...DIGITS].reverse().join('')];
  for (const src of sources) {
    for (let i = 0; i + 3 <= src.length; i += 1) {
      const seq = src.slice(i, i + 3);
      if (pwLower.includes(seq)) return seq;
    }
  }
  return null;
}

function findCommonWord(pwLower, exclude) {
  for (const word of COMMON_WORDS) {
    if (word.length >= 4 && word !== exclude && pwLower.includes(word)) return word;
  }
  return null;
}

function findCommonPart(pwLower) {
  for (const common of COMMON_PASSWORDS) {
    if (common.length >= 6 && pwLower.includes(common)) return common;
  }
  return null;
}

function findYear(pw) {
  const m = pw.match(/(19|20)\d{2}/);
  return m ? m[0] : null;
}

function findDate(pw) {
  /* With a year: MMDDYYYY or YYYYMMDD. Without a year: MMDD bounded by
     non-digits or string edges, so plain digit runs do not false-positive. */
  let m = pw.match(/(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])((19|20)\d{2})/);
  if (m) return m[0];
  m = pw.match(/(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/);
  if (m) return m[0];
  m = pw.match(/(^|\D)(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(\D|$)/);
  if (m) return m[2] + m[3];
  return null;
}

function findRepeat(pw) {
  const m = pw.match(/(.)\1{2,}/);
  return m ? m[0] : null;
}

/* Attack scenarios: guesses per second. Labelled as estimates in the UI;
   bcrypt is slow by design (about 10 guesses/sec here), MD5 is fast
   (about 10 billion/sec). */
export const ATTACK_RATES = [
  { id: 'throttled', rate: 100 },
  { id: 'unthrottled', rate: 1000 },
  { id: 'slowHash', rate: 10 },
  { id: 'fastHash', rate: 10_000_000_000 },
];

const YEAR_SECONDS = 365.25 * 24 * 3600;
const MONTH_SECONDS = 30 * 24 * 3600;

/* Human-readable duration as { value, unit }. value is null for instant.
   Units: instant, second, minute, hour, day, month, year, century,
   thousand-years, million-years, billion-years, trillion-years. */
export function formatDuration(seconds) {
  if (!seconds || seconds < 1) return { value: null, unit: 'instant' };
  if (seconds < 60) return { value: Math.round(seconds), unit: 'second' };
  if (seconds < 3600) return { value: Math.round(seconds / 60), unit: 'minute' };
  if (seconds < 86400) return { value: Math.round(seconds / 3600), unit: 'hour' };
  if (seconds < MONTH_SECONDS) return { value: Math.round(seconds / 86400), unit: 'day' };
  if (seconds < YEAR_SECONDS) return { value: Math.round(seconds / MONTH_SECONDS), unit: 'month' };
  const years = seconds / YEAR_SECONDS;
  if (years < 100) return { value: Math.round(years), unit: 'year' };
  if (years < 1000) return { value: Math.round(years / 100), unit: 'century' };
  if (years < 1e6) return { value: Math.round(years / 1000), unit: 'thousand-years' };
  if (years < 1e9) return { value: round1(years / 1e6), unit: 'million-years' };
  if (years < 1e12) return { value: round1(years / 1e9), unit: 'billion-years' };
  return { value: round1(years / 1e12), unit: 'trillion-years' };
}

function round1(n) {
  return n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
}

export function analyzePassword(pw) {
  const password = String(pw || '');
  const lower = password.toLowerCase();
  const length = password.length;
  const pool = poolSize(password);
  const entropy = entropyBits(password);

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const repeat = findRepeat(password);
  /* Exact match on the common list vs merely containing one: an exact
     match is hopeless (score 5), a substring is a deduction that grows
     with how much of the password the common part covers. The same
     token is never deducted twice (word check excludes the common
     part). */
  const commonExact = COMMON_PASSWORDS.has(lower) ? lower : null;
  const commonPart = commonExact ? null : findCommonPart(lower);
  const word = findCommonWord(lower, commonPart);
  const walk = findKeyboardWalk(lower);
  const sequence = findSequence(lower);
  const year = findYear(password);
  const date = findDate(password);

  const warnings = [];
  if (commonExact) warnings.push({ type: 'common', detail: commonExact });
  if (commonPart) warnings.push({ type: 'common-part', detail: commonPart });
  if (word) warnings.push({ type: 'common-word', detail: word });
  if (walk) warnings.push({ type: 'keyboard', detail: walk });
  if (sequence) warnings.push({ type: 'sequence', detail: sequence });
  if (repeat) warnings.push({ type: 'repeat', detail: repeat });
  if (date) warnings.push({ type: 'date', detail: date });
  else if (year) warnings.push({ type: 'year', detail: year });
  if (length > 0 && length < 8) warnings.push({ type: 'short', detail: String(length) });

  /* Score: entropy capped at 100, minus pattern deductions. A password
     on the common list scores 5 no matter how long it is. Short
     passwords cap at 30: length is the cheapest strength there is. */
  let score;
  if (commonExact) {
    score = 5;
  } else {
    score = Math.round(Math.min(entropy, 100));
    if (commonPart) score -= commonPart.length / length >= 0.6 ? 30 : 15;
    if (word) score -= 20;
    if (walk) score -= 15;
    if (sequence) score -= 10;
    if (repeat) score -= 10;
    if (date) score -= 15;
    else if (year) score -= 10;
    if (length > 0 && length < 8) score = Math.min(score, 30);
    score = Math.max(0, Math.min(100, score));
  }

  const checklist = [
    { id: 'len8', label: 'len8', pass: length >= 8 },
    { id: 'len12', label: 'len12', pass: length >= 12 },
    { id: 'lower', label: 'lower', pass: hasLower },
    { id: 'upper', label: 'upper', pass: hasUpper },
    { id: 'digit', label: 'digit', pass: hasDigit },
    { id: 'symbol', label: 'symbol', pass: hasSymbol },
    { id: 'no-repeat', label: 'no-repeat', pass: !repeat },
    { id: 'not-common', label: 'not-common', pass: !commonExact },
  ];

  const tips = [];
  if (commonExact) tips.push({ code: 'avoid-common', detail: commonExact });
  if (commonPart) tips.push({ code: 'avoid-common-part', detail: commonPart });
  if (length < 12) tips.push({ code: 'add-length', detail: String(12 - length) });
  if (!hasUpper) tips.push({ code: 'add-upper', detail: '' });
  if (!hasLower) tips.push({ code: 'add-lower', detail: '' });
  if (!hasDigit) tips.push({ code: 'add-digit', detail: '' });
  if (!hasSymbol) tips.push({ code: 'add-symbol', detail: '' });
  if (repeat) tips.push({ code: 'break-repeat', detail: repeat });
  if (word) tips.push({ code: 'avoid-word', detail: word });
  if (walk) tips.push({ code: 'avoid-keyboard', detail: walk });
  if (sequence) tips.push({ code: 'avoid-sequence', detail: sequence });
  if (date) tips.push({ code: 'avoid-date', detail: date });
  else if (year) tips.push({ code: 'avoid-year', detail: year });
  if (score >= 90) tips.push({ code: 'strong-keep', detail: '' });

  /* Average guesses to crack: half the keyspace, except a common
     password, which attackers try first: an exact match in about 5
     tries, a password containing a common one in about 5,000 tries
     (dictionary plus simple mangling rules). */
  const guesses = commonExact
    ? 5
    : commonPart
      ? 5000
      : Math.pow(2, Math.max(entropy - 1, 0));
  const crackTimes = ATTACK_RATES.map(({ id, rate }) => ({
    id,
    rate,
    duration: formatDuration(guesses / rate),
  }));

  return {
    length,
    poolSize: pool,
    entropy: Math.round(entropy * 10) / 10,
    score,
    label: labelForScore(score),
    isCommon: Boolean(commonExact),
    warnings,
    checklist,
    tips,
    crackTimes,
  };
}

/* Random strong password for the "try a strong example" button.
   Uses the browser/Node crypto source when available. */
export function randomStrongPassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let out = '';
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint32Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i += 1) out += chars[bytes[i] % chars.length];
  } else {
    for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
