import { absUrl, SITE_NAME, AUTHOR_NAME } from '@/lib/seo';

export const metadata = {
  title: 'About UtilityHub: Free Finance Calculators & Money Guides',
  description: `About ${SITE_NAME}: who builds our free US finance calculators and money guides, our methodology, and how we stay free.`,
  alternates: { canonical: absUrl('/about') },
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>About UtilityHub</h1>
      </div>
      <div className="card prose">
        <p>
          UtilityHub is a free resource for anyone who wants to understand their money
          better. We build precision finance calculators for mortgages, loans,
          investing, taxes and debt payoff. Each comes with a plain-English explanation
          of how the underlying math works.
        </p>
        <h2>Who builds this</h2>
        <p>
          UtilityHub is built and maintained by {AUTHOR_NAME}, a software developer
          focused on making financial math transparent and accessible. Every
          calculator is implemented from standard, verifiable formulas and tested
          against known benchmarks before publishing. Guides are written in
          plain English and reviewed for accuracy on every update.
        </p>
        <h2>What we do</h2>
        <p>
          Every calculator on this site runs entirely in your browser and uses standard,
          verifiable financial formulas: loan amortization, compound growth, US federal
          tax brackets and the classic 28/36 home-affordability rule. Each tool is
          tested against known benchmarks, and each page explains the concepts behind
          the numbers so you can make decisions with confidence, not guesswork.
        </p>
        <h2>What we are not</h2>
        <p>
          UtilityHub is an educational tool, not a lender, broker, tax preparer or
          investment advisor. Nothing on this site is financial advice. Figures are
          estimates for planning purposes. Always confirm important decisions with a
          qualified professional.
        </p>
        <h2>How we stay free</h2>
        <p>
          The calculators are free to use with no account required. We keep the lights
          on with advertising. We never sell your data, and we never collect the
          numbers you enter; calculations happen locally on your device.
        </p>
      </div>
    </div>
  );
}
