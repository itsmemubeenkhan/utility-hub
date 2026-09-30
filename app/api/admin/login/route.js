import { NextResponse } from 'next/server';
import { adminPassword, tokenFor, ADMIN_COOKIE } from '@/lib/admin-auth';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  if (String(body.password || '') !== adminPassword()) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, tokenFor(adminPassword()), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
