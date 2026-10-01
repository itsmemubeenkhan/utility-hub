import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getAllPosts, getAllPostSlugs, formatDate } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { absUrl, SITE_NAME, AUTHOR_NAME, AUTHOR_URL } from '@/lib/seo';
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

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
    dateModified: post.date,
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url,
  };
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const related = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);

  return (
    <div className="container">
      <JsonLd data={articleJsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href="/blog">Blog</Link> › <span>{post.title}</span>
      </nav>

      <article className="prose" style={{ marginTop: 8 }}>
        <span className="post-cat">{post.category}</span>
        <h1 className="article-title">{post.title}</h1>
        <div className="byline">
          <span className="avatar" aria-hidden="true">{initials(AUTHOR_NAME)}</span>
          <span className="who">
            By <strong>{AUTHOR_NAME}</strong>
            <br />
            {formatDate(post.date)} · {post.readingTime} min read
          </span>
        </div>
        <div className="key-takeaway">
          <strong>Key takeaway:</strong> {post.description}
        </div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>

      <BannerAd size="300x250" />

      {related.length > 0 && (
        <section className="related" aria-label="Related articles">
          <h2>Keep reading</h2>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/blog">← All money guides</Link>
      </div>

      <div className="disclaimer" style={{ maxWidth: 760 }}>
        <strong>Disclaimer:</strong> This article is for educational purposes only and is
        not financial advice. Consult a qualified professional before making financial decisions.
      </div>
    </div>
  );
}
