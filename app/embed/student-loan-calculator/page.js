import { notFound } from 'next/navigation';
import { getTool } from '@/lib/tools';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Student Loan Calculator | The Utility Hub',
  description:
    'Free embeddable student loan calculator: monthly payment, total interest and payoff date, calculated in seconds.',
  robots: { index: false, follow: true },
};

/* Bare embed of the Student Loan Calculator for third-party sites. Reuses
   the exact tool definition (inputs + calcKey) from lib/tools. */
export default function EmbedStudentLoanCalculatorPage() {
  const tool = getTool('student-loan-calculator');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="en"
      canonical="https://www.theutilityhub.online/tools/student-loan-calculator"
    />
  );
}
