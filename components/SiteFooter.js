import Link from 'next/link';
import { TOOLS } from '@/lib/tools';

export default function SiteFooter() {
  const featured = TOOLS.slice(0, 6);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <h4>UtilityHub</h4>
            <p style={{ maxWidth: 340 }}>
              Free US finance calculators and plain-English money guides.
              Mortgage, loans, investing, taxes and debt — explained and computed.
            </p>
          </div>
          <div>
            <h4>Popular calculators</h4>
            {featured.map((t) => (
              <Link key={t.slug} href={'/tools/' + t.slug}>{t.name}</Link>
            ))}
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </div>
        <div className="fine">
          © {new Date().getFullYear()} UtilityHub. All figures are estimates for planning
          purposes and are not financial advice. Consult a qualified professional
          before making financial decisions.
        </div>
      </div>
    </footer>
  );
}
