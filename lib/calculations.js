/* UtilityHub shared calculator engine, pure math, no DOM, no dependencies.
   Ported from the verified FinanceScout static build; benchmarks preserved. */

export function pmt(pv, r, n) {
  if (n <= 0) return 0;
  if (r === 0) return pv / n;
  return (pv * r) / (1 - Math.pow(1 + r, -n));
}

export function fvAnnuity(payment, r, n) {
  if (n <= 0) return 0;
  if (r === 0) return payment * n;
  return (payment * (Math.pow(1 + r, n) - 1)) / r;
}

export function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

export function fmt(n) {
  return (
    '$' +
    Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/* Result shape:
   { outputs: [{label, value, highlight?}], donut: {labels, values, colors} | null,
     line: {labels, values, title} | null,
     stacked: {labels, series: [{name, values, color}], title} | null,
     note?: string, warn?: boolean } */

/* ---------- 1. Mortgage ---------- */
export function mortgage(v) {
  const home = v.homePrice, down = v.downPayment, rate = v.rate / 100 / 12, n = v.years * 12;
  const loan = Math.max(0, home - down);
  const pay = pmt(loan, rate, n);
  const tax = (v.tax || 0) / 12, ins = (v.insurance || 0) / 12;
  let pmi = 0;
  if (down < home * 0.2 && v.includePmi) pmi = (loan * 0.005) / 12;
  const total = pay + tax + ins + pmi;
  let bal = loan, totInt = 0;
  const balPts = [], labPts = [];
  for (let m = 1; m <= n; m++) {
    const i = bal * rate;
    totInt += i;
    bal = Math.max(0, bal - (pay - i));
    if (m % 12 === 0 || m === n) {
      balPts.push(round2(bal));
      labPts.push('Yr ' + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: 'Monthly principal & interest', value: fmt(pay), highlight: true },
      { label: 'Loan amount', value: fmt(loan) },
      { label: 'Property tax (monthly)', value: fmt(tax) },
      { label: 'Home insurance (monthly)', value: fmt(ins) },
      { label: 'PMI (monthly)', value: fmt(pmi) },
      { label: 'Total monthly payment', value: fmt(total), highlight: true },
      { label: 'Total interest over loan', value: fmt(totInt) },
      { label: 'Total cost of loan', value: fmt(loan + totInt) },
    ],
    donut: { labels: ['Principal', 'Interest'], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: labPts, values: balPts, title: 'Remaining loan balance by year' },
    stacked: null,
  };
}

/* ---------- 2. Home affordability ---------- */
export function affordability(v) {
  const annual = v.income, debt = v.debtPayments || 0;
  const rate = v.rate / 100 / 12, n = v.years * 12, down = v.downPct / 100;
  const maxHouse = (annual * 0.28) / 12; // 28% front-end rule
  const maxTotal = (annual * 0.36) / 12 - debt; // 36% back-end rule
  const allowed = Math.max(0, Math.min(maxHouse, maxTotal));
  const loan = (allowed * (1 - Math.pow(1 + rate, -n))) / (rate || 1e-9);
  const price = down >= 1 ? 0 : loan / (1 - down);
  const maxHousePts = [], lab = [];
  [0.2, 0.25, 0.28, 0.32, 0.36].forEach((r) => {
    const a = Math.max(0, Math.min((annual * r) / 12, (annual * 0.36) / 12 - debt));
    const l = (a * (1 - Math.pow(1 + rate, -n))) / (rate || 1e-9);
    maxHousePts.push(round2(down >= 1 ? 0 : l / (1 - down)));
    lab.push(Math.round(r * 100) + '%');
  });
  return {
    outputs: [
      { label: 'Max monthly housing payment', value: fmt(allowed), highlight: true },
      { label: 'Max home price you can afford', value: fmt(price), highlight: true },
      { label: 'Max loan amount', value: fmt(loan) },
      { label: 'Front-end limit (28% of income)', value: fmt(maxHouse) },
      { label: 'Back-end limit (36% minus debts)', value: fmt(maxTotal) },
    ],
    donut: null,
    line: { labels: lab, values: maxHousePts, title: 'Max home price at different income ratios' },
    stacked: null,
  };
}

/* ---------- 3. Loan payment (generic) ---------- */
export function loanpayment(v) {
  const loan = v.amount, rate = v.rate / 100 / 12, n = v.years * 12 + (v.months || 0);
  const pay = pmt(loan, rate, n);
  let bal = loan, totInt = 0;
  const pts = [], lab = [];
  for (let m = 1; m <= n; m++) {
    const i = bal * rate;
    totInt += i;
    bal = Math.max(0, bal - (pay - i));
    if (m % 12 === 0 || m === n) {
      pts.push(round2(bal));
      lab.push('Yr ' + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: 'Monthly payment', value: fmt(pay), highlight: true },
      { label: 'Total interest', value: fmt(totInt) },
      { label: 'Total repayment', value: fmt(loan + totInt) },
      { label: 'Number of payments', value: String(n) },
    ],
    donut: { labels: ['Principal', 'Interest'], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: lab, values: pts, title: 'Remaining balance by year' },
    stacked: null,
  };
}

/* ---------- 4. EMI calculator ---------- */
export function emi(v) {
  const loan = v.amount, rate = v.rate / 100 / 12, n = v.years * 12;
  const payment = pmt(loan, rate, n);
  let bal = loan, totInt = 0, princPaid = 0;
  const ptsI = [], ptsP = [], lab = [];
  for (let m = 1; m <= n; m++) {
    const i = bal * rate;
    totInt += i;
    princPaid += payment - i;
    bal = Math.max(0, bal - (payment - i));
    if (m % 12 === 0 || m === n) {
      ptsI.push(round2(totInt));
      ptsP.push(round2(princPaid));
      lab.push('Yr ' + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: 'Monthly EMI', value: fmt(payment), highlight: true },
      { label: 'Principal amount', value: fmt(loan) },
      { label: 'Total interest', value: fmt(totInt) },
      { label: 'Total payment', value: fmt(loan + totInt) },
    ],
    donut: { labels: ['Principal', 'Interest'], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: 'Principal repaid', values: ptsP, color: '#1e3a8a' },
        { name: 'Interest paid', values: ptsI, color: '#38bdf8' },
      ],
      title: 'Cumulative principal vs interest paid',
    },
  };
}

