import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { dedupeStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('remove-duplicate-lines');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'dedupeStats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'dedupe-lines'));
t('EN category', () => assert.equal(en.category, 'Developer Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-24'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.tagline + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN metaTitle matches house pattern', () => assert.equal(en.metaTitle, 'Remove Duplicate Lines Online Free [No Signup]'));
t('EN explainer links Text Diff Checker', () => assert.ok(en.explainer.includes('Text Diff Checker')));
t('EN explainer links Case Converter', () => assert.ok(en.explainer.includes('Case Converter')));

const es = getToolEs('eliminar-lineas-duplicadas');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'remove-duplicate-lines'));
t('ES calcKey', () => assert.equal(es.calcKey, 'dedupeStats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'dedupe-lines'));
t('ES category', () => assert.equal(es.category, 'Herramientas de Desarrollo'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.tagline + es.faqs.map((f) => f.q + f.a).join(''))));
t('ES metaTitle matches house pattern', () => assert.equal(es.metaTitle, 'Eliminar Líneas Duplicadas en Línea Gratis [Sin Registro]'));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['remove-duplicate-lines'], 'eliminar-lineas-duplicadas'));
t('hreflang resolves both ways', () => {
  assert.equal(getToolEs(TOOL_SLUG_ES['remove-duplicate-lines']).enSlug, 'remove-duplicate-lines');
  assert.equal(getTool('remove-duplicate-lines').slug, 'remove-duplicate-lines');
});

const r = dedupeStats({}, 'en');
t('dedupeStats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('dedupeStats note is substantive', () => assert.ok(r.note.length > 50));
const rEs = dedupeStats({}, 'es');
t('dedupeStats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('dedupe-registry: ' + n + '/' + n + ' passed');
