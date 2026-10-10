import Link from 'next/link';
import { TOOLS } from '@/lib/tools';
import { TOOLS_ES } from '@/lib/tools.es';
import { getDict } from '@/lib/i18n';
import JsonLd from '@/components/JsonLd';
import ToolGrid from '@/components/ToolGrid';
import { absUrl } from '@/lib/seo';
import { BannerAd } from '@/components/AdSlot';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl(isEs ? '/es/tools' : '/tools');
  const title = isEs ? 'Calculadoras financieras gratuitas' : 'Free Finance Calculators';
  const description = isEs
    ? 'Todas nuestras calculadoras financieras gratuitas en un solo lugar: hipotecas, préstamos, interés compuesto, salario, jubilación y pago de deudas.'
    : 'All of our free finance calculators in one place: mortgage, loan, EMI, compound interest, paycheck, retirement, debt payoff and more.';
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: absUrl('/tools'), es: absUrl('/es/tools'), 'x-default': absUrl('/tools') },
    },
    openGraph: {
      title: `${title} | UtilityHub`,
      description,
      url,
      type: 'website',
      ...(isEs ? { locale: 'es_US' } : {}),
    },
    twitter: { card: 'summary_large_image', title: `${title} | UtilityHub`, description },
  };
}

export default async function ToolsIndex({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const t = getDict(locale);
  const prefix = isEs ? '/es' : '';
  const tools = (isEs ? TOOLS_ES : TOOLS).map(({ slug, name, tagline, category, badge }) => ({
    slug, name, tagline, category, badge,
  }));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isEs ? 'Calculadoras financieras gratuitas' : 'Free finance calculators',
    ...(isEs ? { inLanguage: 'es' } : {}),
    itemListElement: tools.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absUrl(`${prefix}/tools/${tool.slug}`),
      name: tool.name,
    })),
  };
  return (
    <div className="container">
      <JsonLd data={itemList} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={prefix || '/'}>{t.blog.home}</Link> › <span>{isEs ? 'Calculadoras' : 'Calculators'}</span>
      </nav>
      <div className="page-head" style={{ marginBottom: 28 }}>
        <h1>{isEs ? 'Calculadoras financieras gratuitas' : 'Free finance calculators'}</h1>
        <p className="lede">
          {isEs
            ? 'Doce herramientas precisas para hipotecas, préstamos, inversiones, impuestos y deudas. Sin registro, privadas y siempre gratuitas.'
            : 'Twelve precision tools for mortgages, loans, investing, taxes and debt. No sign-up, private by design, and free forever.'}
        </p>
      </div>
      <ToolGrid tools={tools} lang={locale} />
      <BannerAd />
    </div>
  );
}
