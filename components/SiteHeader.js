'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function SiteHeader({ lang = 'en' }) {
  const t = getDict(lang);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const home = lang === 'es' ? '/es' : '/';
  const toolsHref = lang === 'es' ? '/es#tools' : '/#tools';
  const blogHref = lang === 'es' ? '/es/blog' : '/blog';

  return (
    <header className="site-header">
      <div className="container">
        <Link href={home} className="brand" onClick={close} style={{ textDecoration: 'none' }}>
          Utility<span>Hub</span>
        </Link>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav className={'nav' + (open ? ' open' : '')} aria-label="Main navigation">
          <Link href={toolsHref} onClick={close}>{t.nav.calculators}</Link>
          <Link href={blogHref} onClick={close}>{t.nav.guides}</Link>
          <Link href="/about" onClick={close}>{t.nav.about}</Link>
          <LanguageSwitcher lang={lang} title={t.switcher.toOtherTitle} />
        </nav>
      </div>
    </header>
  );
}
