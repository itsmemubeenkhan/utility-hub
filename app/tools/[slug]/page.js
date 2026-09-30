import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTool, getAllToolSlugs } from '@/lib/tools';
import ToolRunner from '@/components/ToolRunner';
import JsonLd from '@/components/JsonLd';
import { absUrl } from '@/lib/seo';
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
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="container">
      <JsonLd data={faqJsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <span>{tool.name}</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <h1>{tool.name}</h1>
        <p className="lede">{tool.tagline}</p>
      </div>

      <ToolRunner slug={tool.slug} inputs={tool.inputs} />

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

      <div className="disclaimer">
        <strong>Disclaimer:</strong> Results are estimates for planning purposes only
        and are not financial advice. Actual loan terms, taxes and investment returns
        vary. Consult a qualified professional before making financial decisions.
      </div>
    </div>
  );
}
