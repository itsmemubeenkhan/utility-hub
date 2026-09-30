import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getAllPostSlugs } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import { absUrl, SITE_NAME } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  const url = absUrl('/blog/' + post.slug);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  const url = absUrl('/blog/' + post.slug);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url,
  };
  return (
    <div className="container">
      <JsonLd data={articleJsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href="/blog">Blog</Link> › <span>{post.title}</span>
      </nav>
      <article className="prose" style={{ marginTop: 8 }}>
        <h1 style={{ fontSize: '2.1rem', letterSpacing: '-0.02em', marginBottom: 8 }}>{post.title}</h1>
        <div className="post-meta">
          Published {post.date} · {SITE_NAME}
        </div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
      <BannerAd size="300x250" />
      <div className="disclaimer" style={{ maxWidth: 760 }}>
        <strong>Disclaimer:</strong> This article is for educational purposes only and is
        not financial advice. Consult a qualified professional before making financial decisions.
      </div>
    </div>
  );
}
