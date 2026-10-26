import { notFound } from 'next/navigation';
import { getTool } from '@/lib/tools';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Pay Stub Generator | The Utility Hub',
  description:
    'Free embeddable pay stub generator: create a printable pay stub from hours, rate and deductions, with FICA auto-calc and YTD columns.',
  robots: { index: false, follow: true },
};

/* Bare embed of the Pay Stub Generator for third-party sites. Renders the
   same PayStubTool component as /tools/pay-stub-generator. */
export default function EmbedPayStubGeneratorPage() {
  const tool = getTool('pay-stub-generator');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="en"
      canonical="https://www.theutilityhub.online/tools/pay-stub-generator"
    />
  );
}
