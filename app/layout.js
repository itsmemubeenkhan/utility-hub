import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { defaultMetadata, websiteJsonLd } from '@/lib/seo';

export const metadata = defaultMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={websiteJsonLd()} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
