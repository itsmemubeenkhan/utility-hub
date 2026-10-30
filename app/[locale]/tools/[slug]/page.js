import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTool, getAllToolSlugs, TOOLS } from '@/lib/tools';
import { getToolEs, getAllToolSlugsEs, TOOLS_ES } from '@/lib/tools.es';
import ToolRunner from '@/components/ToolRunner';
import TextTool from '@/components/text-tools/TextTool';
import QRTool from '@/components/qr-tools/QRTool';
import PayStubTool from '@/components/paystub/PayStubTool';
import PasswordTool from '@/components/password/PasswordTool';
import JsonFormatterTool from '@/components/dev-tools/JsonFormatterTool';
import UuidTool from '@/components/dev-tools/UuidTool';
import HexColorTool from '@/components/dev-tools/HexColorTool';
import BarcodeTool from '@/components/dev-tools/BarcodeTool';
import ImageCompressorTool from '@/components/dev-tools/ImageCompressorTool';
import Base64Tool from '@/components/dev-tools/Base64Tool';
import UrlTool from '@/components/dev-tools/UrlTool';
import DiffTool from '@/components/dev-tools/DiffTool';
import JsonCsvTool from '@/components/dev-tools/JsonCsvTool';
import TimestampTool from '@/components/dev-tools/TimestampTool';
import JwtTool from '@/components/dev-tools/JwtTool';
import JsonLd from '@/components/JsonLd';
import EmbedSnippet from '@/components/EmbedSnippet';
import { EMBEDS } from '@/lib/embed-snippets';
import { getDict } from '@/lib/i18n';
import { TOOL_SLUG_ES } from '@/lib/slug-map';
import { absUrl, AUTHOR_NAME, AUTHOR_URL } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';
import { relatedGuidesFor } from '@/lib/blog';

export function generateStaticParams() {
  return [
    ...getAllToolSlugs().map((slug) => ({ locale: 'en', slug })),
    ...getAllToolSlugsEs().map((slug) => ({ locale: 'es', slug })),
  ];
}

function toolFor(locale, slug) {
  return locale === 'es' ? getToolEs(slug) : getTool(slug);
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const tool = toolFor(locale, slug);
  if (!tool) return {};
  const isEs = locale === 'es';
  const url = absUrl((isEs ? '/es' : '') + '/tools/' + tool.slug);
  const altSlug = isEs ? tool.enSlug : TOOL_SLUG_ES[tool.slug];
  const altUrl = altSlug ? absUrl((isEs ? '' : '/es') + '/tools/' + altSlug) : null;
  const languages = altUrl
    ? { en: isEs ? altUrl : url, es: isEs ? url : altUrl, 'x-default': isEs ? altUrl : url }
    : { en: url, 'x-default': url };
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url,
      type: 'website',
      ...(isEs ? { locale: 'es_US' } : {}),
    },
    twitter: { card: 'summary_large_image', title: tool.metaTitle, description: tool.metaDescription },
  };
}

