/* Readability analysis - pure functions, no DOM.
   Six English formulas (Flesch Reading Ease, Flesch-Kincaid Grade,
   Gunning Fog, SMOG, Coleman-Liau, ARI) plus two Spanish formulas
   (Fernandez-Huerta, Szigriszt-Pazos). Syllable counting is a
   vowel-group heuristic with silent-e and -ed handling: an estimate,
   not a dictionary lookup. */

const VOWELS = 'aeiouyàáâäèéêëìíîïòóôöùúûüāēīōū';
const VOWEL_RE = new RegExp('[' + VOWELS + ']+', 'gu');
const ABBREV = ['mr', 'mrs', 'ms', 'dr', 'st', 'jr', 'sr', 'vs', 'etc', 'e.g', 'i.e', 'no', 'fig', 'vol', 'pp', 'u.s', 'u.k'];

export function splitSentences(text) {
  const t = String(text || '').trim();
  if (!t) return [];
  // Protect common abbreviations so "Dr. Smith" does not split.
  let guarded = t;
  for (const ab of ABBREV) {
    const re = new RegExp('\\b' + ab.replace(/\./g, '\\.') + '\\.', 'gi');
    guarded = guarded.replace(re, (m) => m.replace(/\./g, '∯'));
  }
  const parts = guarded.match(/[^.!?…]+[.!?…]+["'”’)\]]*\s*|[^.!?…]+$/g) || [];
  return parts
    .map((s) => s.replace(/∯/g, '.').trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

export function splitWords(text) {
  const t = String(text || '');
  return t.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
}

export function countSyllables(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-zàáâäèéêëìíîïòóôöùúûüāēīōū]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.match(VOWEL_RE) || [];
  let n = groups.length;
  // Spanish hiatus: an accented weak vowel (í, ú) next to another vowel
  // breaks the diphthong into two syllables (había = 3, María = 3).
  // An accented strong vowel (á, é, ó) does not (también = 2).
  const hiatus = w.match(/[íú][aeiouáéíóúü]|[aeiouáéíóúü][íú]/g) || [];
  n += hiatus.length;
  // Silent trailing e: "make" is 1 syllable, but "syllable" keeps its
  // final -le syllable when a consonant precedes the "le".
  if (w.endsWith('e')) {
    if (w.endsWith('le') && w.length > 2 && !VOWELS.includes(w[w.length - 3])) {
      // keep: table, syllable, simple
    } else if (n > 1) {
      n -= 1;
    }
  }
  // Trailing -ed is usually silent ("walked" = 1) except after t/d
  // ("wanted", "needed" keep the extra syllable).
  if (w.endsWith('ed') && n > 1) {
    const before = w[w.length - 3];
    if (before && before !== 't' && before !== 'd') n -= 1;
  }
  return Math.max(1, n);
}

export function analyzeText(text) {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const sentenceCount = sentences.length;
  const wordCount = words.length;
  const syllableCounts = words.map(countSyllables);
  const syllables = syllableCounts.reduce((a, b) => a + b, 0);
  const letters = words.reduce((a, w) => a + w.replace(/[^a-zàáâäèéêëìíîïòóôöùúûüāēīōū]/gi, '').length, 0);
  const characters = String(text || '').replace(/\s/g, '').length;
  const complexWords = syllableCounts.filter((n) => n >= 3).length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgSyllablesPerWord = wordCount > 0 ? syllables / wordCount : 0;
  const longSentences = sentences
    .map((sentence, i) => ({ index: i, sentence, words: splitWords(sentence).length }))
    .filter((s) => s.words > 25)
    .slice(0, 10)
    .map((s) => {
      // Character offset of this sentence in the original text, so the UI
      // can highlight it. Search sequentially to handle repeats.
      const start = String(text || '').indexOf(s.sentence);
      return { ...s, start: start < 0 ? 0 : start, end: (start < 0 ? 0 : start) + s.sentence.length };
    });

  const hasData = wordCount > 0 && sentenceCount > 0;
  const r = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : null);

  const flesch = hasData ? 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord : null;
  const fleschKincaid = hasData ? 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59 : null;
  const fog = hasData ? 0.4 * (avgWordsPerSentence + 100 * (complexWords / wordCount)) : null;
  const smog = hasData
    ? 1.043 * Math.sqrt((complexWords * 30) / sentenceCount) + 3.1291
    : null;
  const colemanLiau = hasData
    ? 0.0588 * (letters / wordCount) * 100 - 0.296 * (sentenceCount / wordCount) * 100 - 15.8
    : null;
  const ari = hasData
    ? 4.71 * (characters / wordCount) + 0.5 * avgWordsPerSentence - 21.43
    : null;
  // Spanish formulas: P = syllables per 100 words, F = sentences per 100 words.
  const p100 = wordCount > 0 ? (syllables / wordCount) * 100 : 0;
  const f100 = wordCount > 0 ? (sentenceCount / wordCount) * 100 : 0;
  const fernandezHuerta = hasData ? 206.84 - 0.6 * p100 - 1.02 * f100 : null;
  const szigrisztPazos = hasData ? 206.835 - 62.3 * avgSyllablesPerWord - avgWordsPerSentence : null;

  return {
    words: wordCount,
    sentences: sentenceCount,
    syllables,
    characters,
    letters,
    complexWords,
    avgWordsPerSentence: r(avgWordsPerSentence),
    avgSyllablesPerWord: r(avgSyllablesPerWord),
    longSentences,
    flesch: r(flesch),
    fleschKincaid: r(fleschKincaid),
    fog: r(fog),
    smog: r(smog),
    colemanLiau: r(colemanLiau),
    ari: r(ari),
    fernandezHuerta: r(fernandezHuerta),
    szigrisztPazos: r(szigrisztPazos),
  };
}

export function fleschLabel(score) {
  if (score == null) return null;
  if (score >= 90) return 'veryEasy';
  if (score >= 80) return 'easy';
  if (score >= 70) return 'fairlyEasy';
  if (score >= 60) return 'standard';
  if (score >= 50) return 'fairlyDifficult';
  if (score >= 30) return 'difficult';
  return 'veryDifficult';
}

// Target grade bands (Flesch-Kincaid grade) per audience.
export const AUDIENCES = {
  general: { min: 6, max: 8 },
  school: { min: 4, max: 6 },
  college: { min: 12, max: 14 },
  technical: { min: 14, max: 16 },
};

export function audienceFit(grade, audience) {
  const band = AUDIENCES[audience];
  if (grade == null || !band) return null;
  if (grade >= band.min && grade <= band.max) return { status: 'onTarget', diff: 0 };
  if (grade < band.min) return { status: 'easier', diff: Math.round((band.min - grade) * 10) / 10 };
  return { status: 'harder', diff: Math.round((grade - band.max) * 10) / 10 };
}

export const SAMPLE_EN =
  'Good writing is clear writing. Short sentences help readers follow your ideas without getting lost. When a sentence runs too long, with clause after clause piled on top of each other, the reader has to work much harder to hold the whole thought in mind, and the message often gets lost along the way. Use simple words when a simple word will do. Your reader will thank you for it.';
export const SAMPLE_ES =
  'Escribir bien es escribir con claridad. Las oraciones cortas ayudan al lector a seguir tus ideas sin perderse. Cuando una oración se alarga demasiado, con cláusula tras cláusula acumulada una sobre otra, el lector tiene que esforzarse mucho más para retener todo el pensamiento, y el mensaje suele perderse por el camino. Usa palabras sencillas cuando una palabra sencilla basta. Tu lector te lo agradecerá.';
