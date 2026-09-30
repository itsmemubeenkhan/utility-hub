import { absUrl, SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: 'Privacy Policy',
  description: `${SITE_NAME} privacy policy: what data we collect, how ads work, and your choices.`,
  alternates: { canonical: absUrl('/privacy-policy') },
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Privacy Policy</h1>
        <p className="lede">Last updated: September 30, 2026</p>
      </div>
      <div className="card prose">
        <h2>Overview</h2>
        <p>
          {SITE_NAME} ("we") respects your privacy. This policy explains what
          information we collect when you use our calculators and articles, and how
          it is used.
        </p>
        <h2>Calculator inputs</h2>
        <p>
          The numbers you enter into our calculators are processed entirely in your
          web browser using JavaScript. They are never transmitted to our servers,
          stored, or shared with anyone.
        </p>
        <h2>Information we collect</h2>
        <p>
          We do not require accounts and do not ask for personal information. Like
          most websites, our hosting provider may log basic technical data (such as
          IP address, browser type and pages visited) for security and diagnostics.
        </p>
        <h2>Advertising</h2>
        <p>
          We display advertisements and sponsored links served by the third-party
          partner stature nonsense (staturenonsense.com). The partner and its
          advertising providers may use cookies, device information, and similar
          technologies to deliver, measure, and personalize ads. Their collection
          and use of information is governed by their own privacy terms. You can
          manage cookies through your browser settings; blocking them may affect
          advertising features.
        </p>
        <h2>Cookies</h2>
        <p>
          We use cookies that may be set by advertising partners and, on the admin
          area only, an authentication cookie. You can disable
          cookies in your browser settings, though some features may not work.
        </p>
        <h2>Children</h2>
        <p>
          This site is a general-audience financial education resource and is not
          directed at children under 13. We do not knowingly collect information
          from children.
        </p>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. Continued use of the site
          after changes constitutes acceptance of the updated policy.
        </p>
      </div>
    </div>
  );
}
