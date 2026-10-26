import { notFound } from 'next/navigation';
import { getTool } from '@/lib/tools';
import ToolRunner from '@/components/ToolRunner';

export const metadata = {
  title: 'Tip Calculator | The Utility Hub',
  description:
    'Free embeddable tip calculator: tip amount, total with tip and per-person split, calculated in seconds.',
  robots: { index: false, follow: true },
};

/* Bare embed of the Tip Calculator for third-party sites. Reuses the exact
   tool definition (inputs + calcKey) from lib/tools, so the math is the
   same code path as /tools/tip-calculator. The only addition is the
   visible attribution footer, which is the point of the embed program. */
export default function EmbedTipCalculatorPage() {
  const tool = getTool('tip-calculator');
  if (!tool) notFound();
  return (
    <div className="embed-wrap">
      <div className="embed-head">
        <h1>Tip Calculator</h1>
        <p>Tip, total and per-person split in one tap.</p>
      </div>
      <ToolRunner calcKey={tool.calcKey} inputs={tool.inputs} lang="en" />
      <p className="embed-foot">
        Powered by{' '}
        <a
          href="https://www.theutilityhub.online/tools/tip-calculator"
          target="_blank"
          rel="noopener"
        >
          The Utility Hub: Tip Calculator
        </a>
      </p>
    </div>
  );
}
