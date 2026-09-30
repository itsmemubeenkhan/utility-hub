import { absUrl, SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: 'Terms of Use',
  description: `${SITE_NAME} terms of use: acceptable use, disclaimers and limitations.`,
  alternates: { canonical: absUrl('/terms') },
};

export default function TermsPage() {
  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Terms of Use</h1>
        <p className="lede">Last updated: September 30, 2026</p>
      </div>
      <div className="card prose">
        <h2>Acceptance</h2>
        <p>
          By accessing {SITE_NAME} you agree to these terms. If you do not agree,
          please do not use the site.
        </p>
        <h2>Educational purpose only — not financial advice</h2>
        <p>
          All calculators, articles and figures on this site are provided for
          general educational and planning purposes only. They are estimates, not
          financial, tax, legal or investment advice. Always consult a qualified
          professional before making financial decisions. We make no guarantees
          about accuracy, completeness or suitability for your situation.
        </p>
        <h2>Acceptable use</h2>
        <p>
          You may use the calculators and articles for personal, non-commercial
          purposes. You agree not to misuse the site, attempt to disrupt it, or
          scrape its content at abusive rates.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Site content, design and code are owned by {SITE_NAME} unless otherwise
          noted. You may link to our pages and quote brief excerpts with attribution.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE_NAME} is not liable for any
          decisions made or actions taken based on information on this site.
        </p>
        <h2>Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the site after
          changes constitutes acceptance.
        </p>
      </div>
    </div>
  );
}
