'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" onClick={close} style={{ textDecoration: 'none' }}>
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
          <Link href="/#tools" onClick={close}>Calculators</Link>
          <Link href="/blog" onClick={close}>Guides</Link>
          <Link href="/about" onClick={close}>About</Link>
        </nav>
      </div>
    </header>
  );
}
