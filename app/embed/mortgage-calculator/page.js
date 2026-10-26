import { notFound } from 'next/navigation';
import { getTool } from '@/lib/tools';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Mortgage Calculator | The Utility Hub',
  description:
    'Free embeddable mortgage calculator: monthly payment with taxes, insurance and PMI, calculated in seconds.',
  robots: { index: false, follow: true },
};

/* Bare embed of the Mortgage Calculator for third-party sites. Reuses the
   exact tool definition (inputs + calcKey) from lib/tools. */
export default function EmbedMortgageCalculatorPage() {
  const tool = getTool('mortgage-calculator');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="en"
      canonical="https://www.theutilityhub.online/tools/mortgage-calculator"
    />
  );
}
