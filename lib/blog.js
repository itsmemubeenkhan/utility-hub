/* Blog content layer: Markdown files with frontmatter under content/blog/.
   frontmatter: title, slug, description, date (YYYY-MM-DD), keywords (comma string) */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function localeDir(locale) {
  return locale === 'es' ? path.join(BLOG_DIR, 'es') : BLOG_DIR;
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function filePath(slug, locale = 'en') {
  return path.join(localeDir(locale), slug + '.md');
}

export function postCategory(slug, keywords) {
  const s = ((slug || '') + ' ' + (keywords || '')).toLowerCase();
  if (/house|mortgage|afford|rent|home/.test(s)) return 'Home Buying';
  if (/compound|invest|retire|savings|interest/.test(s)) return 'Investing';
  if (/debt|snowball|avalanche|credit/.test(s)) return 'Debt & Credit';
  if (/emi|loan|refinance|auto/.test(s)) return 'Loans';
  if (/salary|paycheck|budget/.test(s)) return 'Salary & Budgeting';
  return 'Money Guides';
}

export function postCategoryEs(slug, keywords) {
  const s = ((slug || '') + ' ' + (keywords || '')).toLowerCase();
  if (/casa|hipoteca|vivienda|comprar/.test(s)) return 'Compra de vivienda';
  if (/interes-compuesto|invertir|inversion|jubilacion|ahorro/.test(s)) return 'Inversión';
  if (/deuda|nieve|avalancha|tarjeta|credito/.test(s)) return 'Deudas y crédito';
  if (/prestamo|cuota|refinanciamiento|auto/.test(s)) return 'Préstamos';
  if (/salario|presupuesto|sueldo/.test(s)) return 'Salario y presupuesto';
  return 'Guías de dinero';
}

export function readingTime(text) {
  const words = String(text || '')
    .replace(/---[\s\S]*?---/, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso, locale = 'en') {
  try {
    const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString(locale === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(iso);
  }
}

export function getAllPostSlugs(locale = 'en') {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getPostMeta(slug, locale = 'en') {
  const p = filePath(slug, locale);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { data, content } = matter(raw);
  if (!data.title) return null;
  const keywords = String(data.keywords || '');
  return {
    slug,
    title: String(data.title),
    description: String(data.description || ''),
    date: String(data.date || ''),
    keywords,
    category: locale === 'es' ? postCategoryEs(slug, keywords) : postCategory(slug, keywords),
    readingTime: readingTime(content),
  };
}

export function getAllPosts(locale = 'en') {
  return getAllPostSlugs(locale)
    .map((s) => getPostMeta(s, locale))
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug, locale = 'en') {
  const p = filePath(slug, locale);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { data, content } = matter(raw);
  if (!data.title) return null;
  const processed = await remark().use(html).process(content);
  const keywords = String(data.keywords || '');
  return {
    slug,
    title: String(data.title),
    description: String(data.description || ''),
    date: String(data.date || ''),
    keywords,
    enSlug: data.enSlug ? String(data.enSlug) : null,
    category: locale === 'es' ? postCategoryEs(slug, keywords) : postCategory(slug, keywords),
    readingTime: readingTime(content),
    contentHtml: processed.toString(),
    raw: content,
  };
}

export function postExists(slug, locale = 'en') {
  return fs.existsSync(filePath(slug, locale));
}

export function savePost({ slug, title, description, date, keywords, content }) {
  const clean = slugify(slug || title);
  if (!clean) throw new Error('Slug is required');
  const fm = [
    '---',
    `title: "${String(title).replace(/"/g, "'")}"`,
    `slug: "${clean}"`,
    `description: "${String(description || '').replace(/"/g, "'")}"`,
    `date: "${date || new Date().toISOString().slice(0, 10)}"`,
    `keywords: "${String(keywords || '').replace(/"/g, "'")}"`,
    '---',
    '',
    content || '',
    '',
  ].join('\n');
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(filePath(clean), fm, 'utf8');
  return clean;
}

export function deletePost(slug) {
  const p = filePath(slug);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  return true;
}
