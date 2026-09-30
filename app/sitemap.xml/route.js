import { absUrl } from '@/lib/seo';
import { getAllToolSlugs } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const urls = [
    { loc: absUrl('/'), priority: '1.0', changefreq: 'weekly' },
    { loc: absUrl('/blog'), priority: '0.8', changefreq: 'weekly' },
    { loc: absUrl('/about'), priority: '0.4', changefreq: 'monthly' },
    { loc: absUrl('/contact'), priority: '0.4', changefreq: 'monthly' },
    { loc: absUrl('/privacy-policy'), priority: '0.3', changefreq: 'yearly' },
    { loc: absUrl('/terms'), priority: '0.3', changefreq: 'yearly' },
  ];
  getAllToolSlugs().forEach((slug) =>
    urls.push({ loc: absUrl('/tools/' + slug), priority: '0.9', changefreq: 'monthly' })
  );
  getAllPosts().forEach((p) =>
    urls.push({
      loc: absUrl('/blog/' + p.slug),
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: p.date || undefined,
    })
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
