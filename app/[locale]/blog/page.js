import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/blog';
import { getDict } from '@/lib/i18n';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { absUrl } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl(isEs ? '/es/blog' : '/blog');
  return {
    ...(isEs
      ? {
          title: 'Guías de dinero y explicaciones',
          description:
            'Guías en español sobre hipotecas, préstamos, inversiones, impuestos y deudas, escritas para complementar nuestras calculadoras financieras gratuitas.',
        }
      : {
          title: 'Money Guides & Explainers',
          description:
            'Plain-English guides to mortgages, loans, investing, taxes and debt payoff, written to pair with our free finance calculators.',
        }),
    alternates: {
      canonical: url,
      languages: { en: absUrl('/blog'), es: absUrl('/es/blog'), 'x-default': absUrl('/blog') },
    },
    openGraph: {
      title: isEs ? 'Guías de dinero y explicaciones | UtilityHub' : 'Money Guides & Explainers | UtilityHub',
      description: isEs
        ? 'Guías en español sobre hipotecas, préstamos, inversiones y deudas.'
        : 'Plain-English guides to mortgages, loans, investing, taxes and debt payoff.',
      url,
      type: 'website',
      ...(isEs ? { locale: 'es_US' } : {}),
    },
  };
}

export default async function BlogIndex({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const t = getDict(locale);
  const prefix = isEs ? '/es' : '';
  const posts = getAllPosts(locale);
  const [featured, ...rest] = posts;
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isEs ? 'Guías de dinero' : 'Money guides',
    ...(isEs ? { inLanguage: 'es' } : {}),
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl(prefix + '/blog/' + p.slug),
      name: p.title,
    })),
  };
  return (
    <div className="container">
      <JsonLd data={itemList} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={prefix || '/'}>{t.blog.home}</Link> › <span>{t.blog.blog}</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <h1>{t.blog.title}</h1>
        <p className="lede">{t.blog.sub}</p>
      </div>

      {featured && (
        <Link href={prefix + '/blog/' + featured.slug} className="featured-card">
          <span className="featured-badge">{t.blog.latestBadge}</span>
          <span className="post-cat">{featured.category}</span>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <span className="post-meta-row">
            <span>{formatDate(featured.date, locale)}</span>
            <span aria-hidden="true">·</span>
            <span>{featured.readingTime} {t.card.minRead}</span>
          </span>
        </Link>
      )}

      <BannerAd size="468x60" />

      <div className="post-grid">
        {rest.map((p) => (
          <PostCard key={p.slug} post={p} lang={locale} />
        ))}
      </div>
      {posts.length === 0 && <p>{t.blog.empty}</p>}
    </div>
  );
}
