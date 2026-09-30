/* Benchmark tests for lib/calculations.js — run with: npm run test:calc */
import assert from 'node:assert/strict';
import {
  mortgage, loanpayment, compound, savingsgoal, debtpayoff,
  refinance, paycheck, creditcard, retirement, affordability, emi, autoloan,
} from '../lib/calculations.js';
import { CALCULATORS } from '../lib/tool-calculations.js';
import { TOOLS } from '../lib/tools.js';

const money = (s) => Number(s.replace(/[$,]/g, ''));

function check(name, actual, expected, tol = 0.02) {
  const a = money(actual);
  assert.ok(
    Math.abs(a - expected) <= tol,
    `${name}: expected ${expected}, got ${a} (${actual})`
  );
  console.log(`ok - ${name}: ${actual}`);
}

// 1. Mortgage: $400k, 30yr @6.5% -> $2,528.27/mo
check(
  'mortgage $400k/30yr/6.5%',
  mortgage({ homePrice: 400000, downPayment: 0, rate: 6.5, years: 30, tax: 0, insurance: 0, includePmi: false }).outputs[0].value,
  2528.27
);

// 2. Loan payment: $25k, 5yr @8% -> $506.91/mo
check(
  'loan $25k/5yr/8%',
  loanpayment({ amount: 25000, rate: 8, years: 5, months: 0 }).outputs[0].value,
  506.91
);

// 3. EMI: $25k, 5yr @8% -> $506.91/mo
check(
  'emi $25k/5yr/8%',
  emi({ amount: 25000, rate: 8, years: 5 }).outputs[0].value,
  506.91
);

// 4. Compound: $10k @10%/yr monthly-compounded, 10yr -> $27,070.41
check(
  'compound $10k/10yr/10%',
  compound({ principal: 10000, monthlyAdd: 0, rate: 10, years: 10, freq: 'monthly' }).outputs[0].value,
  27070.41,
  0.05
);

// 5. Savings goal: $50k in 5yr @6%, $0 start -> $716.64/mo
check(
  'savings goal $50k/5yr/6%',
  savingsgoal({ goal: 50000, starting: 0, rate: 6, years: 5 }).outputs[0].value,
  716.64
);

// 6. Debt payoff: $15k @18%, $400/mo -> 56 payments
{
  const r = debtpayoff({ balance: 15000, rate: 18, payment: 400 });
  assert.ok(!r.warn, 'debtpayoff should not warn');
  assert.ok(r.outputs[0].value.includes('56 payments'), 'expected 56 payments, got: ' + r.outputs[0].value);
  console.log('ok - debtpayoff $15k/18%/$400mo: ' + r.outputs[0].value);
}

// 7. Debt payoff warn path: payment below monthly interest
{
  const r = debtpayoff({ balance: 15000, rate: 18, payment: 100 });
  assert.ok(r.warn === true, 'debtpayoff should warn on too-small payment');
  console.log('ok - debtpayoff warn path');
}

// 8. Refinance: $350k, 7.25% (25yr left) -> 6% (30yr), $6k costs -> $431.40/mo saved, 19-mo breakeven
{
  const r = refinance({ balance: 350000, oldRate: 7.25, remainingYears: 25, newRate: 6, newTermYears: 30, closingCost: 6000 });
  check('refinance monthly savings', r.outputs[2].value, 431.40, 0.5);
  assert.ok(r.outputs[3].value.includes('14 months') || r.outputs[3].value.includes('months'), 'breakeven: ' + r.outputs[3].value);
  console.log('ok - refinance breakeven: ' + r.outputs[3].value);
}

// 9. Auto loan: $35k price, $5k down, $3k trade, 7%, 60mo -> $534.63/mo
check(
  'autoloan $35k/7%/60mo',
  autoloan({ price: 35000, downPayment: 5000, tradeIn: 3000, rate: 7, months: 60 }).outputs[0].value,
  534.63,
  0.05
);

// 10. Paycheck: $80k biweekly, 5% state -> $2,333.31 net per paycheck
check(
  'paycheck $80k biweekly 5% state',
  paycheck({ salary: 80000, frequency: 'biweekly', stateRate: 5 }).outputs[0].value,
  2333.31,
  0.05
);

// 11. Credit card: $8k @24%, $250/mo -> 52 payments
{
  const r = creditcard({ balance: 8000, rate: 24, payment: 250 });
  assert.ok(!r.warn, 'creditcard should not warn');
  assert.ok(r.outputs[0].value.includes('52 payments'), 'expected 52 payments, got: ' + r.outputs[0].value);
  console.log('ok - creditcard $8k/24%/$250mo: ' + r.outputs[0].value);
}

// 12. Credit card warn path
{
  const r = creditcard({ balance: 8000, rate: 24, payment: 100 });
  assert.ok(r.warn === true, 'creditcard should warn on too-small payment');
  console.log('ok - creditcard warn path');
}

// 13. Retirement: independent closed-form check.
// current 25k, 800/mo + 50%-of-500 employer match = 1050/mo, 8%/yr, 30yr.
// end = 25000*(1+r)^360 + 1050*(((1+r)^360 - 1)/r), r = 0.08/12
{
  const r = 0.08 / 12, n = 360;
  const growth = Math.pow(1 + r, n);
  const expected = 25000 * growth + 1050 * ((growth - 1) / r);
  const res = retirement({ current: 25000, monthly: 800, rate: 8, years: 30, salary: 100000, match: 50, matchCapPct: 6 });
  check('retirement 401k closed-form', res.outputs[0].value, expected, 1);
  // employer match: min(800, 100000*6%/12=500) * 50% = 250/mo -> $90,000 over 30yr
  check('retirement employer match', res.outputs[3].value, 90000, 0.01);
}

// 14. Affordability: $80k income, $500 debt, 6.5%, 30yr, 20% down -> max price ~$308k
{
  const r = affordability({ income: 80000, debtPayments: 500, rate: 6.5, years: 30, downPct: 20 });
  const price = money(r.outputs[1].value);
  assert.ok(price > 250000 && price < 400000, 'affordability price out of range: ' + price);
  console.log('ok - affordability $80k: max price ' + r.outputs[1].value);
}

// 15. Charts: every calculator returns sane chart specs
for (const t of TOOLS) {
  const defaults = {};
  t.inputs.forEach((d) => { defaults[d.key] = d.default; });
  const r = CALCULATORS[t.slug](defaults);
  assert.ok(Array.isArray(r.outputs) && r.outputs.length > 0, t.slug + ' outputs');
  for (const o of r.outputs) assert.ok(typeof o.label === 'string' && typeof o.value === 'string', t.slug + ' output shape');
  console.log(`ok - ${t.slug}: ${r.outputs.length} outputs`);
}

console.log('\nAll calculator benchmarks passed.');
