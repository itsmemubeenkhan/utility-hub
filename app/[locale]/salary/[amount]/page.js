import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { absUrl, AUTHOR_NAME } from '@/lib/seo';
import { getTool } from '@/lib/tools';
import { relatedGuidesFor } from '@/lib/blog';
import {
  SALARY_AMOUNTS,
  salarySlug,
  parseSalarySlug,
  salaryBreakdown,
  salaryNeighbors,
  salaryFaqs,
  money,
  money0,
} from '@/lib/salary-pages';

const LAST_REVIEWED = '2026-10-26';

export function generateStaticParams() {
  return SALARY_AMOUNTS.map((a) => ({ locale: 'en', amount: salarySlug(a) }));
}

export async function generateMetadata({ params }) {
  const { locale, amount: slugParam } = await params;
  const amount = locale === 'en' ? parseSalarySlug(slugParam) : null;
  if (!amount) return {};
  const b = salaryBreakdown(amount);
  const a = '$' + money0(amount);
  const title = `${a} a Year Is How Much an Hour? $${money(b.hourly)} an Hour, Broken Down`;
  const description = `${a} a year is $${money(b.hourly)} an hour at 40 hours a week. See the full breakdown: $${money(b.monthly)} a month, $${money(b.biweekly)} per paycheck, and an estimated $${money0(b.netAnnual)} a year after federal tax and FICA.`;
  const url = absUrl('/salary/' + salarySlug(amount));
  return {
    title,
    description,
    keywords: `${amount} a year is how much an hour, ${a} a year hourly, ${a} salary per hour, ${a} a year per month, ${a} a year per paycheck, ${a} a year after taxes`,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SalaryPage({ params }) {
  const { locale, amount: slugParam } = await params;
  if (locale !== 'en') notFound();
  const amount = parseSalarySlug(slugParam);
  if (!amount) notFound();

  const b = salaryBreakdown(amount);
  const a = '$' + money0(amount);
  const { prev, next } = salaryNeighbors(amount);
  const faqs = salaryFaqs(amount);
  const tool = getTool('salary-to-hourly-calculator');
  const guides = tool ? relatedGuidesFor(tool, 'en', 2) : [];
  const minWageMultiple = (b.hourly / 7.25).toFixed(1);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const rows = [
    ['Per hour', b.hourly, b.netHourly],
    ['Per day (8 hours)', b.daily, b.netHourly * 8],
    ['Per week', b.weekly, b.netAnnual / 52],
    ['Per paycheck (every 2 weeks)', b.biweekly, b.netBiweekly],
    ['Per month', b.monthly, b.netMonthly],
    ['Per year', b.amount, b.netAnnual],
  ];

  return (
    <div className="container">
      <JsonLd data={faqJsonLd} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <span>{a} a Year</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <span className="post-cat">Salary Guides</span>
        <h1>{a} a Year Is How Much an Hour?</h1>
        <p className="lede">
          {a} a year is ${money(b.hourly)} an hour assuming 40 hours a week (2,080 hours a
          year). That works out to ${money(b.monthly)} a month or ${money(b.biweekly)} per
          biweekly paycheck before taxes, and an estimated ${money0(b.netAnnual)} a year
          after federal tax and FICA.
        </p>
        <p className="byline" style={{ fontSize: '0.9rem', color: '#555', marginTop: 8 }}>
          By {AUTHOR_NAME} · Last reviewed {LAST_REVIEWED}
        </p>
      </div>

      <div className="prose">
        <h2>{a} a Year, Broken Down by Pay Period</h2>
        <table>
          <thead>
            <tr>
              <th>Pay period</th>
              <th>Gross pay</th>
              <th>Estimated take-home</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, gross, net]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>${money(gross)}</td>
                <td>${money(net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          The gross figures are simple divisions of the annual salary: 2,080 work hours a
          year for the hourly rate, 26 biweekly paychecks, and 12 months. The take-home
          column is an estimate, not a promise. It assumes a single filer taking the 2025
          standard deduction of $15,000, which puts federal income tax at about $
          {money0(b.federalTax)} on this salary, plus FICA at 7.65% (about $
          {money0(b.fica)}). That is an effective tax rate of about{' '}
          {b.effectiveRate.toFixed(1)}% before any state tax, which this estimate does not
          include.
        </p>
        <h2>How {a} Compares</h2>
        <p>
          At ${money(b.hourly)} an hour, this salary pays about {minWageMultiple} times the
          federal minimum wage of $7.25 an hour. Within this salary series, each $5,000
          step is worth $2.40 an hour, $416.67 a month, or $192.31 per biweekly paycheck,
          so small raises compound quickly across a year.
        </p>
        <p>
          {prev && (
            <>
              Step down: <Link href={'/salary/' + salarySlug(prev)}>${money0(prev)} a year</Link>{' '}
              is ${money(salaryBreakdown(prev).hourly)} an hour, which is $
              {money0(amount - prev)} a year less.{' '}
            </>
          )}
          {next && (
            <>
              Step up: <Link href={'/salary/' + salarySlug(next)}>${money0(next)} a year</Link>{' '}
              is ${money(salaryBreakdown(next).hourly)} an hour, which is $
              {money0(next - amount)} a year more.
            </>
          )}
        </p>
      </div>

      <div className="card" style={{ marginTop: 28 }}>
        <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>Run Your Own Numbers</h2>
        <p style={{ color: '#334155', marginTop: 0 }}>
          Work a different schedule, get paid weekly, or want to convert the other way,
          from an hourly rate to a salary? The free{' '}
          <Link href="/tools/salary-to-hourly-calculator">salary to hourly calculator</Link>{' '}
          converts both ways with your own hours per week and weeks worked per year.
        </p>
      </div>

      <div className="faq">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <div className="faq-a">{f.a}</div>
          </details>
        ))}
      </div>

      {(prev || next) && (
        <div className="related-posts" style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 18 }}>Nearby Salaries</h2>
          <div className="post-grid">
            {prev && (
              <Link href={'/salary/' + salarySlug(prev)} className="post-card">
                <span className="post-cat">Salary Guides</span>
                <h3>${money0(prev)} a Year</h3>
                <p>${money(salaryBreakdown(prev).hourly)} an hour · ${money(salaryBreakdown(prev).monthly)} a month</p>
                <span className="post-more">See breakdown</span>
              </Link>
            )}
            {next && (
              <Link href={'/salary/' + salarySlug(next)} className="post-card">
                <span className="post-cat">Salary Guides</span>
                <h3>${money0(next)} a Year</h3>
                <p>${money(salaryBreakdown(next).hourly)} an hour · ${money(salaryBreakdown(next).monthly)} a month</p>
                <span className="post-more">See breakdown</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {guides.length > 0 && (
        <div className="related-posts" style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 18 }}>Related Guides</h2>
          <div className="post-grid">
            {guides.map((g) => (
              <Link key={g.slug} href={'/blog/' + g.slug} className="post-card">
                <span className="post-cat">{g.category}</span>
                <h3>{g.title}</h3>
                <p>{g.description}</p>
                <span className="post-more">Read guide</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="disclaimer">
        <strong>Estimate only.</strong> Take-home figures use 2025 federal brackets for a
        single filer with the standard deduction, plus 7.65% FICA. State and local taxes,
        benefits, retirement contributions and credits are not included, so your actual
        paycheck will differ. This page is general information, not tax or financial advice.
      </div>
    </div>
  );
}
