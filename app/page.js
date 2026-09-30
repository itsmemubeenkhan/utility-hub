import Link from 'next/link';
import { TOOLS } from '@/lib/tools';
import { getAllPosts } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import { absUrl, SITE_NAME } from '@/lib/seo';
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

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
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
          <h1>Free finance calculators, explained in plain English</h1>
          <p>
            Mortgages, loans, investing, taxes and debt payoff. Run the numbers
            instantly and actually understand what they mean.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#tools">Browse calculators</a>
            <a className="btn btn-ghost" href="/blog">Read money guides</a>
          </div>
        </div>
      </section>

      <div className="container"><BannerAd size="728x90" /></div>

      <section className="section" id="tools">
        <div className="container">
          <h2>All calculators</h2>
          <p className="sub">
            Twelve precision tools for the biggest money decisions Americans make:
            buying a home, borrowing, investing and getting out of debt.
          </p>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <Link key={t.slug} href={'/tools/' + t.slug} className="tool-card">
                <span className="tool-cat">{t.category}</span>
                <div className="tool-badge" aria-hidden="true">{t.badge}</div>
                <h3>{t.name}</h3>
                <p>{t.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container"><NativeAd /></div>

      <section className="section" style={{ background: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container prose">
          <h2>Why run the numbers before you decide?</h2>
          <p>
            Most expensive financial mistakes share one trait: nobody did the math first.
            A mortgage signed without comparing total interest, a car bought on monthly
            payment alone, or a retirement plan built on hope instead of contributions.
            Each one can cost tens of thousands of dollars. UtilityHub exists to make that
            math effortless.
          </p>
          <p>
            Every calculator on this site pairs instant results with a plain-English
            explanation of <em>why</em> the numbers look the way they do: how
            amortization front-loads mortgage interest, why the 28/36 rule caps your
            home price, how compound growth bends upward over decades, and when
            refinancing actually pays for itself. You get charts, payoff timelines and
            breakeven points, not just a single number.
          </p>
          <p>
            The tools are built for the US market: federal tax brackets for the
            paycheck calculator, standard mortgage conventions, and dollar-based
            examples throughout. Results are estimates for planning purposes, verified
            against known benchmarks and are computed entirely in your browser. Your
            numbers never leave your device.
          </p>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Latest money guides</h2>
            <p className="sub">In-depth, jargon-free explainers that pair with the calculators.</p>
            <div className="post-grid">
              {posts.map((p) => (
                <Link key={p.slug} href={'/blog/' + p.slug} className="post-card">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <span className="post-date">{p.date}</span>
                </Link>
              ))}
            </div>
            <p style={{ marginTop: 20 }}>
              <Link href="/blog" style={{ fontWeight: 700 }}>View all guides →</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq">
            {HOME_FAQS.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
