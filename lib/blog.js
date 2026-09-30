/* Blog content layer: Markdown files with frontmatter under content/blog/.
   frontmatter: title, slug, description, date (YYYY-MM-DD), keywords (comma string) */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function filePath(slug) {
  return path.join(BLOG_DIR, slug + '.md');
}

export function getAllPostSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getPostMeta(slug) {
  const p = filePath(slug);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { data } = matter(raw);
  if (!data.title) return null;
  return {
    slug,
    title: String(data.title),
    description: String(data.description || ''),
    date: String(data.date || ''),
    keywords: String(data.keywords || ''),
  };
}

export function getAllPosts() {
  return getAllPostSlugs()
    .map(getPostMeta)
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug) {
  const p = filePath(slug);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { data, content } = matter(raw);
  if (!data.title) return null;
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: String(data.title),
    description: String(data.description || ''),
    date: String(data.date || ''),
    keywords: String(data.keywords || ''),
    contentHtml: processed.toString(),
    raw: content,
  };
}

export function postExists(slug) {
  return fs.existsSync(filePath(slug));
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
