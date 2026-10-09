# Dev.to article draft — publish after account creation (dofollow backlink)

Title: How I Shipped a Bilingual EN/ES Calculator Site on Next.js Static Generation

## Draft

I run UtilityHub — 12 free finance calculators + money guides, Next.js 15 on Vercel. Last week I shipped the whole thing in Spanish. Here's the architecture that made it (mostly) painless.

## The routing trick: one [locale] segment + middleware

Instead of next-intl, I used a single `app/[locale]` segment with a tiny middleware:

- `/es/*` → served as-is (locale = es)
- `/en/*` → 308 redirect to the canonical unprefixed URL
- everything else → rewritten to `/en/*` internally (URL stays clean)

English keeps its clean URLs (`/tools/mortgage-calculator`) — zero SEO risk to existing rankings — while Spanish gets real localized slugs (`/es/tools/calculadora-de-hipoteca`).

## Translations as data, not components

All calculator copy (labels, explainers, FAQs, meta) lives in `lib/tools.es.js`, mirroring the English `lib/tools.js` schema. The math (`lib/calculations.js`) is shared — translation never touches numbers. A Node schema-validation script checks all 12 entries: field parity, 4 FAQs each, numeric defaults byte-identical.

## hreflang without tears

Every page emits reciprocal `en` / `es` / `x-default` alternates, with slug mapping via a small `lib/slug-map.js` (EN slug ↔ ES slug both directions).

## Result

59 static pages, one build, `<html lang>` correct per locale, sitemap includes all `/es` URLs. The Spanish mortgage calculator is live if you want to poke at it: https://www.theutilityhub.online/es/tools/calculadora-de-hipoteca

Full English site: https://www.theutilityhub.online

---
*Tags: nextjs, seo, i18n, javascript*
