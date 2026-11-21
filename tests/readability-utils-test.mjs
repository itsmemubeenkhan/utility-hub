/* Node tests for lib/readability-utils.js. Run:
   node tests/readability-utils-test.mjs
   The 3-sentence vector below was computed BY HAND:
   "The cat sat on the mat. It was a happy cat. The dog ran fast."
   words 15, sentences 3, syllables 16, letters 44, non-space chars 47,
   complex words (3+ syllables) 0.
   Flesch RE = 206.835 - 1.015*5 - 84.6*(16/15) = 111.52
   FK Grade  = 0.39*5 + 11.8*(16/15) - 15.59 = -1.05
   Fog       = 0.4*(5 + 0) = 2.00
   SMOG      = 1.043*sqrt(0) + 3.1291 = 3.13
   Coleman   = 0.0588*293.333 - 0.296*20 - 15.8 = -4.47
   ARI       = 4.71*(47/15) + 0.5*5 - 21.43 = -4.17
   Fern-Huerta = 206.84 - 0.60*106.667 - 1.02*20 = 122.44
   Szigriszt = 206.835 - 62.3*(16/15) - 5 = 135.38 */
import assert from 'node:assert/strict';
import {
  analyzeText, audienceFit, countSyllables, fleschLabel,
  splitSentences, splitWords,
} from '../lib/readability-utils.js';

let passed = 0;
function ok(name, fn) { fn(); passed += 1; console.log(`ok - ${name}`); }
function near(actual, expected, tol = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} ± ${tol}, got ${actual}`);
}

const SAMPLE = 'The cat sat on the mat. It was a happy cat. The dog ran fast.';

ok('hand-computed 3-sentence vector: counts', () => {
  const a = analyzeText(SAMPLE);
  assert.equal(a.words, 15);
  assert.equal(a.sentences, 3);
  assert.equal(a.syllables, 16);
  assert.equal(a.letters, 44);
  assert.equal(a.characters, 47);
  assert.equal(a.complexWords, 0);
  assert.equal(a.avgWordsPerSentence, 5);
  near(a.avgSyllablesPerWord, 1.07);
  assert.deepEqual(a.longSentences, []);
});

ok('hand-computed 3-sentence vector: six English formulas', () => {
  const a = analyzeText(SAMPLE);
  near(a.flesch, 111.52);
  near(a.fleschKincaid, -1.05);
  near(a.fog, 2.0);
  near(a.smog, 3.13);
  near(a.colemanLiau, -4.47);
  near(a.ari, -4.17);
});

ok('hand-computed 3-sentence vector: Spanish formulas', () => {
  const a = analyzeText(SAMPLE);
  near(a.fernandezHuerta, 122.44);
  near(a.szigrisztPazos, 135.38);
});

ok('syllable counter edge cases', () => {
  assert.equal(countSyllables('the'), 1);
  assert.equal(countSyllables('beautiful'), 3);
  assert.equal(countSyllables('syllable'), 3);
  assert.equal(countSyllables('table'), 2);
  assert.equal(countSyllables('walked'), 1);
  assert.equal(countSyllables('wanted'), 2);
  assert.equal(countSyllables('make'), 1);
  assert.equal(countSyllables('reading'), 2);
  assert.equal(countSyllables('education'), 4);
  assert.equal(countSyllables('casa'), 2);
  assert.equal(countSyllables('árbol'), 2);
  assert.equal(countSyllables('había'), 3);
  assert.equal(countSyllables('también'), 2);
  assert.equal(countSyllables(''), 0);
});

ok('empty and one-word text do not crash or divide by zero', () => {
  const e = analyzeText('');
  assert.equal(e.words, 0);
  assert.equal(e.sentences, 0);
  assert.equal(e.flesch, null);
  assert.equal(e.ari, null);
  const o = analyzeText('Hello');
  assert.equal(o.words, 1);
  assert.equal(o.sentences, 1);
  assert.equal(o.syllables, 2);
  assert.ok(Number.isFinite(o.flesch));
});

ok('long sentences are listed (over 25 words, max 10)', () => {
  const long = 'This is a very long sentence with many many many many many many many many many many many many many many many words in it indeed yes indeed.';
  const a = analyzeText(long + ' Short one.');
  assert.equal(a.longSentences.length, 1);
  assert.equal(a.longSentences[0].words, 28);
  assert.equal(a.longSentences[0].index, 0);
});

ok('sentence splitting respects abbreviations', () => {
  assert.equal(splitSentences('Dr. Smith arrived. He stayed.').length, 2);
  assert.equal(splitWords('well-known test').length, 2);
  assert.equal(splitWords('').length, 0);
});

ok('flesch labels and audience fit', () => {
  assert.equal(fleschLabel(95), 'veryEasy');
  assert.equal(fleschLabel(65), 'standard');
  assert.equal(fleschLabel(20), 'veryDifficult');
  assert.equal(fleschLabel(null), null);
  assert.deepEqual(audienceFit(7, 'general'), { status: 'onTarget', diff: 0 });
  assert.equal(audienceFit(3, 'general').status, 'easier');
  assert.equal(audienceFit(14, 'general').status, 'harder');
  assert.equal(audienceFit(null, 'general'), null);
});

console.log(`\n${passed} readability tests passed`);
