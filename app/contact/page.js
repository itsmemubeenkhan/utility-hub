import { absUrl, SITE_NAME } from '@/lib/seo';

export const metadata = {
  title: 'Contact',
  description: `Contact ${SITE_NAME}: questions, feedback and corrections.`,
  alternates: { canonical: absUrl('/contact') },
};

export default function ContactPage() {
  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Contact us</h1>
        <p className="lede">
          Questions about a calculator, a correction for an article, or feedback on
          the site — we would like to hear from you.
        </p>
      </div>
      <div className="card prose">
        <h2>Email</h2>
        <p>
          Reach us at <a href="mailto:contact@example.com">contact@example.com</a>.
          Please replace this address with the site's real contact email before launch.
        </p>
        <h2>What to include</h2>
        <p>
          For calculator issues, tell us which tool you used, the numbers you entered
          and what looked wrong — it helps us reproduce and fix the problem quickly.
          For article corrections, include the article title and the passage in
          question.
        </p>
        <p>We aim to respond within a few business days.</p>
      </div>
    </div>
  );
}
