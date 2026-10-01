'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDict } from '@/lib/i18n';

// Plain serializable tool data only (no functions cross the server/client boundary).
export default function ToolGrid({ tools, lang = 'en' }) {
  const t = getDict(lang);
  const prefix = lang === 'es' ? '/es' : '';
  const categories = [t.tools.all, ...Array.from(new Set(tools.map((tool) => tool.category)))];
  const [active, setActive] = useState(t.tools.all);
  const list = active === t.tools.all ? tools : tools.filter((tool) => tool.category === active);

  return (
    <>
      <div className="filter-pills" role="group" aria-label={t.tools.filterLabel}>
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
        {list.map((tool) => (
          <Link key={tool.slug} href={`${prefix}/tools/${tool.slug}`} className="tool-card">
            <span className="tool-cat">{tool.category}</span>
            <div className="tool-badge" aria-hidden="true">{tool.badge}</div>
            <h3>{tool.name}</h3>
            <p>{tool.tagline}</p>
            <span className="go" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </>
  );
}
