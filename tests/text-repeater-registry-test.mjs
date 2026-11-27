import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { textRepeaterStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('text-repeater');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'textRepeaterStats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'text-repeater'));
t('EN category', () => assert.equal(en.category, 'Text Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-27'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.tagline + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN metaTitle matches house pattern', () => assert.equal(en.metaTitle, 'Text Repeater Online Free [Repeat Text 1 to 10,000 Times, Emoji Safe, No Signup]'));
t('EN explainer links Case Converter', () => assert.ok(en.explainer.includes('Case Converter')));
t('EN explainer links Word Counter', () => assert.ok(en.explainer.includes('Word Counter')));
t('EN explainer links Character Counter', () => assert.ok(en.explainer.includes('Character Counter')));
t('EN explainer links Remove Duplicate Lines', () => assert.ok(en.explainer.includes('Remove Duplicate Lines')));
t('EN explainer is honest about spam', () => assert.ok(en.explainer.includes('platforms flag that as spam')));
t('EN explainer states the grapheme facts', () => assert.ok(en.explainer.includes('8 UTF-16 units')));
t('EN explainer states the cap', () => assert.ok(en.explainer.includes('500,000 characters')));
t('EN keywords include text repeater', () => assert.ok(en.keywords.includes('text repeater')));
t('EN keywords include repeat text online', () => assert.ok(en.keywords.includes('repeat text online')));

const es = getToolEs('repetidor-de-texto');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'text-repeater'));
t('ES calcKey', () => assert.equal(es.calcKey, 'textRepeaterStats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'text-repeater'));
t('ES category', () => assert.equal(es.category, 'Herramientas de texto'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.tagline + es.faqs.map((f) => f.q + f.a).join(''))));
t('ES metaTitle matches house pattern', () => assert.equal(es.metaTitle, 'Repetidor de Texto en Línea Gratis [Repetir Texto de 1 a 10.000 Veces, Seguro con Emoji, Sin Registro]'));
t('ES name', () => assert.equal(es.name, 'Repetidor de Texto'));
t('ES explainer is honest about spam', () => assert.ok(es.explainer.includes('lo marcan como spam')));
t('ES explainer states the cap', () => assert.ok(es.explainer.includes('500.000 caracteres')));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['text-repeater'], 'repetidor-de-texto'));
t('hreflang resolves both ways', () => {
  assert.equal(getToolEs(TOOL_SLUG_ES['text-repeater']).enSlug, 'text-repeater');
  assert.equal(getTool('text-repeater').slug, 'text-repeater');
});

const r = textRepeaterStats({}, 'en');
t('textRepeaterStats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('textRepeaterStats note is substantive', () => assert.ok(r.note.length > 50));
const rEs = textRepeaterStats({}, 'es');
t('textRepeaterStats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('text-repeater-registry: ' + n + '/' + n + ' passed');