/* ---------- 5. Compound interest ---------- */
export function compound(v) {
  const p = v.principal, rate = v.rate / 100, n = v.years;
  const f = { annually: 1, semiannually: 2, quarterly: 4, monthly: 12, daily: 365 }[v.freq] || 12;
  const add = v.monthlyAdd || 0;
  let bal = p, contrib = p;
  const pts = [], lab = [];
  for (let y = 1; y <= n; y++) {
    for (let k = 0; k < f; k++) {
      bal *= 1 + rate / f;
      if (f === 12) {
        bal += add;
        contrib += add;
      } else if (k === f - 1) {
        bal += add * 12;
        contrib += add * 12;
      }
    }
    pts.push(round2(bal));
    lab.push('Yr ' + y);
  }
  const interest = bal - contrib;
  return {
    outputs: [
      { label: 'Future value', value: fmt(bal), highlight: true },
      { label: 'Total contributions', value: fmt(contrib) },
      { label: 'Interest earned', value: fmt(interest), highlight: true },
    ],
    donut: { labels: ['Contributions', 'Interest earned'], values: [contrib, interest], colors: ['#1e3a8a', '#22c55e'] },
    line: null,
    stacked: {
      labels: lab,
      series: [{ name: 'Projected balance', values: pts, color: '#1e3a8a' }],
      title: 'Balance growth over time',
    },
  };
}

/* ---------- 6. Savings goal ---------- */
export function savingsgoal(v) {
  const goal = v.goal, rate = v.rate / 100 / 12, n = v.years * 12;
  const start = v.starting || 0;
  const need = goal - start * Math.pow(1 + rate, n);
  const dep = need <= 0 ? 0 : rate === 0 ? need / n : (need * rate) / (Math.pow(1 + rate, n) - 1);
  let bal = start, tot = start;
  const pts = [], lab = [];
  for (let m = 1; m <= n; m++) {
    bal = bal * (1 + rate) + dep;
    tot += dep;
    if (m % 12 === 0 || m === n) {
      pts.push(round2(bal));
      lab.push('Yr ' + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: 'Required monthly deposit', value: fmt(dep), highlight: true },
      { label: 'Total deposits', value: fmt(tot) },
      { label: 'Interest earned', value: fmt(Math.max(0, bal - tot)) },
      { label: 'Projected total', value: fmt(bal) },
    ],
    donut: { labels: ['Your deposits', 'Interest earned'], values: [tot, Math.max(0, bal - tot)], colors: ['#1e3a8a', '#22c55e'] },
    line: { labels: lab, values: pts, title: 'Projected savings over time' },
    stacked: null,
  };
}

