import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import { absUrl } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export const metadata = {
  title: 'Money Guides & Explainers',
  description:
    'Plain-English guides to mortgages, loans, investing, taxes and debt payoff, written to pair with our free finance calculators.',
  alternates: { canonical: absUrl('/blog') },
  openGraph: {
    title: 'Money Guides & Explainers | UtilityHub',
    description: 'Plain-English guides to mortgages, loans, investing, taxes and debt payoff.',
    url: absUrl('/blog'),
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Money guides',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl('/blog/' + p.slug),
      name: p.title,
    })),
  };
  return (
    <div className="container">
      <JsonLd data={itemList} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <span>Blog</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <h1>Money guides</h1>
        <p className="lede">
          In-depth, jargon-free explainers on mortgages, loans, investing and debt,
          written to pair with our calculators.
        </p>
      </div>
      <BannerAd size="468x60" />
      <div className="post-grid">
        {posts.map((p) => (
          <Link key={p.slug} href={'/blog/' + p.slug} className="post-card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <span className="post-date">{p.date}</span>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p>No articles yet, check back soon.</p>}
    </div>
  );
}
