'use client';

import { useState } from 'react';
import Link from 'next/link';

// Plain serializable tool data only (no functions cross the server/client boundary).
export default function ToolGrid({ tools }) {
  const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))];
  const [active, setActive] = useState('All');
  const list = active === 'All' ? tools : tools.filter((t) => t.category === active);

  return (
    <>
      <div className="filter-pills" role="group" aria-label="Filter calculators by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={'pill' + (c === active ? ' active' : '')}
            aria-pressed={c === active}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="tool-grid">
        {list.map((t) => (
          <Link key={t.slug} href={'/tools/' + t.slug} className="tool-card">
            <span className="tool-cat">{t.category}</span>
            <div className="tool-badge" aria-hidden="true">{t.badge}</div>
            <h3>{t.name}</h3>
            <p>{t.tagline}</p>
            <span className="go" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </>
  );
}
