import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { getPost, savePost, deletePost, slugify, postExists } from '@/lib/blog';

export async function GET(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const post = await getPost(params.slug);
  if (!post) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  return Response.json({ ok: true, post });
}

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  let body = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!postExists(params.slug)) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  if (!body.title || !body.content) {
    return Response.json({ ok: false, error: 'Title and content are required' }, { status: 400 });
  }
  // Slug is immutable on edit to keep URLs stable; changing slug = delete + recreate.
  const slug = savePost({
    slug: params.slug,
    title: body.title,
    description: body.description || '',
    date: body.date || new Date().toISOString().slice(0, 10),
    keywords: body.keywords || '',
    content: body.content,
  });
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/blog/' + slug);
  return Response.json({ ok: true, slug });
}

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (!postExists(params.slug)) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  deletePost(params.slug);
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/blog/' + params.slug);
  return Response.json({ ok: true });
}
