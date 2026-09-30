/* Site URL + shared SEO helpers. Set NEXT_PUBLIC_SITE_URL to the real domain. */

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return raw.replace(/\/+$/, '');
}

export function absUrl(path) {
  const p = path.startsWith('/') ? path : '/' + path;
  return siteUrl() + p;
}

export const SITE_NAME = 'UtilityHub';
export const SITE_TAGLINE = 'Free US finance calculators and plain-English money guides.';

export function defaultMetadata() {
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${SITE_NAME} — Free Finance Calculators & Money Guides`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_TAGLINE + ' Mortgage, loan, EMI, compound interest, paycheck, retirement and debt payoff calculators with clear explanations.',
  };
}

export function jsonLd(obj) {
  return JSON.stringify(obj);
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_TAGLINE,
  };
}
