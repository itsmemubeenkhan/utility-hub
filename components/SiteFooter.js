import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { TOOLS } from '@/lib/tools';
import { TOOLS_ES } from '@/lib/tools.es';
import { getAllPosts } from '@/lib/blog';
import { SmartlinkAd } from '@/components/AdSlot';

export default function SiteFooter({ lang = 'en' }) {
  const t = getDict(lang);
  const prefix = lang === 'es' ? '/es' : '';
  const tools = (lang === 'es' ? TOOLS_ES : TOOLS).slice(0, 6);
  const guides = getAllPosts(lang).slice(0, 4);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <Link href={prefix || '/'} className="brand" style={{ textDecoration: 'none' }}>
              Utility<span>Hub</span>
            </Link>
            <p style={{ maxWidth: 340, marginTop: 12 }}>{t.footer.blurb}</p>
          </div>
          <div>
            <h4>{t.footer.popular}</h4>
            {tools.map((tool) => (
              <Link key={tool.slug} href={`${prefix}/tools/${tool.slug}`}>{tool.name}</Link>
            ))}
          </div>
          <div>
            <h4>{t.footer.latestGuides}</h4>
            {guides.map((p) => (
              <Link key={p.slug} href={`${prefix}/blog/${p.slug}`}>{p.title}</Link>
            ))}
            <Link href={`${prefix}/blog`} style={{ fontWeight: 700 }}>{t.footer.allGuides}</Link>
          </div>
          <div>
            <h4>{t.footer.company}</h4>
            <Link href="/about">{t.footer.about}</Link>
            <Link href="/contact">{t.footer.contact}</Link>
            <Link href="/privacy-policy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </div>
        </div>
        <div className="fine">
          © {new Date().getFullYear()} UtilityHub. {t.footer.rights}
        </div>
        <SmartlinkAd />
      </div>
    </footer>
  );
}
