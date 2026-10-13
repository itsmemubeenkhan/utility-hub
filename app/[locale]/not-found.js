import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | The Utility Hub',
  description: 'The page you are looking for does not exist. Explore our free finance calculators instead.',
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="text-7xl font-bold text-gray-200">404</div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-600">
        The page you are looking for does not exist or was moved. Try one of our free calculators instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Back to Home
        </Link>
        <Link
          href="/tools"
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Browse Calculators
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Link href="/tools/budget-calculator" className="text-emerald-700 hover:underline">Budget Calculator</Link>
        <Link href="/tools/mortgage-calculator" className="text-emerald-700 hover:underline">Mortgage Calculator</Link>
        <Link href="/tools/compound-interest-calculator" className="text-emerald-700 hover:underline">Compound Interest</Link>
        <Link href="/tools/loan-payment-calculator" className="text-emerald-700 hover:underline">Loan Calculator</Link>
      </div>
    </main>
  );
}
