import Link from 'next/link';
import { formatDate } from '@/lib/blog';

export default function PostCard({ post }) {
  return (
    <Link href={'/blog/' + post.slug} className="post-card">
      <span className="post-cat">{post.category}</span>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <span className="post-meta-row">
        <span>{formatDate(post.date)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} min read</span>
        <span className="read-more">Read →</span>
      </span>
    </Link>
  );
}
