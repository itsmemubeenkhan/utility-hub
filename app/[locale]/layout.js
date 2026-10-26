import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AdBlockNotice from '@/components/AdBlockNotice';
import JsonLd from '@/components/JsonLd';
import { defaultMetadata, websiteJsonLd, absUrl, SITE_NAME, VIEWPORT } from '@/lib/seo';

export const viewport = VIEWPORT;

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
        default: `${SITE_NAME}: Calculadoras, herramientas gratis y guías de dinero`,
        template: `%s | ${SITE_NAME}`,
      },
      description:
        'Calculadoras, herramientas gratis y guías de dinero en español. Hipotecas, préstamos, impuestos, salario, códigos QR y más, explicados en lenguaje sencillo.',
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
      'Calculadoras, herramientas gratis y guías de dinero en español para la comunidad hispana en EE. UU.',
    inLanguage: 'es',
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();
  return (
    <html lang={locale}>
      <head>
        <meta name="msvalidate.01" content="83640246711817BE244DAD6F49371EE4" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151079172142628"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <JsonLd data={locale === 'es' ? websiteJsonLdEs() : websiteJsonLd()} />
        <SiteHeader lang={locale} />
        <main>{children}</main>
        <SiteFooter lang={locale} />
        <AdBlockNotice lang={locale} />
      </body>
    </html>
  );
}
