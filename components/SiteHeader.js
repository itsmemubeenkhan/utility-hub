import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
          Utility<span>Hub</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/#tools">Calculators</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
