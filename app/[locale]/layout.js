import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { defaultMetadata, websiteJsonLd, absUrl, SITE_NAME } from '@/lib/seo';

export const LOCALES = ['en', 'es'];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (locale === 'es') {
    return {
      metadataBase: new URL('https://www.theutilityhub.online'),
      title: {
        default: `${SITE_NAME}: Calculadoras financieras gratuitas y guías de dinero`,
        template: `%s | ${SITE_NAME}`,
      },
      description:
        'Calculadoras financieras gratuitas y guías de dinero en español. Hipotecas, préstamos, interés compuesto, salario, jubilación y deudas, explicados en lenguaje sencillo.',
    };
  }
  return defaultMetadata();
}

function websiteJsonLdEs() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absUrl('/es'),
    description:
      'Calculadoras financieras gratuitas y guías de dinero en español para la comunidad hispana en EE. UU.',
    inLanguage: 'es',
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();
  return (
    <html lang={locale}>
      <body>
        <JsonLd data={locale === 'es' ? websiteJsonLdEs() : websiteJsonLd()} />
        <SiteHeader lang={locale} />
        <main>{children}</main>
        <SiteFooter lang={locale} />
      </body>
    </html>
  );
}
