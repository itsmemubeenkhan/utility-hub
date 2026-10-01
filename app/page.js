import Link from 'next/link';
import { TOOLS } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import ToolGrid from '@/components/ToolGrid';
import { absUrl } from '@/lib/seo';
import { BannerAd, NativeAd } from '@/components/AdSlot';

const HOME_FAQS = [
  {
    q: 'Are these calculators really free?',
    a: 'Yes, every calculator on UtilityHub is free to use with no sign-up. We show ads to keep the tools free for everyone.',
  },
  {
    q: 'How accurate are the results?',
    a: 'Our calculators use standard financial formulas (amortization, compound growth, US tax brackets) and are tested against known benchmarks. They are estimates for planning. Always confirm with your lender, tax professional or advisor before acting.',
  },
  {
    q: 'Do you store the numbers I enter?',
    a: 'No. All calculations happen in your browser; nothing you type is sent to or stored on our servers.',
  },
  {
    q: 'Which calculator should I start with?',
    a: 'Buying a home? Start with the Home Affordability Calculator. Paying down debt? The Debt Payoff Calculator. Investing for the future? The Compound Interest Calculator.',
  },
];

const FEATURES = [
  {
    icon: '📐',
    title: 'Real formulas, verified',
    text: 'Standard amortization math, federal tax brackets and payoff logic, tested against known benchmarks. No black boxes, no guesswork.',
  },
  {
    icon: '🔒',
    title: 'Private by design',
    text: 'Every calculation runs entirely in your browser. The numbers you type never leave your device, are never stored, never sold.',
  },
  {
    icon: '💬',
    title: 'Plain English, always',
    text: 'Each result comes with an explanation of why the numbers look the way they do, so you understand the decision, not just the digit.',
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  // Strip non-serializable fields before passing to the client component.
  const toolCards = TOOLS.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    category: t.category,
    badge: t.badge,
  }));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free finance calculators',
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl('/tools/' + t.slug),
      name: t.name,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />

      <section className="hero">
        <div className="container">
          <span className="hero-badge">
            <span className="dot" aria-hidden="true" />
            100% free · No sign-up · Private
          </span>
          <h1>
            Free finance calculators, <span className="grad">explained in plain English</span>
          </h1>
          <p>
            Mortgages, loans, investing, taxes and debt payoff. Run the numbers
            instantly, see the charts, and actually understand what they mean
            before you decide.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#tools">Browse calculators</a>
            <a className="btn btn-ghost" href="/blog">Read money guides</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{TOOLS.length}</div>
              <div className="lbl">Free calculators</div>
            </div>
            <div className="hero-stat">
              <div className="num">{getAllPosts().length}</div>
              <div className="lbl">Money guides</div>
            </div>
            <div className="hero-stat">
              <div className="num">$0</div>
              <div className="lbl">Forever, no sign-up</div>
            </div>
            <div className="hero-stat">
              <div className="num">0</div>
              <div className="lbl">Data stored or tracked</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container"><BannerAd size="728x90" /></div>

      <section className="section" id="tools">
        <div className="container">
          <span className="eyebrow">Calculators</span>
          <h2>Every big money decision, calculated</h2>
          <p className="sub">
            Precision tools for the decisions that matter most: buying a home,
            borrowing, investing and getting out of debt. Pick a category to filter.
          </p>
          <ToolGrid tools={toolCards} />
        </div>
      </section>

      <section className="section" style={{ background: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <span className="eyebrow">Why UtilityHub</span>
          <h2>Numbers you can trust, explained like a friend would</h2>
          <p className="sub">
            Most expensive financial mistakes share one trait: nobody did the math first.
            We make that math effortless, and make sure you understand it.
          </p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
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

      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="eyebrow">Learn</span>
            <h2>Latest money guides</h2>
            <p className="sub">In-depth, jargon-free explainers that pair with the calculators.</p>
            <div className="post-grid">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
            <p style={{ marginTop: 22 }}>
              <Link href="/blog" style={{ fontWeight: 700 }}>View all guides →</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">FAQ</span>
          <h2>Frequently asked questions</h2>
          <div className="faq" style={{ marginTop: 20 }}>
            {HOME_FAQS.map((f, i) => (
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
          <h2>Stop guessing. Start calculating.</h2>
          <p>
            The average homebuyer who compares total loan costs saves thousands.
            Run your numbers in under a minute, free.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/tools/home-affordability-calculator">
              How much house can I afford?
            </Link>
            <a className="btn btn-ghost" href="#tools">All calculators</a>
          </div>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </>
  );
}
