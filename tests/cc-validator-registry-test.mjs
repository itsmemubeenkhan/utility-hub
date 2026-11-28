import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { ccValidatorStats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('credit-card-validator');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'ccValidatorStats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'ccvalidator-credit-card'));
t('EN customComponent matches ccvalidator- dispatch prefix', () => assert.ok(en.customComponent.startsWith('ccvalidator-')));
t('EN category', () => assert.equal(en.category, 'Finance Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-28'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.tagline + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN metaTitle matches house pattern', () => assert.equal(en.metaTitle, 'Credit Card Validator Online Free [Luhn Check, Network Detection, No Signup]'));
t('EN explainer links Pay Stub Generator', () => assert.ok(en.explainer.includes('Pay Stub Generator')));
t('EN explainer links Salary Paycheck Calculator', () => assert.ok(en.explainer.includes('Salary Paycheck Calculator')));
t('EN explainer links Hash Generator', () => assert.ok(en.explainer.includes('Hash Generator')));
t('EN explainer links Base64 Encoder', () => assert.ok(en.explainer.includes('Base64 Encoder')));
t('EN explainer states the 4242 sum 80', () => assert.ok(en.explainer.includes('sum of 80')));
t('EN explainer states the 1-in-10 fact', () => assert.ok(en.explainer.includes('1 time in 10')));
t('EN explainer is honest about what a pass does not prove', () => assert.ok(en.explainer.includes('does not prove the card is real')));
t('EN explainer never asks for expiry or security code', () => assert.ok(en.explainer.includes('never asks for an expiry date')));
t('EN keywords include credit card validator', () => assert.ok(en.keywords.includes('credit card validator')));
t('EN keywords include luhn check', () => assert.ok(en.keywords.includes('luhn check')));

const es = getToolEs('validador-de-tarjeta-de-credito');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'credit-card-validator'));
t('ES calcKey', () => assert.equal(es.calcKey, 'ccValidatorStats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'ccvalidator-credit-card'));
t('ES customComponent matches ccvalidator- dispatch prefix', () => assert.ok(es.customComponent.startsWith('ccvalidator-')));
t('ES category', () => assert.equal(es.category, 'Herramientas de Finanzas'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.tagline + es.faqs.map((f) => f.q + f.a).join(''))));
t('ES metaTitle matches house pattern', () => assert.equal(es.metaTitle, 'Validador de Tarjeta de Crédito en Línea Gratis [Comprobación de Luhn, Detección de Red, Sin Registro]'));
t('ES name', () => assert.equal(es.name, 'Validador de Tarjeta de Crédito'));
t('ES explainer states the 4242 sum 80', () => assert.ok(es.explainer.includes('suma ponderada de 80')));
t('ES explainer states the 1-in-10 fact', () => assert.ok(es.explainer.includes('1 vez de cada 10')));
t('ES explainer is honest about what a pass does not prove', () => assert.ok(es.explainer.includes('No prueba que la tarjeta sea real')));
t('ES explainer never asks for expiry or security code', () => assert.ok(es.explainer.includes('nunca pide una fecha de vencimiento')));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['credit-card-validator'], 'validador-de-tarjeta-de-credito'));
t('hreflang resolves both ways', () => {
  assert.equal(getToolEs(TOOL_SLUG_ES['credit-card-validator']).enSlug, 'credit-card-validator');
  assert.equal(getTool('credit-card-validator').slug, 'credit-card-validator');
});

const r = ccValidatorStats({}, 'en');
t('ccValidatorStats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('ccValidatorStats note is substantive', () => assert.ok(r.note.length > 50));
t('ccValidatorStats detects 10 networks', () => assert.ok(r.outputs[0].value === '10'));
const rEs = ccValidatorStats({}, 'es');
t('ccValidatorStats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('cc-validator-registry: ' + n + '/' + n + ' passed');
