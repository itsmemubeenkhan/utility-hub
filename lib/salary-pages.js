/* Programmatic salary pages: /salary/<amount>-a-year-hourly
   One entry per annual salary from $25,000 to $150,000 in $5,000 steps.
   All numbers on a page are computed here from the amount, never typed in,
   so every figure on the page stays consistent with the formula.

   Take-home estimate method (documented on each page):
   - 2025 federal income tax, single filer, standard deduction of $15,000,
     progressive brackets applied to taxable income.
   - FICA at a flat 7.65% of gross pay (Social Security 6.2% plus Medicare
     1.45%). The Social Security wage base ($176,100 for 2025) sits above the
     top salary in this series, so the flat rate holds across all pages.
   - State tax, local tax, credits, pre-tax deductions and filing status
     differences are NOT included. It is an estimate, not tax advice. */

export const SALARY_STEP = 5000;
export const SALARY_MIN = 25000;
export const SALARY_MAX = 150000;

export const SALARY_AMOUNTS = [];
for (let a = SALARY_MIN; a <= SALARY_MAX; a += SALARY_STEP) SALARY_AMOUNTS.push(a);

export function salarySlug(amount) {
  return amount + '-a-year-hourly';
}

export function parseSalarySlug(slug) {
  const m = /^(\d+)-a-year-hourly$/.exec(String(slug || ''));
  if (!m) return null;
  const amount = Number(m[1]);
  return SALARY_AMOUNTS.includes(amount) ? amount : null;
}

export function money(n, decimals = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function money0(n) {
  return Math.round(n).toLocaleString('en-US');
}

/* 2025 federal brackets for a single filer (taxable income thresholds). */
const FED_BRACKETS = [
  { upTo: 11925, rate: 0.1 },
  { upTo: 48475, rate: 0.12 },
  { upTo: 103350, rate: 0.22 },
  { upTo: 197300, rate: 0.24 },
  { upTo: Infinity, rate: 0.32 },
];
const STANDARD_DEDUCTION = 15000;
const FICA_RATE = 0.0765;

export function estimateFederalTax(gross) {
  let taxable = Math.max(0, gross - STANDARD_DEDUCTION);
  let tax = 0;
  let prev = 0;
  for (const b of FED_BRACKETS) {
    if (taxable <= 0) break;
    const inBracket = Math.min(taxable, b.upTo - prev);
    if (inBracket > 0) tax += inBracket * b.rate;
    taxable -= inBracket;
    prev = b.upTo;
  }
  return tax;
}

export function salaryBreakdown(amount) {
  const hoursPerYear = 2080; // 40 hours/week x 52 weeks
  const hourly = amount / hoursPerYear;
  const federalTax = estimateFederalTax(amount);
  const fica = amount * FICA_RATE;
  const netAnnual = amount - federalTax - fica;
  return {
    amount,
    hoursPerYear,
    hourly,
    daily: hourly * 8,
    weekly: amount / 52,
    biweekly: amount / 26,
    monthly: amount / 12,
    federalTax,
    fica,
    totalTax: federalTax + fica,
    effectiveRate: ((federalTax + fica) / amount) * 100,
    netAnnual,
    netMonthly: netAnnual / 12,
    netBiweekly: netAnnual / 26,
    netHourly: netAnnual / hoursPerYear,
  };
}

export function salaryNeighbors(amount) {
  const i = SALARY_AMOUNTS.indexOf(amount);
  return {
    prev: i > 0 ? SALARY_AMOUNTS[i - 1] : null,
    next: i >= 0 && i < SALARY_AMOUNTS.length - 1 ? SALARY_AMOUNTS[i + 1] : null,
  };
}

export function salaryFaqs(amount) {
  const b = salaryBreakdown(amount);
  const a = '$' + money0(amount);
  return [
    {
      q: `How much is ${a} a year per hour?`,
      a: `${a} a year is $${money(b.hourly)} an hour before taxes, based on 40 hours a week and 52 weeks a year (2,080 work hours). The formula is ${a} divided by 2,080. If you work a different schedule, divide your salary by your actual yearly hours instead.`,
    },
    {
      q: `How much is ${a} a year per month and per paycheck?`,
      a: `${a} a year is $${money(b.monthly)} a month before taxes, $${money(b.weekly)} a week, or $${money(b.biweekly)} per biweekly paycheck (26 paychecks a year). Paid twice a month instead, each paycheck is $${money(amount / 24)} before taxes.`,
    },
    {
      q: `How much is ${a} a year after taxes?`,
      a: `A rough estimate is $${money0(b.netAnnual)} a year take-home, or about $${money(b.netBiweekly)} per biweekly paycheck. That estimate uses 2025 federal brackets for a single filer with the $15,000 standard deduction (about $${money0(b.federalTax)} of federal tax) plus 7.65% FICA (about $${money0(b.fica)}). State tax and other deductions would lower it further.`,
    },
    {
      q: `What hourly rate do I need to make ${a} a year?`,
      a: `You need to earn at least $${money(b.hourly)} an hour at 40 hours a week with no unpaid time off. With two unpaid weeks off (2,000 work hours), you would need $${money(amount / 2000)} an hour to reach the same ${a}.`,
    },
  ];
}
