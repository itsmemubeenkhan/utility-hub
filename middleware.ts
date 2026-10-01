import { NextResponse } from 'next/server';

/* Locale routing without a library:
   - /es/*            → served as-is (locale = es)
   - /en/*            → 308 redirect to the canonical unprefixed URL
   - everything else  → internally rewritten to /en/* (URL stays clean)
   Route handlers (api, sitemap.xml, robots.txt) and static files are
   excluded via the matcher below. */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return NextResponse.next();
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = '/en' + pathname;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|sitemap.xml|robots.txt|.*\\..*).*)'],
};