/* ---------- 7. Debt payoff ---------- */
export function debtpayoff(v) {
  const bal = v.balance, rate = v.rate / 100 / 12, pay = v.payment;
  const minI = bal * rate;
  if (pay <= minI) {
    return {
      outputs: [
        { label: 'Payoff time', value: 'Never: payment must exceed ' + fmt(minI) + '/mo interest', highlight: true },
        { label: 'Monthly payment', value: fmt(pay) },
      ],
      donut: null, line: null, stacked: null, warn: true,
    };
  }
  let months = 0, totInt = 0, b = bal;
  const pts = [], lab = [];
  while (b > 0 && months < 1200) {
    const i = b * rate;
    totInt += i;
    b = b + i - pay;
    months++;
    if (months % 12 === 0) {
      pts.push(round2(Math.max(0, b)));
      lab.push('Yr ' + months / 12);
    }
  }
  pts.push(0);
  lab.push('Done');
  const yrs = Math.floor(months / 12), mo = months % 12;
  return {
    outputs: [
      { label: 'Debt-free in', value: yrs + ' yrs ' + mo + ' mos (' + months + ' payments)', highlight: true },
      { label: 'Total interest', value: fmt(totInt) },
      { label: 'Total paid', value: fmt(bal + totInt) },
      { label: 'Monthly payment', value: fmt(pay) },
    ],
    donut: { labels: ['Original debt', 'Interest paid'], values: [bal, totInt], colors: ['#1e3a8a', '#ef4444'] },
    line: { labels: lab, values: pts, title: 'Remaining debt by year' },
    stacked: null,
  };
}

/* ---------- 8. Refinance ---------- */
export function refinance(v) {
  const bal = v.balance;
  const r1 = v.oldRate / 100 / 12, r2 = v.newRate / 100 / 12;
  const rem = v.remainingYears * 12, term = v.newTermYears * 12, cost = v.closingCost;
  const oldPay = pmt(bal, r1, rem);
  const newPay = pmt(bal, r2, term);
  const save = oldPay - newPay;
  const breakeven = save > 0 ? cost / save : Infinity;
  const oldInt = oldPay * rem - bal, newInt = newPay * term - bal;
  const rec =
    save > 0
      ? 'Refinancing could save you ' + fmt(save) + '/mo. Closing costs break even in ' +
        (isFinite(breakeven) ? Math.ceil(breakeven) + ' months' : 'N/A') + '.'
      : 'At these terms the new payment is higher. Refinancing is not recommended.';
  return {
    outputs: [
      { label: 'Current monthly payment', value: fmt(oldPay) },
      { label: 'New monthly payment', value: fmt(newPay), highlight: true },
      { label: 'Monthly savings', value: fmt(Math.max(0, save)), highlight: true },
      { label: 'Breakeven point', value: isFinite(breakeven) ? Math.ceil(breakeven) + ' months' : 'N/A' },
      { label: 'Old loan total interest', value: fmt(oldInt) },
      { label: 'New loan total interest', value: fmt(newInt) },
      { label: 'Lifetime interest savings', value: fmt(Math.max(0, oldInt - newInt)) },
      { label: 'Recommendation', value: rec },
    ],
    donut: { labels: ['Old loan interest', 'New loan interest'], values: [oldInt, newInt], colors: ['#ef4444', '#22c55e'] },
    line: null,
    stacked: null,
  };
}

/* ---------- 9. Auto loan ---------- */
export function autoloan(v) {
  const price = v.price, down = v.downPayment || 0, trade = v.tradeIn || 0;
  const loan = Math.max(0, price - down - trade);
  const rate = v.rate / 100 / 12, n = v.months;
  const pay = pmt(loan, rate, n);
  let bal = loan, totInt = 0;
  const pts = [], lab = [];
  for (let m = 1; m <= n; m++) {
    const i = bal * rate;
    totInt += i;
    bal = Math.max(0, bal - (pay - i));
    if (m % 12 === 0 || m === n) {
      pts.push(round2(bal));
      lab.push('Yr ' + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: 'Monthly payment', value: fmt(pay), highlight: true },
      { label: 'Loan amount', value: fmt(loan) },
      { label: 'Total interest', value: fmt(totInt) },
      { label: 'Total cost of vehicle', value: fmt(price + totInt - trade) },
    ],
    donut: { labels: ['Vehicle (net)', 'Interest'], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: lab, values: pts, title: 'Remaining loan balance by year' },
    stacked: null,
  };
}

