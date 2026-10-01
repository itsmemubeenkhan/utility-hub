import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import ToolGrid from '@/components/ToolGrid';
import { absUrl } from '@/lib/seo';
import { BannerAd, NativeAd } from '@/components/AdSlot';

// Shared homepage for both locales. lang: 'en' | 'es'.
// tools: plain serializable [{ slug, name, tagline, category, badge }]
// posts: ALL post metas (component slices the latest 3 for the guides section).
export default function HomePageContent({ lang, tools, posts }) {
  const t = getDict(lang);
  const prefix = lang === 'es' ? '/es' : '';
  const latest = posts.slice(0, 3);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'es' ? 'Calculadoras financieras gratuitas' : 'Free finance calculators',
    itemListElement: tools.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl(`${prefix}/tools/${tool.slug}`),
      name: tool.name,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />

      <section className="hero">
        <div className="container">
          <span className="hero-badge">
            <span className="dot" aria-hidden="true" />
            {t.hero.badge}
          </span>
          <h1>
            {t.hero.titleLead}
            <span className="grad">{t.hero.titleGrad}</span>
          </h1>
          <p>{t.hero.sub}</p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#tools">{t.hero.browse}</a>
            <a className="btn btn-ghost" href={`${prefix}/blog`}>{t.hero.readGuides}</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{tools.length}</div>
              <div className="lbl">{t.hero.statTools}</div>
            </div>
            <div className="hero-stat">
              <div className="num">{posts.length}</div>
              <div className="lbl">{t.hero.statGuides}</div>
            </div>
            <div className="hero-stat">
              <div className="num">$0</div>
              <div className="lbl">{t.hero.statFree}</div>
            </div>
            <div className="hero-stat">
              <div className="num">0</div>
              <div className="lbl">{t.hero.statPrivate}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container"><BannerAd size="728x90" /></div>

      <section className="section" id="tools">
        <div className="container">
          <span className="eyebrow">{t.tools.eyebrow}</span>
          <h2>{t.tools.title}</h2>
          <p className="sub">{t.tools.sub}</p>
          <ToolGrid tools={tools} lang={lang} />
        </div>
      </section>

      <section className="section" style={{ background: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <span className="eyebrow">{t.features.eyebrow}</span>
          <h2>{t.features.title}</h2>
          <p className="sub">{t.features.sub}</p>
          <div className="feature-grid">
            {t.features.items.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container"><NativeAd /></div>

      {latest.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="eyebrow">{t.guides.eyebrow}</span>
            <h2>{t.guides.title}</h2>
            <p className="sub">{t.guides.sub}</p>
            <div className="post-grid">
              {latest.map((p) => (
                <PostCard key={p.slug} post={p} lang={lang} />
              ))}
            </div>
            <p style={{ marginTop: 22 }}>
              <Link href={`${prefix}/blog`} style={{ fontWeight: 700 }}>{t.guides.viewAll}</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2>{t.faq.title}</h2>
          <div className="faq" style={{ marginTop: 20 }}>
            {t.faq.items.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cta-band">
          <h2>{t.cta.title}</h2>
          <p>{t.cta.sub}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href={t.cta.primaryHref}>
              {t.cta.primary}
            </Link>
            <a className="btn btn-ghost" href="#tools">{t.cta.secondary}</a>
          </div>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </>
  );
}
