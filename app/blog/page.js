import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
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
  const [featured, ...rest] = posts;
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

      {featured && (
        <Link href={'/blog/' + featured.slug} className="featured-card">
          <span className="featured-badge">Latest</span>
          <span className="post-cat">{featured.category}</span>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <span className="post-meta-row">
            <span>{formatDate(featured.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{featured.readingTime} min read</span>
          </span>
        </Link>
      )}

      <BannerAd size="468x60" />

      <div className="post-grid">
        {rest.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      {posts.length === 0 && <p>No articles yet, check back soon.</p>}
    </div>
  );
}
