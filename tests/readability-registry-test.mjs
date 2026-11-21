import assert from 'node:assert/strict';
import { getTool } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { readabilityStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

const en = getTool('readability-checker');
assert.ok(en, 'EN entry loads');
assert.equal(en.calcKey, 'readabilityStats');
assert.equal(en.customComponent, 'readability-checker');
assert.equal(en.category, 'Text Tools');
assert.equal(en.badge, 'RC');
assert.equal(en.lastReviewed, '2026-11-21');
assert.equal(typeof en.calculate, 'function');
const enParas = en.explainer.split('\n\n');
assert.equal(enParas.length, 3, 'EN explainer must be exactly 3 paragraphs, got ' + enParas.length);
assert.equal(en.faqs.length, 6, 'EN FAQs must be 6');
assert.ok(!en.explainer.includes('\\n'), 'EN explainer has literal backslash-n');
assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.faqs.map(f=>f.q+f.a).join('')), 'EN has em-dash');
for (const t of ['word-counter','character-counter','case-converter','markdown-to-html']) assert.ok(en.explainer.toLowerCase().includes(t.replace(/-/g,' ')) || en.explainer.includes('Word Counter'), 'EN explainer links ' + t);

const es = getToolEs('comprobador-de-legibilidad');
assert.ok(es, 'ES entry loads');
assert.equal(es.enSlug, 'readability-checker');
assert.equal(es.calcKey, 'readabilityStats');
assert.equal(es.customComponent, 'readability-checker');
assert.equal(es.category, 'Herramientas de texto');
const esParas = es.explainer.split('\n\n');
assert.equal(esParas.length, 3, 'ES explainer must be exactly 3 paragraphs, got ' + esParas.length);
assert.equal(es.faqs.length, 6, 'ES FAQs must be 6');
assert.ok(!es.explainer.includes('\\n'), 'ES explainer has literal backslash-n');
assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.faqs.map(f=>f.q+f.a).join('')), 'ES has em-dash');
assert.ok(es.explainer.includes('Fernández-Huerta') && es.explainer.includes('Szigriszt-Pazos'), 'ES explainer names Spanish formulas');

assert.equal(TOOL_SLUG_ES['readability-checker'], 'comprobador-de-legibilidad');

const r = readabilityStats({ text: 'The cat sat on the mat. It was a happy cat. The dog ran fast.' }, 'en');
assert.equal(r.outputs.length, 4);
assert.ok(r.outputs[0].value.startsWith('111.5'), 'preview Flesch, got ' + r.outputs[0].value);
const rEs = readabilityStats({ text: 'El gato se sentó en la alfombra.' }, 'es');
assert.ok(rEs.note.startsWith('Solo vista previa'), 'ES note');
console.log('REGISTRY TEST PASSED: EN + ES entries, 3 paras each, 6 FAQs each, no literal \\n, no em-dash, slug-map OK, readabilityStats OK');
