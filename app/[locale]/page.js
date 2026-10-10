import { TOOLS } from '@/lib/tools';
import { TOOLS_ES } from '@/lib/tools.es';
import { getAllPosts } from '@/lib/blog';
import HomePageContent from '@/components/HomePageContent';
import { absUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const title = isEs
    ? 'UtilityHub: Calculadoras financieras gratuitas y guías de dinero'
    : 'UtilityHub: Free Finance Calculators & Money Guides';
  const description = isEs
    ? 'Calculadoras financieras gratuitas y guías de dinero en español. Hipotecas, préstamos, interés compuesto, salario, jubilación y deudas, explicados en lenguaje sencillo.'
    : 'Free US finance calculators and plain-English money guides. Mortgage, loan, EMI, compound interest, paycheck, retirement and debt payoff calculators with clear explanations.';
  const url = absUrl(isEs ? '/es' : '/');
  return {
    alternates: {
      canonical: url,
      languages: { en: absUrl('/'), es: absUrl('/es'), 'x-default': absUrl('/') },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(isEs ? { locale: 'es_US' } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const tools = locale === 'es' ? TOOLS_ES : TOOLS;
  const toolCards = tools.map(({ slug, name, tagline, category, badge }) => ({
    slug, name, tagline, category, badge,
  }));
  return <HomePageContent lang={locale} tools={toolCards} posts={getAllPosts(locale)} />;
}