export default async function ToolPage({ params }) {
  const { locale, slug } = await params;
  const isEs = locale === 'es';
  const t = getDict(locale);
  const prefix = isEs ? '/es' : '';
  const tool = toolFor(locale, slug);
  if (!tool) notFound();
  const allTools = isEs ? TOOLS_ES : TOOLS;

  const paragraphs = tool.explainer.split('\n\n');
  const related = [
    ...allTools.filter((x) => x.slug !== tool.slug && x.category === tool.category),
    ...allTools.filter((x) => x.slug !== tool.slug && x.category !== tool.category),
  ].slice(0, 3);
  const guides = relatedGuidesFor(tool, locale, 3);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  /* schema.org applicationCategory that fits each tool group. Finance tools
     keep FinanceApplication; everything else is a general web utility. */
  const FINANCE_CATEGORIES = new Set([
    'Taxes', 'Loans', 'Home Loans', 'Investing', 'Saving', 'Retirement',
    'Debt', 'Planning', 'Impuestos', 'Préstamos', 'Hipotecas', 'Inversión',
    'Ahorro', 'Jubilación', 'Deudas', 'Planificación', 'Salario', 'Tarjetas',
  ]);
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.metaDescription,
    applicationCategory: FINANCE_CATEGORIES.has(tool.category)
      ? 'FinanceApplication'
      : 'UtilitiesApplication',
    operatingSystem: 'Web',
    ...(isEs ? { inLanguage: 'es' } : {}),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
    dateModified: tool.lastReviewed,
    url: absUrl(prefix + '/tools/' + tool.slug),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.article.home, item: absUrl(prefix || '/') },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEs ? 'Herramientas' : 'Tools',
        item: absUrl(prefix + '/tools'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: absUrl(prefix + '/tools/' + tool.slug),
      },
    ],
  };

  const videoJsonLd = tool.videoId
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: tool.videoTitle || tool.name,
        description: tool.metaDescription,
        thumbnailUrl: 'https://i.ytimg.com/vi/' + tool.videoId + '/hqdefault.jpg',
        uploadDate: '2026-10-13T00:00:00+05:00',
        embedUrl: 'https://www.youtube.com/embed/' + tool.videoId,
        contentUrl: 'https://www.youtube.com/watch?v=' + tool.videoId,
      }
    : null;

  return (
    <div className="container">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {videoJsonLd && <JsonLd data={videoJsonLd} />}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={prefix || '/'}>{t.article.home}</Link> › <span>{tool.name}</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <span className="post-cat">{tool.category}</span>
        <h1>{tool.name}</h1>
        <p className="lede">{tool.tagline}</p>
        <p className="byline" style={{ fontSize: '0.9rem', color: '#555', marginTop: 8 }}>
          {t.toolPage.by} {AUTHOR_NAME} · {t.toolPage.lastReviewed} {tool.lastReviewed}
        </p>
      </div>

      {tool.snippet && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>{tool.snippet.q}</h2>
          <p style={{ color: '#334155', margin: 0 }}>{tool.snippet.a}</p>
        </div>
      )}

      <div className="calc-shell">
        {tool.customComponent ? (
          tool.customComponent.startsWith('qr-') ? (
            <QRTool component={tool.customComponent} lang={locale} />
          ) : tool.customComponent.startsWith('pay-') ? (
            <PayStubTool lang={locale} />
          ) : tool.customComponent.startsWith('password-') ? (
            <PasswordTool lang={locale} />
          ) : tool.customComponent.startsWith('json-') ? (
            <JsonFormatterTool lang={locale} />
          ) : tool.customComponent.startsWith('uuid-') ? (
            <UuidTool lang={locale} />
          ) : tool.customComponent.startsWith('hex-') ? (
            <HexColorTool lang={locale} />
          ) : tool.customComponent.startsWith('barcode-') ? (
            <BarcodeTool lang={locale} />
          ) : tool.customComponent.startsWith('image-') ? (
            <ImageCompressorTool lang={locale} />
          ) : tool.customComponent.startsWith('base64-') ? (
            <Base64Tool lang={locale} />
          ) : tool.customComponent.startsWith('url-') ? (
            <UrlTool lang={locale} />
          ) : tool.customComponent.startsWith('diff-') ? (
            <DiffTool lang={locale} />
          ) : tool.customComponent.startsWith('jsoncsv-') ? (
            <JsonCsvTool lang={locale} />
          ) : tool.customComponent.startsWith('timestamp-') ? (
            <TimestampTool lang={locale} />
          ) : tool.customComponent.startsWith('jwt-') ? (
            <JwtTool lang={locale} />
          ) : (
            <TextTool component={tool.customComponent} lang={locale} />
          )
        ) : (
          <ToolRunner calcKey={tool.calcKey} inputs={tool.inputs} lang={locale} />
        )}
      </div>

      {EMBEDS[tool.slug] && (
        <div className="card" style={{ marginTop: 28 }}>
          <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>{EMBEDS[tool.slug].heading}</h2>
          <p style={{ color: '#334155', marginTop: 0 }}>{EMBEDS[tool.slug].blurb}</p>
          <EmbedSnippet
            snippet={EMBEDS[tool.slug].snippet}
            copyLabel={EMBEDS[tool.slug].copyLabel}
            copiedLabel={EMBEDS[tool.slug].copiedLabel}
          />
        </div>
      )}

      {tool.videoId && (
        <div className="video-embed" style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 14 }}>
            {isEs ? 'Mira: Cómo usar esta calculadora' : 'Watch: How to Use This Calculator'}
          </h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12 }}>
            <iframe
              src={'https://www.youtube.com/embed/' + tool.videoId}
              title={tool.videoTitle || tool.name}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <BannerAd size="300x250" />

      <div className="prose" style={{ marginTop: 40 }}>
        <h2>{t.toolPage.howItWorks}</h2>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="faq">
        <h2>{t.toolPage.faqTitle}</h2>
        {tool.faqs.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <div className="faq-a">{f.a}</div>
          </details>
        ))}
      </div>

      <div className="related-posts" style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 18 }}>{t.toolPage.related}</h2>
        <div className="post-grid">
          {related.map((x) => (
            <Link key={x.slug} href={prefix + '/tools/' + x.slug} className="post-card">
              <span className="post-cat">{x.category}</span>
              <h3>{x.name}</h3>
              <p>{x.tagline}</p>
              <span className="post-more">{t.toolPage.tryIt}</span>
            </Link>
          ))}
        </div>
      </div>

      {guides.length > 0 && (
        <div className="related-posts" style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 18 }}>{t.toolPage.relatedGuides}</h2>
          <div className="post-grid">
            {guides.map((g) => (
              <Link key={g.slug} href={prefix + '/blog/' + g.slug} className="post-card">
                <span className="post-cat">{g.category}</span>
                <h3>{g.title}</h3>
                <p>{g.description}</p>
                <span className="post-more">{t.toolPage.readGuide}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="disclaimer">
        <strong>{t.toolPage.disclaimerTitle}</strong> {t.toolPage.disclaimer}
      </div>
    </div>
  );
}
