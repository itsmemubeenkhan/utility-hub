# UtilityHub: US Finance Calculators + SEO Blog

A dynamic Next.js (App Router) web app: 12 interactive US finance calculators,
an SEO blog backed by Markdown files, and a password-protected admin UI to
manage posts. No database server required. Professional navy/blue fintech design,
no external runtime assets, no hotlinking, no lorem ipsum.

## Quick start

```bash
cd ~/workspace/utilityhub
npm install
cp .env.example .env   # then edit values (see below)
npm run dev            # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Run the calculator math benchmarks:

```bash
npm run test:calc
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://example.com` | **Must be set to your real domain before launch.** Used for canonical URLs, Open Graph tags, sitemap and JSON-LD. No trailing slash. |
| `ADMIN_PASSWORD` | `changeme` | Password for `/admin`. **Change this in production.** |
| `PORT` | `3000` | Server port (`npm start`). |

## Site structure

- `/`: hero, tool grid (from registry), SEO intro copy, latest posts, FAQ
- `/tools/[slug]`: the 12 calculators (dynamic from registry)
- `/blog`: article listing; `/blog/[slug]`: full article from Markdown
- `/about`, `/contact`, `/privacy-policy`, `/terms`: AdSense-ready pages
- `/sitemap.xml`: dynamic (all tools + posts, uses `NEXT_PUBLIC_SITE_URL`)
- `/robots.txt`: allows all, disallows `/admin` and `/api/`, points at sitemap
- `/admin`: password-protected blog CMS (login → list → create/edit/delete)

## How to add a new tool

1. Add the pure math function to `lib/calculations.js`. It must return:
   ```js
   {
     outputs: [{ label: 'Monthly payment', value: '$1,234.56', highlight: true }],
     donut:   { labels: [...], values: [...], colors: [...] } | null,
     line:    { labels: [...], values: [...], title: '...' } | null,
     stacked: { labels: [...], series: [{ name, values, color }], title: '...' } | null,
     note: 'optional callout',   // omit if none
     warn: true,                 // omit unless inputs are invalid (e.g. payment < interest)
   }
   ```
2. Register it in `lib/tool-calculations.js` (`CALCULATORS['your-slug'] = fn`).
3. Add a full entry in `lib/tools.js` (`TOOLS` array): slug, name, tagline,
   category, badge, `inputs` schema (`number` | `select` | `checkbox` with
   defaults), `calculate`, `metaTitle`, `metaDescription`, `keywords`,
   `explainer` (~250 words, `\n\n`-separated paragraphs), and 4 `faqs`.
4. Rebuild. The page, sitemap entry, metadata and FAQ schema generate automatically.

Test the math first: add a case to `tests/benchmarks.mjs` and run `npm run test:calc`.

## How to add a blog post

**Via admin UI:** open `/admin`, log in with `ADMIN_PASSWORD`, fill in title,
slug (auto-generated), meta description, date, keywords and Markdown body, then
Publish. Posts appear on `/blog` and in the sitemap immediately (on-demand
revalidation).

**Via Markdown file:** create `content/blog/your-slug.md`:

```markdown
---
title: "Your Title"
slug: "your-slug"
description: "Meta description, ~150 chars."
date: "2026-09-30"
keywords: "keyword one, keyword two"
---

Your article in Markdown...
```

Posts are rendered with frontmatter metadata, Article JSON-LD, canonical URL
and Open Graph tags automatically.

## Deployment notes

- **Recommended: Vercel (free tier).** Connect the repo, set the two env vars,
  deploy. The `/admin` CMS writes to `content/blog/` on the server's
  filesystem. On Vercel this works per-instance but is **ephemeral across
  deploys**; for a durable CMS, commit posts via git or attach persistent
  storage. (Static export is intentionally NOT used because the admin needs a server.)
- **Any Node host** (VPS, Railway, Render, Fly.io): `npm run build && npm start`,
  set env vars, and put a reverse proxy (Caddy/Nginx) in front for HTTPS.
- Set `NEXT_PUBLIC_SITE_URL` to the real domain **before** `npm run build` so
  canonicals, sitemap and structured data are correct.
- After launch: submit `/sitemap.xml` in Google Search Console, then apply for
  AdSense once the site has its pages indexed.

## SEO summary

- `generateMetadata` on every page: unique title, description, keywords,
  canonical, Open Graph and Twitter tags.
- JSON-LD: `WebSite` (global), `FAQPage` (every tool page), `Article`
  (every blog post), `ItemList` (home + blog listing).
- Semantic HTML, breadcrumbs, mobile-responsive, system fonts (zero webfont
  requests), no heavy JS dependencies, and first-load JS ~103–111 kB.
- `/admin` and `/api/*` are `noindex` and disallowed in robots.txt.
