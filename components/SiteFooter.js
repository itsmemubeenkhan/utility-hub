import Link from 'next/link';
import { TOOLS } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import { SmartlinkAd } from '@/components/AdSlot';

export default function SiteFooter() {
  const featured = TOOLS.slice(0, 6);
  const guides = getAllPosts().slice(0, 4);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
              Utility<span>Hub</span>
            </Link>
            <p style={{ maxWidth: 340, marginTop: 12 }}>
              Free US finance calculators and plain-English money guides.
              Mortgages, loans, investing, taxes and debt, explained and computed.
              No sign-up, no data stored.
            </p>
          </div>
          <div>
            <h4>Popular calculators</h4>
            {featured.map((t) => (
              <Link key={t.slug} href={'/tools/' + t.slug}>{t.name}</Link>
            ))}
          </div>
          <div>
            <h4>Latest guides</h4>
            {guides.map((p) => (
              <Link key={p.slug} href={'/blog/' + p.slug}>{p.title}</Link>
            ))}
            <Link href="/blog" style={{ fontWeight: 700 }}>All guides →</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>
        <div className="fine">
          © {new Date().getFullYear()} UtilityHub. All figures are estimates for planning
          purposes and are not financial advice. Consult a qualified professional
          before making financial decisions.
        </div>
        <SmartlinkAd />
      </div>
    </footer>
  );
}
