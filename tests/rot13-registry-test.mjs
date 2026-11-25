import assert from 'node:assert/strict';
import { getTool, TOOLS } from '/home/hatch/workspace/utility-hub/lib/tools.js';
import { getToolEs } from '/home/hatch/workspace/utility-hub/lib/tools.es.js';
import { TOOL_SLUG_ES } from '/home/hatch/workspace/utility-hub/lib/slug-map.js';
import { rot13Stats } from '/home/hatch/workspace/utility-hub/lib/calculations.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; };

const en = getTool('rot13-caesar-cipher');
t('EN entry loads', () => assert.ok(en));
t('EN calcKey', () => assert.equal(en.calcKey, 'rot13Stats'));
t('EN customComponent', () => assert.equal(en.customComponent, 'rot13-cipher'));
t('EN category', () => assert.equal(en.category, 'Developer Tools'));
t('EN badge', () => assert.equal(en.badge, '01'));
t('EN lastReviewed', () => assert.equal(en.lastReviewed, '2026-11-25'));
t('EN calculate is a function', () => assert.equal(typeof en.calculate, 'function'));
t('EN explainer is 3 paragraphs', () => assert.equal(en.explainer.split('\n\n').length, 3));
t('EN FAQs are 6', () => assert.equal(en.faqs.length, 6));
t('EN explainer has no literal backslash-n', () => assert.ok(!en.explainer.includes('\\n')));
t('EN has no em-dash', () => assert.ok(!/—/.test(en.explainer + en.metaTitle + en.metaDescription + en.tagline + en.faqs.map((f) => f.q + f.a).join(''))));
t('EN metaTitle matches house pattern', () => assert.equal(en.metaTitle, 'ROT13 and Caesar Cipher Encoder/Decoder Online Free [No Signup]'));
t('EN explainer links Base64 Encoder', () => assert.ok(en.explainer.includes('Base64 Encoder')));
t('EN explainer links Hash Generator', () => assert.ok(en.explainer.includes('Hash Generator')));
t('EN explainer links Binary to Text Converter', () => assert.ok(en.explainer.includes('Binary to Text Converter')));
t('EN explainer links Password Generator', () => assert.ok(en.explainer.includes('Password Generator')));
t('EN explainer warns ROT13 is not encryption', () => assert.ok(en.explainer.includes('obfuscation, not encryption')));
t('EN keywords include rot13 encoder', () => assert.ok(en.keywords.includes('rot13 encoder')));
t('EN keywords include caesar cipher decoder', () => assert.ok(en.keywords.includes('caesar cipher decoder')));

const es = getToolEs('codificador-rot13-cesar');
t('ES entry loads', () => assert.ok(es));
t('ES enSlug', () => assert.equal(es.enSlug, 'rot13-caesar-cipher'));
t('ES calcKey', () => assert.equal(es.calcKey, 'rot13Stats'));
t('ES customComponent', () => assert.equal(es.customComponent, 'rot13-cipher'));
t('ES category', () => assert.equal(es.category, 'Herramientas de Desarrollo'));
t('ES explainer is 3 paragraphs', () => assert.equal(es.explainer.split('\n\n').length, 3));
t('ES FAQs are 6', () => assert.equal(es.faqs.length, 6));
t('ES explainer has no literal backslash-n', () => assert.ok(!es.explainer.includes('\\n')));
t('ES has no em-dash', () => assert.ok(!/—/.test(es.explainer + es.metaTitle + es.metaDescription + es.tagline + es.faqs.map((f) => f.q + f.a).join(''))));
t('ES metaTitle matches house pattern', () => assert.equal(es.metaTitle, 'Codificador ROT13 y Cifrado César en Línea Gratis [Sin Registro]'));
t('ES name', () => assert.equal(es.name, 'Codificador ROT13 y Cifrado César'));

t('slug map EN to ES', () => assert.equal(TOOL_SLUG_ES['rot13-caesar-cipher'], 'codificador-rot13-cesar'));
t('hreflang resolves both ways', () => {
  assert.equal(getToolEs(TOOL_SLUG_ES['rot13-caesar-cipher']).enSlug, 'rot13-caesar-cipher');
  assert.equal(getTool('rot13-caesar-cipher').slug, 'rot13-caesar-cipher');
});

const r = rot13Stats({}, 'en');
t('rot13Stats returns 3 outputs', () => assert.equal(r.outputs.length, 3));
t('rot13Stats note is substantive', () => assert.ok(r.note.length > 50));
const rEs = rot13Stats({}, 'es');
t('rot13Stats ES note is Spanish', () => assert.ok(rEs.note.includes('Solo vista previa')));

// Every registry entry must have a working calculate function (full-load guard).
t('all EN tools load with calculate', () => {
  for (const tool of TOOLS) assert.equal(typeof tool.calculate, 'function', tool.slug);
});

console.log('rot13-registry: ' + n + '/' + n + ' passed');
