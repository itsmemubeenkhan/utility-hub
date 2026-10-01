import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTool, getAllToolSlugs, TOOLS } from '@/lib/tools';
import ToolRunner from '@/components/ToolRunner';
import JsonLd from '@/components/JsonLd';
import { absUrl, AUTHOR_NAME, AUTHOR_URL } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const tool = getTool(params.slug);
  if (!tool) return {};
  const url = absUrl('/tools/' + tool.slug);
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: tool.metaTitle, description: tool.metaDescription },
  };
}

export default function ToolPage({ params }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  const paragraphs = tool.explainer.split('\n\n');
  const related = [
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category),
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.category !== tool.category),
  ].slice(0, 3);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
    dateModified: tool.lastReviewed,
    url: absUrl('/tools/' + tool.slug),
  };

  return (
    <div className="container">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={softwareJsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <span>{tool.name}</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <span className="post-cat">{tool.category}</span>
        <h1>{tool.name}</h1>
        <p className="lede">{tool.tagline}</p>
        <p className="byline" style={{ fontSize: '0.9rem', color: '#555', marginTop: 8 }}>
          By {AUTHOR_NAME} · Last reviewed {tool.lastReviewed}
        </p>
      </div>

      <div className="calc-shell">
        <ToolRunner slug={tool.slug} inputs={tool.inputs} />
      </div>

      <BannerAd size="300x250" />

      <div className="prose" style={{ marginTop: 40 }}>
        <h2>How this calculator works</h2>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="faq">
        <h2>Frequently asked questions</h2>
        {tool.faqs.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <div className="faq-a">{f.a}</div>
          </details>
        ))}
      </div>

      <div className="related-posts" style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 18 }}>Related calculators</h2>
        <div className="post-grid">
          {related.map((t) => (
            <Link key={t.slug} href={'/tools/' + t.slug} className="post-card">
              <span className="post-cat">{t.category}</span>
              <h3>{t.name}</h3>
              <p>{t.tagline}</p>
              <span className="post-more">Try it →</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> Results are estimates for planning purposes only
        and are not financial advice. Actual loan terms, taxes and investment returns
        vary. Consult a qualified professional before making financial decisions.
      </div>
    </div>
  );
}
