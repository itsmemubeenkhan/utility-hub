import { TOOLS } from '@/lib/tools';
import { TOOLS_ES } from '@/lib/tools.es';
import { getAllPosts } from '@/lib/blog';
import HomePageContent from '@/components/HomePageContent';
import { absUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    alternates: {
      canonical: absUrl(isEs ? '/es' : '/'),
      languages: { en: absUrl('/'), es: absUrl('/es'), 'x-default': absUrl('/') },
    },
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
