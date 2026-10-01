import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { formatDate } from '@/lib/blog';

export default function PostCard({ post, lang = 'en' }) {
  const t = getDict(lang);
  const prefix = lang === 'es' ? '/es' : '';
  return (
    <Link href={`${prefix}/blog/${post.slug}`} className="post-card">
      <span className="post-cat">{post.category}</span>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <span className="post-meta-row">
        <span>{formatDate(post.date, lang)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} {t.card.minRead}</span>
        <span className="read-more">{t.card.readMore}</span>
      </span>
    </Link>
  );
}
