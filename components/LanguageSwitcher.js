'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOL_SLUG_ES, TOOL_SLUG_EN, POST_SLUG_ES, POST_SLUG_EN } from '@/lib/slug-map';

const ES_MAP = { ...TOOL_SLUG_ES, ...POST_SLUG_ES };
const EN_MAP = { ...TOOL_SLUG_EN, ...POST_SLUG_EN };

function swapSlug(path, map) {
  const m = path.match(/^\/(tools|blog)\/([^/]+)\/?$/);
  if (!m) return null;
  const swapped = map[m[2]];
  return swapped ? `/${m[1]}/${swapped}` : null;
}

// lang: the language of the CURRENT page. Links to the equivalent page
// in the other language (falls back to that language's homepage).
export default function LanguageSwitcher({ lang, title }) {
  const pathname = usePathname() || '/';
  let href;
  if (lang === 'es') {
    const rest = pathname.replace(/^\/es(?=\/|$)/, '') || '/';
    href = swapSlug(rest, EN_MAP) || '/';
  } else {
    href = swapSlug(pathname, ES_MAP) ? '/es' + swapSlug(pathname, ES_MAP) : '/es';
  }
  return (
    <Link href={href} className="lang-switch" title={title} aria-label={title}>
      {lang === 'es' ? 'EN' : 'ES'}
    </Link>
  );
}
