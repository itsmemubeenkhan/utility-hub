import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { binaryStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('binary-to-text-converter');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'binaryStats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'binary-convert'));
t('EN category', () => assert.equal(en.category, 'Developer Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-23'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN explainer links Base64', () => assert.ok(en.explainer.toLowerCase().includes('base64 encoder')));
t('EN explainer links hex', () => assert.ok(en.explainer.includes('Hex to RGB')));

const es = getToolEs('convertidor-de-binario-a-texto');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'binary-to-text-converter'));
t('ES calcKey', () => assert.equal(es.calcKey, 'binaryStats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'binary-convert'));
t('ES category', () => assert.equal(es.category, 'Herramientas de Desarrollo'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.faqs.map((f) => f.q + f.a).join(''))));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['binary-to-text-converter'], 'convertidor-de-binario-a-texto'));

const r = binaryStats({}, 'en');
t('binaryStats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('binaryStats note is substantive', () => assert.ok(r.note.length > 50));
const rEs = binaryStats({}, 'es');
t('binaryStats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('binary-registry: ' + n + '/' + n + ' passed');