/* ---------- 10. Salary paycheck (US federal estimate, single filer, 2025 brackets) ---------- */
export function paycheck(v) {
  const annual = v.salary;
  const freqN = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 }[v.frequency] || 26;
  const stdDed = 15000; // 2025 single filer standard deduction (approx)
  const taxable = Math.max(0, annual - stdDed);
  const brackets = [
    [11925, 0.1], [48475, 0.12], [103350, 0.22], [197300, 0.24],
    [250525, 0.32], [626350, 0.35], [Infinity, 0.37],
  ];
  let tax = 0, prev = 0;
  for (const [cap, r] of brackets) {
    const inB = Math.min(taxable, cap) - prev;
    if (inB > 0) tax += inB * r;
    prev = cap;
    if (taxable <= cap) break;
  }
  const ssBase = Math.min(annual, 176100);
  const fica = ssBase * 0.062 + annual * 0.0145;
  const extraMed = annual > 200000 ? (annual - 200000) * 0.009 : 0;
  const state = annual * ((v.stateRate || 0) / 100);
  const net = annual - tax - fica - extraMed - state;
  return {
    outputs: [
      { label: 'Net pay per paycheck', value: fmt(net / freqN), highlight: true },
      { label: 'Gross pay per paycheck', value: fmt(annual / freqN) },
      { label: 'Net annual take-home', value: fmt(net), highlight: true },
      { label: 'Federal income tax', value: fmt(tax) },
      { label: 'FICA (Social Security + Medicare)', value: fmt(fica + extraMed) },
      { label: 'State tax (flat estimate)', value: fmt(state) },
      { label: 'Effective tax rate', value: (annual > 0 ? ((tax + fica + extraMed + state) / annual) * 100 : 0).toFixed(1) + '%' },
    ],
    donut: {
      labels: ['Take-home pay', 'Federal tax', 'FICA', 'State tax'],
      values: [net, tax, fica + extraMed, state],
      colors: ['#22c55e', '#1e3a8a', '#38bdf8', '#f59e0b'],
    },
    line: null,
    stacked: null,
    note: 'Estimate only: uses single-filer 2025 federal brackets and a flat state rate. Actual withholding depends on your W-4, pre-tax deductions and local taxes.',
  };
}

/* ---------- 11. Credit card payoff ---------- */
export function creditcard(v) {
  const bal = v.balance, rate = v.rate / 100 / 12, pay = v.payment;
  const minI = bal * rate;
  if (pay <= minI) {
    return {
      outputs: [
        { label: 'Payoff time', value: 'Never: payment must exceed ' + fmt(minI) + '/mo interest', highlight: true },
        { label: 'Monthly payment', value: fmt(pay) },
      ],
      donut: null, line: null, stacked: null, warn: true,
    };
  }
  let months = 0, totInt = 0, b = bal;
  const pts = [], lab = [];
  while (b > 0 && months < 2400) {
    const i = b * rate;
    totInt += i;
    b = b + i - pay;
    months++;
    if (months % 12 === 0) {
      pts.push(round2(Math.max(0, b)));
      lab.push('Yr ' + months / 12);
    }
  }
  pts.push(0);
  lab.push('Done');
  const yrs = Math.floor(months / 12), mo = months % 12;
  return {
    outputs: [
      { label: 'Debt-free in', value: yrs + ' yrs ' + mo + ' mos (' + months + ' payments)', highlight: true },
      { label: 'Total interest', value: fmt(totInt) },
      { label: 'Total paid', value: fmt(bal + totInt) },
      { label: 'Monthly payment', value: fmt(pay) },
    ],
    donut: { labels: ['Card balance', 'Interest paid'], values: [bal, totInt], colors: ['#1e3a8a', '#ef4444'] },
    line: { labels: lab, values: pts, title: 'Remaining balance by year' },
    stacked: null,
  };
}

/* ---------- 12. Retirement (401k) ---------- */
export function retirement(v) {
  const bal = v.current || 0, contrib = v.monthly || 0;
  const rate = v.rate / 100 / 12, n = v.years * 12;
  const matchPct = (v.match || 0) / 100, matchCap = (v.matchCapPct || 0) / 100;
  const salary = v.salary || 0;
  const employer = salary > 0 && matchCap > 0 ? Math.min(contrib, (salary * matchCap) / 12) * matchPct : 0;
  const totalC = contrib + employer;
  const end = bal * Math.pow(1 + rate, n) + fvAnnuity(totalC, rate, n);
  const contributed = bal + totalC * n;
  const interest = end - contributed;
  const pts = [], lab = [];
  let b = bal;
  for (let y = 1; y <= v.years; y++) {
    for (let m = 0; m < 12; m++) {
      b = b * (1 + rate) + totalC;
    }
    pts.push(round2(b));
    lab.push('Yr ' + y);
  }
  const contribSeries = lab.map((_, i) => round2(bal + totalC * 12 * (i + 1)));
  return {
    outputs: [
      { label: 'Projected retirement value', value: fmt(end), highlight: true },
      { label: 'Total contributions', value: fmt(contributed) },
      { label: 'Investment growth', value: fmt(interest), highlight: true },
      { label: 'Employer match received', value: fmt(employer * n) },
      { label: 'Monthly contribution (with match)', value: fmt(totalC) },
    ],
    donut: {
      labels: ['Your contributions', 'Employer match', 'Growth'],
      values: [bal + contrib * n, employer * n, interest],
      colors: ['#1e3a8a', '#38bdf8', '#22c55e'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: 'Total contributions', values: contribSeries, color: '#1e3a8a' },
        { name: 'Projected value', values: pts, color: '#22c55e' },
      ],
      title: 'Contributions vs projected growth',
    },
  };
}
