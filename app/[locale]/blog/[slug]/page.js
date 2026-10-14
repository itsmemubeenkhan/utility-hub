import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getAllPosts, getAllPostSlugs, formatDate } from '@/lib/blog';
import { relatedToolsFor } from '@/lib/tools';
import { relatedToolsForEs } from '@/lib/tools.es';
import { getDict } from '@/lib/i18n';
import { POST_SLUG_ES, POST_SLUG_EN } from '@/lib/slug-map';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { absUrl, SITE_NAME, AUTHOR_NAME, AUTHOR_URL } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export function generateStaticParams() {
  return [
    ...getAllPostSlugs('en').map((slug) => ({ locale: 'en', slug })),
    ...getAllPostSlugs('es').map((slug) => ({ locale: 'es', slug })),
  ];
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const isEs = locale === 'es';
  const post = await getPost(slug, locale);
  if (!post) return {};
  const url = absUrl((isEs ? '/es' : '') + '/blog/' + post.slug);
  const altSlug = isEs ? post.enSlug || POST_SLUG_EN[post.slug] : POST_SLUG_ES[post.slug];
  const altUrl = altSlug ? absUrl((isEs ? '' : '/es') + '/blog/' + altSlug) : null;
  const languages = altUrl
    ? { en: isEs ? altUrl : url, es: isEs ? url : altUrl, 'x-default': isEs ? altUrl : url }
    : { en: url, 'x-default': url };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      ...(isEs ? { locale: 'es_US' } : {}),
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Extract ## FAQ section (### Question + answer paragraphs) from raw markdown
function extractFaqs(raw) {
  if (!raw) return [];
  const m = raw.match(/^##\s+FAQ\s*$/m);
  if (!m) return [];
  const section = raw.slice(m.index + m[0].length);
  const end = section.search(/^##\s+/m);
  const body = (end === -1 ? section : section.slice(0, end)).trim();
  if (!body) return [];
  const clean = (s) =>
    s
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
  const faqs = [];
  const re = /^###\s+(.+)$/gm;
  let match;
  const heads = [];
  while ((match = re.exec(body)) !== null) {
    heads.push({ q: match[1].trim(), start: match.index, qEnd: match.index + match[0].length });
  }
  heads.forEach((h, i) => {
    const aStart = h.qEnd;
    const aEnd = i + 1 < heads.length ? heads[i + 1].start : body.length;
    const answer = clean(body.slice(aStart, aEnd));
    if (h.q && answer) faqs.push({ q: clean(h.q), a: answer });
  });
  return faqs;
}

export default async function BlogPost({ params }) {
  const { locale, slug } = await params;
  const isEs = locale === 'es';
  const t = getDict(locale);
  const prefix = isEs ? '/es' : '';
  const post = await getPost(slug, locale);
  if (!post) notFound();
  const url = absUrl(prefix + '/blog/' + post.slug);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    ...(isEs ? { inLanguage: 'es' } : {}),
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url,
  };
  const faqs = extractFaqs(post.raw);
  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;
  const others = getAllPosts(locale).filter((p) => p.slug !== post.slug);
  const related = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);
  const relatedTools = isEs ? relatedToolsForEs(post, 3) : relatedToolsFor(post, 3);

  return (
    <div className="container">
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={prefix || '/'}>{t.article.home}</Link> › <Link href={prefix + '/blog'}>{t.article.blog}</Link> › <span>{post.title}</span>
      </nav>

      <article className="prose" style={{ marginTop: 8 }}>
        <span className="post-cat">{post.category}</span>
        <h1 className="article-title">{post.title}</h1>
        <div className="byline">
          <span className="avatar" aria-hidden="true">{initials(AUTHOR_NAME)}</span>
          <span className="who">
            {t.article.by} <strong>{AUTHOR_NAME}</strong>
            <br />
            {formatDate(post.date, locale)} · {post.readingTime} {t.article.minRead}
          </span>
        </div>
        <div className="key-takeaway">
          <strong>{t.article.keyTakeaway}</strong> {post.description}
        </div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>

      <BannerAd size="300x250" />

      {related.length > 0 && (
        <section className="related" aria-label="Related articles">
          <h2>{t.article.keepReading}</h2>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} lang={locale} />
            ))}
          </div>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section className="related" aria-label="Related calculators" style={{ marginTop: 36 }}>
          <h2>{t.article.relatedTools}</h2>
          <div className="post-grid">
            {relatedTools.map((tool) => (
              <Link key={tool.slug} href={prefix + '/tools/' + tool.slug} className="post-card">
                <span className="post-cat">{tool.category}</span>
                <h3>{tool.name}</h3>
                <p>{tool.tagline}</p>
                <span className="post-more">{t.article.tryCalculator}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href={prefix + '/blog'}>{t.article.backTo}</Link>
      </div>

      <div className="disclaimer" style={{ maxWidth: 760 }}>
        <strong>{t.article.disclaimerTitle}</strong> {t.article.disclaimer}
      </div>
    </div>
  );
}
