import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { getAllPosts, getPostMeta, savePost, slugify } from '@/lib/blog';

export async function GET() {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return Response.json({ ok: true, posts: getAllPosts() });
}

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  let body = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.title || !body.content) {
    return Response.json({ ok: false, error: 'Title and content are required' }, { status: 400 });
  }
  const slug = savePost({
    slug: slugify(body.slug || body.title),
    title: body.title,
    description: body.description || '',
    date: body.date || new Date().toISOString().slice(0, 10),
    keywords: body.keywords || '',
    content: body.content,
  });
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/blog/' + slug);
  return Response.json({ ok: true, slug, post: getPostMeta(slug) });
}
