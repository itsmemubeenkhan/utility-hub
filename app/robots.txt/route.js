import { absUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${absUrl('/sitemap.xml')}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
