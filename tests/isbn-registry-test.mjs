import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { isbnStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('isbn-validator');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'isbnStats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'isbn-validator'));
t('EN category', () => assert.equal(en.category, 'Developer Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-26'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.tagline + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN metaTitle matches house pattern', () => assert.equal(en.metaTitle, 'ISBN Validator and Converter Online Free [ISBN-10 and ISBN-13, No Signup]'));
t('EN explainer links Barcode Generator', () => assert.ok(en.explainer.includes('Barcode Generator')));
t('EN explainer links QR Code Generator', () => assert.ok(en.explainer.includes('QR Code Generator')));
t('EN explainer links Hash Generator', () => assert.ok(en.explainer.includes('Hash Generator')));
t('EN explainer is honest about 979 having no ISBN-10', () => assert.ok(en.explainer.includes('a 979 book has no ISBN-10 form')));
t('EN explainer is honest about hyphenation', () => assert.ok(en.explainer.includes('full hyphenation needs the publisher range table')));
t('EN keywords include isbn validator', () => assert.ok(en.keywords.includes('isbn validator')));
t('EN keywords include isbn check digit calculator', () => assert.ok(en.keywords.includes('isbn check digit calculator')));

const es = getToolEs('validador-de-isbn');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'isbn-validator'));
t('ES calcKey', () => assert.equal(es.calcKey, 'isbnStats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'isbn-validator'));
t('ES category', () => assert.equal(es.category, 'Herramientas de Desarrollo'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.tagline + es.faqs.map((f) => f.q + f.a).join(''))));
t('ES metaTitle matches house pattern', () => assert.equal(es.metaTitle, 'Validador y Convertidor de ISBN en Línea Gratis [ISBN-10 e ISBN-13, Sin Registro]'));
t('ES name', () => assert.equal(es.name, 'Validador y Convertidor de ISBN'));
t('ES explainer is honest about 979', () => assert.ok(es.explainer.includes('no tiene forma ISBN-10')));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['isbn-validator'], 'validador-de-isbn'));
t('hreflang resolves both ways', () => {
  assert.equal(getToolEs(TOOL_SLUG_ES['isbn-validator']).enSlug, 'isbn-validator');
  assert.equal(getTool('isbn-validator').slug, 'isbn-validator');
});

const r = isbnStats({}, 'en');
t('isbnStats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('isbnStats note is substantive', () => assert.ok(r.note.length > 50));
const rEs = isbnStats({}, 'es');
t('isbnStats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('isbn-registry: ' + n + '/' + n + ' passed');
