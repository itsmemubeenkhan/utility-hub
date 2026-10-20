/* UtilityHub shared calculator engine, pure math, no DOM, no dependencies.
   Ported from the verified FinanceScout static build; benchmarks preserved. */
import { textStats, readingSeconds, formatDuration, convertCase } from './text-tools.js';

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

/* Spanish (neutral US) strings for every user-facing result label.
   English stays inline as the source; L() picks the locale at call time. */
const ES_STRINGS = {
  'Monthly principal & interest': 'Capital e intereses mensuales',
  'Loan amount': 'Monto del préstamo',
  'Property tax (monthly)': 'Impuestos a la propiedad (mensual)',
  'Home insurance (monthly)': 'Seguro de vivienda (mensual)',
  'PMI (monthly)': 'PMI (mensual)',
  'Total monthly payment': 'Pago mensual total',
  'Total interest over loan': 'Interés total del préstamo',
  'Total cost of loan': 'Costo total del préstamo',
  'Max monthly housing payment': 'Pago máximo mensual de vivienda',
  'Max home price you can afford': 'Precio máximo de vivienda que puedes pagar',
  'Max loan amount': 'Monto máximo del préstamo',
  'Front-end limit (28% of income)': 'Límite inicial (28% del ingreso)',
  'Back-end limit (36% minus debts)': 'Límite total (36% menos deudas)',
  'Monthly payment': 'Pago mensual',
  'Total interest': 'Interés total',
  'Total repayment': 'Reembolso total',
  'Number of payments': 'Número de pagos',
  'Monthly EMI': 'Cuota mensual (EMI)',
  'Principal amount': 'Monto del capital',
  'Total payment': 'Pago total',
  'Future value': 'Valor futuro',
  'Total contributions': 'Aportaciones totales',
  'Interest earned': 'Interés ganado',
  'Required monthly deposit': 'Depósito mensual requerido',
  'Total deposits': 'Depósitos totales',
  'Projected total': 'Total proyectado',
  'Payoff time': 'Tiempo para liquidar',
  'Debt-free in': 'Libre de deudas en',
  'Total paid': 'Total pagado',
  'Current monthly payment': 'Pago mensual actual',
  'New monthly payment': 'Nuevo pago mensual',
  'Monthly savings': 'Ahorro mensual',
  'Breakeven point': 'Punto de equilibrio',
  'Old loan total interest': 'Interés total del préstamo anterior',
  'New loan total interest': 'Interés total del préstamo nuevo',
  'Lifetime interest savings': 'Ahorro total en intereses',
  Recommendation: 'Recomendación',
  'Total cost of vehicle': 'Costo total del vehículo',
  'Net pay per paycheck': 'Pago neto por cheque',
  'Gross pay per paycheck': 'Pago bruto por cheque',
  'Net annual take-home': 'Ingreso neto anual',
  'Federal income tax': 'Impuesto federal sobre la renta',
  'FICA (Social Security + Medicare)': 'FICA (Seguro Social + Medicare)',
  'State tax (flat estimate)': 'Impuesto estatal (estimación fija)',
  'Effective tax rate': 'Tasa impositiva efectiva',
  'Projected retirement value': 'Valor proyectado de jubilación',
  'Investment growth': 'Crecimiento de la inversión',
  'Employer match received': 'Aportación patronal recibida',
  'Monthly contribution (with match)': 'Aportación mensual (con match)',
  Principal: 'Capital',
  Interest: 'Interés',
  Contributions: 'Aportaciones',
  'Your deposits': 'Tus depósitos',
  'Original debt': 'Deuda original',
  'Interest paid': 'Interés pagado',
  'Old loan interest': 'Interés del préstamo anterior',
  'New loan interest': 'Interés del préstamo nuevo',
  'Vehicle (net)': 'Vehículo (neto)',
  'Take-home pay': 'Sueldo neto',
  'Federal tax': 'Impuesto federal',
  FICA: 'FICA',
  'State tax': 'Impuesto estatal',
  'Card balance': 'Saldo de la tarjeta',
  'Your contributions': 'Tus aportaciones',
  'Employer match': 'Aportación patronal',
  Growth: 'Crecimiento',
  'Remaining loan balance by year': 'Saldo restante del préstamo por año',
  'Max home price at different income ratios': 'Precio máximo de vivienda según tu ingreso',
  'Remaining balance by year': 'Saldo restante por año',
  'Remaining debt by year': 'Deuda restante por año',
  'Projected savings over time': 'Ahorros proyectados en el tiempo',
  'Cumulative principal vs interest paid': 'Capital vs interés acumulado pagado',
  'Principal repaid': 'Capital pagado',
  'Balance growth over time': 'Crecimiento del saldo en el tiempo',
  'Projected balance': 'Saldo proyectado',
  'Contributions vs projected growth': 'Aportaciones vs crecimiento proyectado',
  'Projected value': 'Valor proyectado',
  'Standard monthly payment': 'Pago mensual estándar',
  'Extra monthly payment': 'Pago mensual adicional',
  'Payoff with extra payments': 'Liquidación con pagos adicionales',
  'Interest saved with extra': 'Interés ahorrado con adicionales',
  'Net worth': 'Patrimonio neto',
  'Total assets': 'Activos totales',
  'Total liabilities': 'Pasivos totales',
  'Cash & savings': 'Efectivo y ahorros',
  Investments: 'Inversiones',
  'Real estate': 'Bienes raíces',
  'Retirement accounts': 'Cuentas de jubilación',
  'Other assets': 'Otros activos',
  'Mortgage balance': 'Saldo de hipoteca',
  'Student loans': 'Préstamos estudiantiles',
  'Credit card debt': 'Deuda de tarjetas de crédito',
  'Car loans': 'Préstamos de auto',
  'Other debts': 'Otras deudas',
  Assets: 'Activos',
  Liabilities: 'Pasivos',
  'Debt-to-asset ratio': 'Relación deuda-activos',
  'Monthly take-home income': 'Ingreso mensual neto',
  'Needs budget (50%)': 'Presupuesto de necesidades (50%)',
  'Wants budget (30%)': 'Presupuesto de deseos (30%)',
  'Savings target (20%)': 'Meta de ahorro (20%)',
  'Your needs spending': 'Tu gasto en necesidades',
  'Your wants spending': 'Tu gasto en deseos',
  'Your savings': 'Tus ahorros',
  'Needs difference': 'Diferencia en necesidades',
  'Wants difference': 'Diferencia en deseos',
  'Savings difference': 'Diferencia en ahorros',
  Needs: 'Necesidades',
  Wants: 'Deseos',
  'Budget status': 'Estado del presupuesto',
  'Monthly expenses': 'Gastos mensuales',
  'Target fund size': 'Tamaño objetivo del fondo',
  'Current savings': 'Ahorros actuales',
  'Remaining to save': 'Falta por ahorrar',
  'Months to reach goal': 'Meses para alcanzar la meta',
  'Monthly savings amount': 'Monto de ahorro mensual',
  'Coverage (months)': 'Cobertura (meses)',
  'Amount today': 'Cantidad hoy',
  'Future cost': 'Costo futuro',
  'Purchasing power today': 'Poder adquisitivo hoy',
  'Cumulative inflation': 'Inflación acumulada',
  'Cost growth over time': 'Crecimiento del costo en el tiempo',
  'Total ROI': 'ROI total',
  'Annualized return': 'Rendimiento anualizado',
  'Initial investment': 'Inversión inicial',
  'Total gain': 'Ganancia total',
  'Investment period': 'Período de inversión',
  'College cost today (annual)': 'Costo universitario hoy (anual)',
  'Projected 4-year college cost': 'Costo universitario proyectado (4 años)',
  'Years until college': 'Años hasta la universidad',
  'Current college savings': 'Ahorros universitarios actuales',
  'Projected savings at college': 'Ahorros proyectados al inicio',
  'Monthly contribution needed': 'Aporte mensual necesario',
  Shortfall: 'Faltante',
  'Gross monthly income': 'Ingreso mensual bruto',
  'Total monthly debts': 'Deudas mensuales totales',
  'DTI ratio': 'Relación DTI',
  'Housing DTI': 'DTI de vivienda',
  'DTI rating': 'Calificación DTI',
  'Annual salary': 'Salario anual',
  'Hourly rate': 'Tarifa por hora',
  'Hours per week': 'Horas por semana',
  'Weeks per year': 'Semanas por año',
  'Equivalent hourly rate': 'Equivalente por hora',
  'Equivalent annual salary': 'Equivalente anual',
  'Equivalent monthly pay': 'Equivalente mensual',
  'Equivalent weekly pay': 'Equivalente semanal',
  'Max affordable car price': 'Precio máximo de auto asequible',
  'Monthly car budget (15%)': 'Presupuesto mensual de auto (15%)',
  'Down payment': 'Pago inicial',
  'Trade-in value': 'Valor de intercambio',
  'Estimated monthly payment': 'Pago mensual estimado',
  'Max loan amount': 'Monto máximo del préstamo',
  'Monthly rent': 'Renta mensual',
  'Home price': 'Precio de la vivienda',
  'Years staying': 'Años de permanencia',
  'Total cost of buying': 'Costo total de comprar',
  'Total cost of renting': 'Costo total de rentar',
  'Cheaper option': 'Opción más barata',
  'Difference': 'Diferencia',
  'Home equity': 'Capital inmobiliario',
  'Loan-to-value (LTV)': 'Préstamo-valor (LTV)',
  'Max HELOC amount (80% CLTV)': 'Monto máximo de HELOC (80% CLTV)',
  'Available to borrow': 'Disponible para pedir prestado',
  'Estimated HELOC payment': 'Pago estimado de HELOC',
  'Compounding periods per year': 'Períodos de capitalización por año',
  'Converted APY': 'APY convertido',
  'Converted APR': 'APR convertido',
  'Bill amount': 'Monto de la cuenta',
  'Tip percentage': 'Porcentaje de propina',
  'Tip amount': 'Monto de la propina',
  'Total with tip': 'Total con propina',
  'Per person': 'Por persona',
  'Number of people': 'Número de personas',
  'Regular hours': 'Horas regulares',
  'Overtime hours': 'Horas extra',
  'Overtime rate': 'Tarifa de horas extra',
  'Regular pay': 'Pago regular',
  'Overtime pay': 'Pago de horas extra',
  'Total weekly pay': 'Pago semanal total',
  'Total annual pay': 'Pago anual total',
  'Remaining income': 'Ingreso restante',
  'Employee annual contribution': 'Aporte anual del empleado',
  'Employer annual match': 'Aporte anual del empleador',
  'Total annual contribution': 'Aporte anual total',
  'Tax savings (est.)': 'Ahorro fiscal (est.)',
  'Projected value at retirement': 'Valor proyectado a la jubilación',
  'IRS limit 2026': 'Límite del IRS 2026',
  'Over the limit by': 'Exceso sobre el límite',
  'High-yield APY': 'APY de alto rendimiento',
  'Regular account APY': 'APY de cuenta regular',
  'Interest earned (high-yield)': 'Interés ganado (alto rendimiento)',
  'Interest earned (regular)': 'Interés ganado (regular)',
  'Extra earned vs regular': 'Ganancia adicional vs regular',
  'Purchase price': 'Precio de compra',
  'Sale price': 'Precio de venta',
  'Capital gain': 'Ganancia de capital',
  'Holding period': 'Período de tenencia',
  'Tax rate applied': 'Tasa impositiva aplicada',
  'Tax owed': 'Impuesto adeudado',
  'Net proceeds': 'Ganancia neta',
  'Loan A': 'Préstamo A',
  'Loan B': 'Préstamo B',
  'Better option': 'Mejor opción',
  'Payment difference': 'Diferencia de pago',
  'Interest difference': 'Diferencia de interés',
  'Gross pay': 'Pago bruto',
  'Pre-tax deductions': 'Deducciones antes de impuestos',
  'Post-tax deductions': 'Deducciones después de impuestos',
  'Net pay': 'Pago neto',
  Bills: 'Facturas',
  'Debt payments': 'Pagos de deudas',
  'Spending money': 'Dinero para gastos',
  Unallocated: 'Sin asignar',
  'Long-term': 'Largo plazo',
  'Short-term': 'Corto plazo',
  'Winner': 'Ganador',
  'Roth value (after tax)': 'Valor Roth (después de impuestos)',
  'Traditional value (after tax)': 'Valor tradicional (después de impuestos)',
  'Tax paid now (Roth)': 'Impuestos pagados ahora (Roth)',
  'Tax paid at withdrawal (Traditional)': 'Impuestos pagados al retirar (tradicional)',
  'Years invested': 'Años invertidos',
  'Difference': 'Diferencia',
  'Traditional IRA': 'IRA tradicional',
  'Payoff time (biweekly)': 'Tiempo de pago (quincenal)',
  'Payoff time (standard)': 'Tiempo de pago (estándar)',
  'Years saved': 'Años ahorrados',
  'Interest saved': 'Interés ahorrado',
  'Biweekly payment': 'Pago quincenal',
  'Standard total interest': 'Interés total estándar',
  'Biweekly total interest': 'Interés total quincenal',
  'Standard schedule': 'Calendario estándar',
  'Biweekly schedule': 'Calendario quincenal',
  'years': 'años',
};

function L(lang, s) {
  return lang === 'es' ? (ES_STRINGS[s] !== undefined ? ES_STRINGS[s] : s) : s;
}

/* Chart year-axis label: 'Yr 5' -> 'Año 5' in Spanish. */
function YR(lang) {
  return lang === 'es' ? 'Año ' : 'Yr ';
}

/* ---------- 1. Mortgage ---------- */
export function mortgage(v, lang = 'en') {
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
      labPts.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Monthly principal & interest'), value: fmt(pay), highlight: true },
      { label: L(lang, 'Loan amount'), value: fmt(loan) },
      { label: L(lang, 'Property tax (monthly)'), value: fmt(tax) },
      { label: L(lang, 'Home insurance (monthly)'), value: fmt(ins) },
      { label: L(lang, 'PMI (monthly)'), value: fmt(pmi) },
      { label: L(lang, 'Total monthly payment'), value: fmt(total), highlight: true },
      { label: L(lang, 'Total interest over loan'), value: fmt(totInt) },
      { label: L(lang, 'Total cost of loan'), value: fmt(loan + totInt) },
    ],
    donut: { labels: [L(lang, 'Principal'), L(lang, 'Interest')], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: labPts, values: balPts, title: L(lang, 'Remaining loan balance by year') },
    stacked: null,
  };
}

/* ---------- 2. Home affordability ---------- */
export function affordability(v, lang = 'en') {
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
      { label: L(lang, 'Max monthly housing payment'), value: fmt(allowed), highlight: true },
      { label: L(lang, 'Max home price you can afford'), value: fmt(price), highlight: true },
      { label: L(lang, 'Max loan amount'), value: fmt(loan) },
      { label: L(lang, 'Front-end limit (28% of income)'), value: fmt(maxHouse) },
      { label: L(lang, 'Back-end limit (36% minus debts)'), value: fmt(maxTotal) },
    ],
    donut: null,
    line: { labels: lab, values: maxHousePts, title: L(lang, 'Max home price at different income ratios') },
    stacked: null,
  };
}

/* ---------- 3. Loan payment (generic) ---------- */
export function loanpayment(v, lang = 'en') {
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
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Monthly payment'), value: fmt(pay), highlight: true },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total repayment'), value: fmt(loan + totInt) },
      { label: L(lang, 'Number of payments'), value: String(n) },
    ],
    donut: { labels: [L(lang, 'Principal'), L(lang, 'Interest')], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: lab, values: pts, title: L(lang, 'Remaining balance by year') },
    stacked: null,
  };
}

/* ---------- 4. EMI calculator ---------- */
export function emi(v, lang = 'en') {
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
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Monthly EMI'), value: fmt(payment), highlight: true },
      { label: L(lang, 'Principal amount'), value: fmt(loan) },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total payment'), value: fmt(loan + totInt) },
    ],
    donut: { labels: [L(lang, 'Principal'), L(lang, 'Interest')], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'Principal repaid'), values: ptsP, color: '#1e3a8a' },
        { name: L(lang, 'Interest paid'), values: ptsI, color: '#38bdf8' },
      ],
      title: L(lang, 'Cumulative principal vs interest paid'),
    },
  };
}

/* ---------- 5. Compound interest ---------- */
export function compound(v, lang = 'en') {
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
    lab.push(YR(lang) + y);
  }
  const interest = bal - contrib;
  return {
    outputs: [
      { label: L(lang, 'Future value'), value: fmt(bal), highlight: true },
      { label: L(lang, 'Total contributions'), value: fmt(contrib) },
      { label: L(lang, 'Interest earned'), value: fmt(interest), highlight: true },
    ],
    donut: { labels: [L(lang, 'Contributions'), L(lang, 'Interest earned')], values: [contrib, interest], colors: ['#1e3a8a', '#22c55e'] },
    line: null,
    stacked: {
      labels: lab,
      series: [{ name: L(lang, 'Projected balance'), values: pts, color: '#1e3a8a' }],
      title: L(lang, 'Balance growth over time'),
    },
  };
}

/* ---------- 6. Savings goal ---------- */
export function savingsgoal(v, lang = 'en') {
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
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Required monthly deposit'), value: fmt(dep), highlight: true },
      { label: L(lang, 'Total deposits'), value: fmt(tot) },
      { label: L(lang, 'Interest earned'), value: fmt(Math.max(0, bal - tot)) },
      { label: L(lang, 'Projected total'), value: fmt(bal) },
    ],
    donut: { labels: [L(lang, 'Your deposits'), L(lang, 'Interest earned')], values: [tot, Math.max(0, bal - tot)], colors: ['#1e3a8a', '#22c55e'] },
    line: { labels: lab, values: pts, title: L(lang, 'Projected savings over time') },
    stacked: null,
  };
}

/* ---------- 7. Debt payoff ---------- */
export function debtpayoff(v, lang = 'en') {
  const bal = v.balance, rate = v.rate / 100 / 12, pay = v.payment;
  const minI = bal * rate;
  if (pay <= minI) {
    return {
      outputs: [
        { label: L(lang, 'Payoff time'), value: lang === 'es' ? 'Nunca: el pago debe superar ' + fmt(minI) + '/mes de interés' : 'Never: payment must exceed ' + fmt(minI) + '/mo interest', highlight: true },
        { label: L(lang, 'Monthly payment'), value: fmt(pay) },
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
      lab.push(YR(lang) + months / 12);
    }
  }
  pts.push(0);
  lab.push(lang === 'es' ? 'Listo' : 'Done');
  const yrs = Math.floor(months / 12), mo = months % 12;
  return {
    outputs: [
      { label: L(lang, 'Debt-free in'), value: lang === 'es' ? yrs + ' años ' + mo + ' meses (' + months + ' pagos)' : yrs + ' yrs ' + mo + ' mos (' + months + ' payments)', highlight: true },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total paid'), value: fmt(bal + totInt) },
      { label: L(lang, 'Monthly payment'), value: fmt(pay) },
    ],
    donut: { labels: [L(lang, 'Original debt'), L(lang, 'Interest paid')], values: [bal, totInt], colors: ['#1e3a8a', '#ef4444'] },
    line: { labels: lab, values: pts, title: L(lang, 'Remaining debt by year') },
    stacked: null,
  };
}

/* ---------- 8. Refinance ---------- */
export function refinance(v, lang = 'en') {
  const bal = v.balance;
  const r1 = v.oldRate / 100 / 12, r2 = v.newRate / 100 / 12;
  const rem = v.remainingYears * 12, term = v.newTermYears * 12, cost = v.closingCost;
  const oldPay = pmt(bal, r1, rem);
  const newPay = pmt(bal, r2, term);
  const save = oldPay - newPay;
  const breakeven = save > 0 ? cost / save : Infinity;
  const oldInt = oldPay * rem - bal, newInt = newPay * term - bal;
  const rec =
    lang === 'es'
      ? save > 0
        ? 'Refinanciar podría ahorrarte ' + fmt(save) + '/mes. Los costos de cierre se recuperan en ' +
          (isFinite(breakeven) ? Math.ceil(breakeven) + ' meses' : 'N/A') + '.'
        : 'Con estas condiciones el nuevo pago es más alto. No se recomienda refinanciar.'
      : save > 0
        ? 'Refinancing could save you ' + fmt(save) + '/mo. Closing costs break even in ' +
          (isFinite(breakeven) ? Math.ceil(breakeven) + ' months' : 'N/A') + '.'
        : 'At these terms the new payment is higher. Refinancing is not recommended.';
  return {
    outputs: [
      { label: L(lang, 'Current monthly payment'), value: fmt(oldPay) },
      { label: L(lang, 'New monthly payment'), value: fmt(newPay), highlight: true },
      { label: L(lang, 'Monthly savings'), value: fmt(Math.max(0, save)), highlight: true },
      { label: L(lang, 'Breakeven point'), value: isFinite(breakeven) ? Math.ceil(breakeven) + (lang === 'es' ? ' meses' : ' months') : 'N/A' },
      { label: L(lang, 'Old loan total interest'), value: fmt(oldInt) },
      { label: L(lang, 'New loan total interest'), value: fmt(newInt) },
      { label: L(lang, 'Lifetime interest savings'), value: fmt(Math.max(0, oldInt - newInt)) },
      { label: L(lang, 'Recommendation'), value: rec },
    ],
    donut: { labels: [L(lang, 'Old loan interest'), L(lang, 'New loan interest')], values: [oldInt, newInt], colors: ['#ef4444', '#22c55e'] },
    line: null,
    stacked: null,
  };
}

/* ---------- 9. Auto loan ---------- */
export function autoloan(v, lang = 'en') {
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
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Monthly payment'), value: fmt(pay), highlight: true },
      { label: L(lang, 'Loan amount'), value: fmt(loan) },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total cost of vehicle'), value: fmt(price + totInt - trade) },
    ],
    donut: { labels: [L(lang, 'Vehicle (net)'), L(lang, 'Interest')], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: lab, values: pts, title: L(lang, 'Remaining loan balance by year') },
    stacked: null,
  };
}

/* ---------- 10. Salary paycheck (US federal estimate, single filer, 2025 brackets) ---------- */
export function paycheck(v, lang = 'en') {
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
      { label: L(lang, 'Net pay per paycheck'), value: fmt(net / freqN), highlight: true },
      { label: L(lang, 'Gross pay per paycheck'), value: fmt(annual / freqN) },
      { label: L(lang, 'Net annual take-home'), value: fmt(net), highlight: true },
      { label: L(lang, 'Federal income tax'), value: fmt(tax) },
      { label: L(lang, 'FICA (Social Security + Medicare)'), value: fmt(fica + extraMed) },
      { label: L(lang, 'State tax (flat estimate)'), value: fmt(state) },
      { label: L(lang, 'Effective tax rate'), value: (annual > 0 ? ((tax + fica + extraMed + state) / annual) * 100 : 0).toFixed(1) + '%' },
    ],
    donut: {
      labels: [L(lang, 'Take-home pay'), L(lang, 'Federal tax'), L(lang, 'FICA'), L(lang, 'State tax')],
      values: [net, tax, fica + extraMed, state],
      colors: ['#22c55e', '#1e3a8a', '#38bdf8', '#f59e0b'],
    },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'Solo una estimación: usa los tramos federales de 2025 para declarante individual y una tasa estatal fija. La retención real depende de tu W-4, deducciones antes de impuestos e impuestos locales.' : 'Estimate only: uses single-filer 2025 federal brackets and a flat state rate. Actual withholding depends on your W-4, pre-tax deductions and local taxes.',
  };
}

/* ---------- 11. Credit card payoff ---------- */
export function creditcard(v, lang = 'en') {
  const bal = v.balance, rate = v.rate / 100 / 12, pay = v.payment;
  const minI = bal * rate;
  if (pay <= minI) {
    return {
      outputs: [
        { label: L(lang, 'Payoff time'), value: lang === 'es' ? 'Nunca: el pago debe superar ' + fmt(minI) + '/mes de interés' : 'Never: payment must exceed ' + fmt(minI) + '/mo interest', highlight: true },
        { label: L(lang, 'Monthly payment'), value: fmt(pay) },
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
      lab.push(YR(lang) + months / 12);
    }
  }
  pts.push(0);
  lab.push(lang === 'es' ? 'Listo' : 'Done');
  const yrs = Math.floor(months / 12), mo = months % 12;
  return {
    outputs: [
      { label: L(lang, 'Debt-free in'), value: lang === 'es' ? yrs + ' años ' + mo + ' meses (' + months + ' pagos)' : yrs + ' yrs ' + mo + ' mos (' + months + ' payments)', highlight: true },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total paid'), value: fmt(bal + totInt) },
      { label: L(lang, 'Monthly payment'), value: fmt(pay) },
    ],
    donut: { labels: [L(lang, 'Card balance'), L(lang, 'Interest paid')], values: [bal, totInt], colors: ['#1e3a8a', '#ef4444'] },
    line: { labels: lab, values: pts, title: L(lang, 'Remaining balance by year') },
    stacked: null,
  };
}

/* ---------- 12. Retirement (401k) ---------- */
export function retirement(v, lang = 'en') {
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
    lab.push(YR(lang) + y);
  }
  const contribSeries = lab.map((_, i) => round2(bal + totalC * 12 * (i + 1)));
  return {
    outputs: [
      { label: L(lang, 'Projected retirement value'), value: fmt(end), highlight: true },
      { label: L(lang, 'Total contributions'), value: fmt(contributed) },
      { label: L(lang, 'Investment growth'), value: fmt(interest), highlight: true },
      { label: L(lang, 'Employer match received'), value: fmt(employer * n) },
      { label: L(lang, 'Monthly contribution (with match)'), value: fmt(totalC) },
    ],
    donut: {
      labels: [L(lang, 'Your contributions'), L(lang, 'Employer match'), L(lang, 'Growth')],
      values: [bal + contrib * n, employer * n, interest],
      colors: ['#1e3a8a', '#38bdf8', '#22c55e'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'Total contributions'), values: contribSeries, color: '#1e3a8a' },
        { name: L(lang, 'Projected value'), values: pts, color: '#22c55e' },
      ],
      title: L(lang, 'Contributions vs projected growth'),
    },
  };
}

/* ---------- 13. Student loan ---------- */
export function studentloan(v, lang = 'en') {
  const loan = v.amount, rate = v.rate / 100 / 12, n = v.years * 12;
  const extra = v.extra || 0;
  const pay = pmt(loan, rate, n);
  let bal = loan, totInt = 0;
  const pts = [], lab = [];
  for (let m = 1; m <= n; m++) {
    const i = bal * rate;
    totInt += i;
    bal = Math.max(0, bal - (pay - i));
    if (m % 12 === 0 || m === n) {
      pts.push(round2(bal));
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  let m2 = 0, int2 = totInt, saved = 0, b2 = loan;
  const totalPay = pay + extra;
  if (extra > 0 && totalPay > loan * rate) {
    int2 = 0; b2 = loan; m2 = 0;
    while (b2 > 0.01 && m2 < 1200) {
      const i = b2 * rate;
      int2 += i;
      b2 = b2 + i - totalPay;
      m2++;
    }
    saved = Math.max(0, totInt - int2);
  }
  const yrs2 = Math.floor(m2 / 12), mo2 = m2 % 12;
  return {
    outputs: [
      { label: L(lang, 'Standard monthly payment'), value: fmt(pay), highlight: true },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
      { label: L(lang, 'Total repayment'), value: fmt(loan + totInt) },
      { label: L(lang, 'Extra monthly payment'), value: fmt(extra) },
      { label: L(lang, 'Payoff with extra payments'), value: extra > 0 && totalPay > loan * rate ? (lang === 'es' ? yrs2 + ' años, ' + mo2 + ' meses' : yrs2 + ' yrs, ' + mo2 + ' mos') : '-', highlight: extra > 0 },
      { label: L(lang, 'Interest saved with extra'), value: extra > 0 ? fmt(saved) : '-' },
    ],
    donut: { labels: [L(lang, 'Principal'), L(lang, 'Interest')], values: [loan, totInt], colors: ['#1e3a8a', '#38bdf8'] },
    line: { labels: lab, values: pts, title: L(lang, 'Remaining balance by year') },
    stacked: null,
  };
}

/* ---------- 14. Net worth ---------- */
export function networth(v, lang = 'en') {
  const cash = v.cash || 0, invest = v.investments || 0, real = v.realEstate || 0;
  const retire = v.retirement || 0, otherA = v.otherAssets || 0;
  const mort = v.mortgage || 0, stud = v.studentLoans || 0, cards = v.creditCards || 0;
  const car = v.carLoans || 0, otherD = v.otherDebts || 0;
  const assets = cash + invest + real + retire + otherA;
  const liab = mort + stud + cards + car + otherD;
  const net = assets - liab;
  return {
    outputs: [
      { label: L(lang, 'Net worth'), value: fmt(net), highlight: true },
      { label: L(lang, 'Total assets'), value: fmt(assets) },
      { label: L(lang, 'Total liabilities'), value: fmt(liab) },
      { label: L(lang, 'Cash & savings'), value: fmt(cash) },
      { label: L(lang, 'Investments'), value: fmt(invest) },
      { label: L(lang, 'Real estate'), value: fmt(real) },
      { label: L(lang, 'Retirement accounts'), value: fmt(retire) },
      { label: L(lang, 'Other assets'), value: fmt(otherA) },
      { label: L(lang, 'Debt-to-asset ratio'), value: assets > 0 ? round2((liab / assets) * 100) + '%' : 'N/A' },
    ],
    donut: { labels: [L(lang, 'Assets'), L(lang, 'Liabilities')], values: [assets, Math.max(0, liab)], colors: ['#22c55e', '#ef4444'] },
    line: null,
    stacked: null,
  };
}

/* ---------- 15. Budget (50/30/20 rule) ---------- */
export function budget(v, lang = 'en') {
  const income = v.income || 0;
  const needT = income * 0.5, wantT = income * 0.3, saveT = income * 0.2;
  const needs = v.needs || 0, wants = v.wants || 0, save = v.savings || 0;
  const dNeed = needT - needs, dWant = wantT - wants, dSave = save - saveT;
  const onTrack = dNeed >= 0 && dWant >= 0 && dSave >= 0;
  const status =
    lang === 'es'
      ? onTrack
        ? 'Vas bien: tu gasto está dentro de la regla 50/30/20.'
        : 'Ajusta: alguna categoría supera su límite. Revisa las diferencias abajo.'
      : onTrack
        ? 'On track: your spending fits the 50/30/20 rule.'
        : 'Needs attention: a category is over its limit. Check the differences below.';
  return {
    outputs: [
      { label: L(lang, 'Monthly take-home income'), value: fmt(income), highlight: true },
      { label: L(lang, 'Needs budget (50%)'), value: fmt(needT) },
      { label: L(lang, 'Wants budget (30%)'), value: fmt(wantT) },
      { label: L(lang, 'Savings target (20%)'), value: fmt(saveT) },
      { label: L(lang, 'Your needs spending'), value: fmt(needs) },
      { label: L(lang, 'Your wants spending'), value: fmt(wants) },
      { label: L(lang, 'Your savings'), value: fmt(save) },
      { label: L(lang, 'Needs difference'), value: (dNeed >= 0 ? '+' : '') + fmt(dNeed).replace('$-', '-$') },
      { label: L(lang, 'Wants difference'), value: (dWant >= 0 ? '+' : '') + fmt(dWant).replace('$-', '-$') },
      { label: L(lang, 'Savings difference'), value: (dSave >= 0 ? '+' : '') + fmt(dSave).replace('$-', '-$') },
      { label: L(lang, 'Budget status'), value: status, highlight: true },
    ],
    donut: {
      labels: [L(lang, 'Needs'), L(lang, 'Wants'), L(lang, 'Savings')],
      values: [needs, wants, save],
      colors: ['#1e3a8a', '#38bdf8', '#22c55e'],
    },
    line: null,
    stacked: null,
  };
}

/* ---------- 16. Emergency fund ---------- */
export function emergencyfund(v, lang = 'en') {
  const exp = v.expenses || 0, months = v.months || 6;
  const target = exp * months;
  const current = v.current || 0, monthly = v.monthly || 0;
  const gap = Math.max(0, target - current);
  const coverage = exp > 0 ? round2(current / exp) : 0;
  let monthsTo;
  if (gap <= 0) monthsTo = 0;
  else if (monthly > 0) monthsTo = Math.ceil(gap / monthly);
  else monthsTo = Infinity;
  const pts = [], lab = [];
  if (monthly > 0 && gap > 0) {
    let b = current;
    for (let m = 1; m <= Math.min(monthsTo, 120); m++) {
      b += monthly;
      if (m % 3 === 0 || m === monthsTo) {
        pts.push(round2(Math.min(b, target)));
        lab.push((lang === 'es' ? 'Mes ' : 'Mo ') + m);
      }
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Target fund size'), value: fmt(target), highlight: true },
      { label: L(lang, 'Monthly expenses'), value: fmt(exp) },
      { label: L(lang, 'Coverage (months)'), value: coverage + (lang === 'es' ? ' meses' : ' months') },
      { label: L(lang, 'Current savings'), value: fmt(current) },
      { label: L(lang, 'Remaining to save'), value: fmt(gap) },
      { label: L(lang, 'Monthly savings amount'), value: fmt(monthly) },
      { label: L(lang, 'Months to reach goal'), value: isFinite(monthsTo) ? String(monthsTo) : (lang === 'es' ? 'Nunca sin ahorro mensual' : 'Never without monthly savings'), highlight: true },
    ],
    donut: { labels: [L(lang, 'Current savings'), L(lang, 'Remaining to save')], values: [current, gap], colors: ['#22c55e', '#e2e8f0'] },
    line: pts.length ? { labels: lab, values: pts, title: L(lang, 'Projected savings over time') } : null,
    stacked: null,
  };
}

/* ---------- 17. Inflation ---------- */
export function inflation(v, lang = 'en') {
  const amount = v.amount, rate = v.rate / 100, years = v.years;
  const future = amount * Math.pow(1 + rate, years);
  const todayVal = amount / Math.pow(1 + rate, years);
  const cumPct = (Math.pow(1 + rate, years) - 1) * 100;
  const pts = [], lab = [];
  for (let y = 0; y <= Math.min(years, 50); y++) {
    pts.push(round2(amount * Math.pow(1 + rate, y)));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Amount today'), value: fmt(amount), highlight: true },
      { label: L(lang, 'Future cost'), value: fmt(future), highlight: true },
      { label: L(lang, 'Purchasing power today'), value: fmt(todayVal) },
      { label: L(lang, 'Cumulative inflation'), value: round2(cumPct) + '%' },
    ],
    donut: null,
    line: { labels: lab, values: pts, title: L(lang, 'Cost growth over time') },
    stacked: null,
  };
}

/* ---------- 18. ROI calculator ---------- */
export function roi(v, lang = 'en') {
  const initial = v.initial, final = v.final, years = v.years || 1;
  const gain = final - initial;
  const totalPct = initial > 0 ? (gain / initial) * 100 : 0;
  const ann = initial > 0 && years > 0 ? (Math.pow(final / initial, 1 / years) - 1) * 100 : 0;
  const pts = [], lab = [];
  for (let y = 0; y <= Math.min(years, 40); y++) {
    pts.push(round2(initial * Math.pow(1 + ann / 100, y)));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Total ROI'), value: round2(totalPct) + '%', highlight: true },
      { label: L(lang, 'Annualized return'), value: round2(ann) + '%', highlight: true },
      { label: L(lang, 'Initial investment'), value: fmt(initial) },
      { label: L(lang, 'Final value'), value: fmt(final) },
      { label: L(lang, 'Total gain'), value: fmt(gain) },
      { label: L(lang, 'Investment period'), value: years + (lang === 'es' ? ' años' : ' years') },
    ],
    donut: { labels: [L(lang, 'Initial investment'), L(lang, 'Total gain')], values: [initial, Math.max(0, gain)], colors: ['#1e3a8a', '#22c55e'] },
    line: { labels: lab, values: pts, title: L(lang, 'Balance growth over time') },
    stacked: null,
  };
}

/* ---------- 19. College savings ---------- */
export function collegesavings(v, lang = 'en') {
  const costNow = v.costNow, years = v.yearsUntil, infl = v.inflation / 100;
  const futureAnnual = costNow * Math.pow(1 + infl, years);
  const futureTotal = futureAnnual * 4;
  const r = v.rate / 100 / 12, n = years * 12;
  const current = v.current || 0, monthly = v.monthly || 0;
  const grownCurrent = current * Math.pow(1 + r, n);
  const grownMonthly = fvAnnuity(monthly, r, n);
  const projected = grownCurrent + grownMonthly;
  const shortfall = Math.max(0, futureTotal - projected);
  const needMonthly = shortfall > 0 ? (r === 0 ? shortfall / n : (shortfall * r) / (Math.pow(1 + r, n) - 1)) : 0;
  const pts = [], lab = [];
  let b = current;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) b = b * (1 + r) + monthly;
    pts.push(round2(b));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Projected 4-year college cost'), value: fmt(futureTotal), highlight: true },
      { label: L(lang, 'College cost today (annual)'), value: fmt(costNow) },
      { label: L(lang, 'Years until college'), value: String(years) },
      { label: L(lang, 'Current college savings'), value: fmt(current) },
      { label: L(lang, 'Projected savings at college'), value: fmt(projected) },
      { label: L(lang, 'Shortfall'), value: fmt(shortfall), highlight: shortfall > 0 },
      { label: L(lang, 'Monthly contribution needed'), value: fmt(needMonthly + monthly) },
    ],
    donut: { labels: [L(lang, 'Projected savings at college'), L(lang, 'Shortfall')], values: [Math.min(projected, futureTotal), shortfall], colors: ['#1e3a8a', '#f59e0b'] },
    line: { labels: lab, values: pts, title: L(lang, 'Projected savings over time') },
    stacked: null,
    note: lang === 'es' ? 'Estimación: supone 4 años de universidad con la inflación aplicada al costo actual. Los costos reales varían por institución.' : 'Estimate: assumes 4 years of college with inflation applied to today\'s cost. Actual costs vary by school.',
  };
}

/* ---------- 20. Debt-to-income ratio ---------- */
export function dti(v, lang = 'en') {
  const income = v.income || 0;
  const housing = v.housing || 0, car = v.car || 0, student = v.student || 0;
  const cards = v.cards || 0, other = v.other || 0;
  const total = housing + car + student + cards + other;
  const ratio = income > 0 ? (total / income) * 100 : 0;
  const hRatio = income > 0 ? (housing / income) * 100 : 0;
  let rating, color;
  if (ratio < 20) { rating = lang === 'es' ? 'Excelente' : 'Excellent'; color = '#22c55e'; }
  else if (ratio <= 35) { rating = lang === 'es' ? 'Bueno' : 'Good'; color = '#84cc16'; }
  else if (ratio <= 43) { rating = lang === 'es' ? 'Aceptable (límite hipotecario)' : 'Acceptable (mortgage limit)'; color = '#f59e0b'; }
  else if (ratio <= 50) { rating = lang === 'es' ? 'Alto' : 'High'; color = '#f97316'; }
  else { rating = lang === 'es' ? 'Crítico' : 'Critical'; color = '#ef4444'; }
  return {
    outputs: [
      { label: L(lang, 'DTI ratio'), value: round2(ratio) + '%', highlight: true },
      { label: L(lang, 'DTI rating'), value: rating, highlight: true },
      { label: L(lang, 'Gross monthly income'), value: fmt(income) },
      { label: L(lang, 'Total monthly debts'), value: fmt(total) },
      { label: L(lang, 'Housing DTI'), value: round2(hRatio) + '%' },
    ],
    donut: {
      labels: [L(lang, 'Total monthly debts'), L(lang, 'Remaining income')],
      values: [total, Math.max(0, income - total)],
      colors: [color, '#e2e8f0'],
    },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'La mayoría de los prestamistas hipotecarios prefieren un DTI de 43% o menos (préstamo calificado).' : 'Most mortgage lenders prefer a DTI of 43% or less (qualified mortgage).',
  };
}

/* ---------- 21. Salary to hourly ---------- */
export function salaryhourly(v, lang = 'en') {
  const hours = v.hours || 40, weeks = v.weeks || 52;
  const divisor = hours * weeks;
  let annual, hourly;
  if (v.mode === 'hourly') {
    hourly = v.amount;
    annual = hourly * divisor;
  } else {
    annual = v.amount;
    hourly = divisor > 0 ? annual / divisor : 0;
  }
  return {
    outputs: [
      { label: L(lang, 'Equivalent hourly rate'), value: '$' + round2(hourly).toLocaleString('en-US', { minimumFractionDigits: 2 }), highlight: true },
      { label: L(lang, 'Equivalent annual salary'), value: fmt(annual), highlight: true },
      { label: L(lang, 'Equivalent monthly pay'), value: fmt(annual / 12) },
      { label: L(lang, 'Equivalent weekly pay'), value: fmt(annual / 52) },
      { label: L(lang, 'Hours per week'), value: String(hours) },
      { label: L(lang, 'Weeks per year'), value: String(weeks) },
    ],
    donut: null,
    line: null,
    stacked: null,
    note: lang === 'es' ? 'Conversión directa sin impuestos ni beneficios. El pago real depende de deducciones e impuestos.' : 'Straight conversion before taxes and benefits. Actual take-home depends on deductions and taxes.',
  };
}

/* ---------- 22. Car affordability ---------- */
export function carafford(v, lang = 'en') {
  const income = v.income || 0;
  const carBudget = income * 0.15;
  const down = v.down || 0, trade = v.trade || 0;
  const r = v.rate / 100 / 12, n = v.months || 60;
  const maxLoan = r === 0 ? carBudget * n : (carBudget * (1 - Math.pow(1 + r, -n))) / r;
  const maxPrice = maxLoan + down + trade;
  const pay = pmt(maxLoan, r, n);
  const totInt = pay * n - maxLoan;
  return {
    outputs: [
      { label: L(lang, 'Max affordable car price'), value: fmt(maxPrice), highlight: true },
      { label: L(lang, 'Monthly car budget (15%)'), value: fmt(carBudget), highlight: true },
      { label: L(lang, 'Max loan amount'), value: fmt(maxLoan) },
      { label: L(lang, 'Down payment'), value: fmt(down) },
      { label: L(lang, 'Trade-in value'), value: fmt(trade) },
      { label: L(lang, 'Estimated monthly payment'), value: fmt(pay) },
      { label: L(lang, 'Total interest'), value: fmt(totInt) },
    ],
    donut: { labels: [L(lang, 'Down payment'), L(lang, 'Trade-in value'), L(lang, 'Max loan amount')], values: [down, trade, maxLoan], colors: ['#22c55e', '#38bdf8', '#1e3a8a'] },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'Regla 20/4/10: 20% de pago inicial, plazo máximo de 4 años y costos totales del auto por debajo del 10–15% del ingreso neto.' : 'The 20/4/10 rule: 20% down, max 4-year term, and total car costs under 10–15% of take-home pay.',
  };
}

/* ---------- 23. Rent vs buy ---------- */
export function rentvsbuy(v, lang = 'en') {
  const price = v.price, downPct = (v.downPct || 20) / 100;
  const down = price * downPct, loan = price - down;
  const r = v.rate / 100 / 12, n = v.years * 12;
  const pi = pmt(loan, r, n);
  const taxM = (v.tax || 0) / 12, insM = (v.insurance || 0) / 12;
  const piti = pi + taxM + insM;
  const stay = v.stayYears || 7, stayM = stay * 12;
  const closing = price * 0.02;
  const maint = price * ((v.maintPct || 1) / 100) * stay;
  const cashOut = down + closing + piti * stayM + maint;
  let bal = loan;
  for (let m = 1; m <= Math.min(stayM, n); m++) {
    const i = bal * r;
    bal = Math.max(0, bal - (pi - i));
  }
  const fv = price * Math.pow(1 + (v.appreciation || 3) / 100, stay);
  const proceeds = fv * 0.94 - bal;
  const netBuy = cashOut - proceeds;
  let rentCost = 0;
  const rentPts = [], buyPts = [], lab = [];
  let cumRent = 0, cumBuy = down + closing;
  let bBal = loan;
  for (let y = 1; y <= stay; y++) {
    const yrRent = v.rent * 12 * Math.pow(1 + (v.rentInc || 3) / 100, y - 1);
    cumRent += yrRent;
    rentPts.push(round2(cumRent));
    for (let m = 0; m < 12; m++) {
      const i = bBal * r;
      bBal = Math.max(0, bBal - (pi - i));
    }
    cumBuy += piti * 12 + price * ((v.maintPct || 1) / 100);
    const fvY = price * Math.pow(1 + (v.appreciation || 3) / 100, y);
    buyPts.push(round2(cumBuy - (fvY * 0.94 - bBal)));
    lab.push(YR(lang) + y);
    rentCost = cumRent;
  }
  const diff = Math.abs(netBuy - rentCost);
  const buyWins = netBuy < rentCost;
  const verdict =
    lang === 'es'
      ? buyWins
        ? 'Comprar sale más barato por ' + fmt(diff) + ' en ' + stay + ' años.'
        : 'Rentar sale más barato por ' + fmt(diff) + ' en ' + stay + ' años.'
      : buyWins
        ? 'Buying is cheaper by ' + fmt(diff) + ' over ' + stay + ' years.'
        : 'Renting is cheaper by ' + fmt(diff) + ' over ' + stay + ' years.';
  return {
    outputs: [
      { label: L(lang, 'Cheaper option'), value: buyWins ? (lang === 'es' ? 'Comprar' : 'Buying') : (lang === 'es' ? 'Rentar' : 'Renting'), highlight: true },
      { label: L(lang, 'Difference'), value: fmt(diff), highlight: true },
      { label: L(lang, 'Total cost of buying'), value: fmt(netBuy) },
      { label: L(lang, 'Total cost of renting'), value: fmt(rentCost) },
      { label: L(lang, 'Monthly rent'), value: fmt(v.rent) },
      { label: L(lang, 'Home price'), value: fmt(price) },
      { label: L(lang, 'Years staying'), value: String(stay) },
    ],
    donut: null,
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'Total cost of renting'), values: rentPts, color: '#f59e0b' },
        { name: L(lang, 'Total cost of buying'), values: buyPts, color: '#1e3a8a' },
      ],
      title: L(lang, 'Total cost of renting'),
    },
    note: (lang === 'es' ? 'Supone 2% de costos de cierre y 6% de costos de venta. ' : 'Assumes 2% closing costs and 6% selling costs. ') + verdict,
  };
}

/* ---------- 24. Home equity / HELOC ---------- */
export function homeequity(v, lang = 'en') {
  const value = v.value, balance = v.balance || 0;
  const equity = Math.max(0, value - balance);
  const ltv = value > 0 ? (balance / value) * 100 : 0;
  const maxLine = Math.max(0, value * 0.8 - balance);
  const draw = Math.min(v.draw || 0, maxLine);
  const r = v.rate / 100 / 12, n = (v.termYears || 15) * 12;
  const pay = draw > 0 ? pmt(draw, r, n) : 0;
  return {
    outputs: [
      { label: L(lang, 'Home equity'), value: fmt(equity), highlight: true },
      { label: L(lang, 'Available to borrow'), value: fmt(maxLine), highlight: true },
      { label: L(lang, 'Home price'), value: fmt(value) },
      { label: L(lang, 'Mortgage balance'), value: fmt(balance) },
      { label: L(lang, 'Loan-to-value (LTV)'), value: round2(ltv) + '%' },
      { label: L(lang, 'Max HELOC amount (80% CLTV)'), value: fmt(maxLine) },
      { label: L(lang, 'Estimated HELOC payment'), value: fmt(pay) },
    ],
    donut: { labels: [L(lang, 'Home equity'), L(lang, 'Mortgage balance')], values: [equity, balance], colors: ['#22c55e', '#1e3a8a'] },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'La mayoría de los prestamistas limitan el préstamo total al 80% del valor de la vivienda (CLTV).' : 'Most lenders cap total borrowing at 80% of home value (CLTV).',
  };
}

/* ---------- 25. APR to APY converter ---------- */
export function aprapy(v, lang = 'en') {
  const n = v.compounding || 12;
  const rate = v.rate / 100;
  let outLabel, outVal;
  if (v.mode === 'apy2apr') {
    const apr = n * (Math.pow(1 + rate, 1 / n) - 1);
    outLabel = L(lang, 'Converted APR');
    outVal = round2(apr * 100) + '%';
  } else {
    const apy = Math.pow(1 + rate / n, n) - 1;
    outLabel = L(lang, 'Converted APY');
    outVal = round2(apy * 100) + '%';
  }
  return {
    outputs: [
      { label: outLabel, value: outVal, highlight: true },
      { label: v.mode === 'apy2apr' ? 'APY' : 'APR', value: round2(v.rate) + '%' },
      { label: L(lang, 'Compounding periods per year'), value: String(n) },
    ],
    donut: null,
    line: null,
    stacked: null,
    note: lang === 'es' ? 'APR es la tasa nominal; APY incluye la capitalización y refleja el rendimiento real.' : 'APR is the nominal rate; APY includes compounding and reflects the true yield.',
  };
}

/* ---------- 26. Tip calculator ---------- */
export function tip(v, lang = 'en') {
  const bill = v.bill, pct = v.tipPct || 18, people = Math.max(1, v.people || 1);
  const tipAmt = (bill * pct) / 100;
  const total = bill + tipAmt;
  return {
    outputs: [
      { label: L(lang, 'Tip amount'), value: fmt(tipAmt), highlight: true },
      { label: L(lang, 'Total with tip'), value: fmt(total), highlight: true },
      { label: L(lang, 'Bill amount'), value: fmt(bill) },
      { label: L(lang, 'Tip percentage'), value: pct + '%' },
      { label: L(lang, 'Per person'), value: fmt(total / people) },
      { label: L(lang, 'Number of people'), value: String(people) },
    ],
    donut: { labels: [L(lang, 'Bill amount'), L(lang, 'Tip amount')], values: [bill, tipAmt], colors: ['#1e3a8a', '#22c55e'] },
    line: null,
    stacked: null,
  };
}

/* ---------- 27. Overtime pay ---------- */
export function overtime(v, lang = 'en') {
  const rate = v.rate, regH = v.regHours || 40, otH = v.otHours || 0;
  const mult = v.multiplier || 1.5;
  const regPay = rate * regH;
  const otRate = rate * mult;
  const otPay = otRate * otH;
  const total = regPay + otPay;
  return {
    outputs: [
      { label: L(lang, 'Total weekly pay'), value: fmt(total), highlight: true },
      { label: L(lang, 'Regular pay'), value: fmt(regPay) },
      { label: L(lang, 'Overtime pay'), value: fmt(otPay) },
      { label: L(lang, 'Hourly rate'), value: fmt(rate) },
      { label: L(lang, 'Overtime rate'), value: fmt(otRate) },
      { label: L(lang, 'Regular hours'), value: String(regH) },
      { label: L(lang, 'Overtime hours'), value: String(otH) },
      { label: L(lang, 'Total annual pay'), value: fmt(total * 52) },
    ],
    donut: { labels: [L(lang, 'Regular pay'), L(lang, 'Overtime pay')], values: [regPay, otPay], colors: ['#1e3a8a', '#f59e0b'] },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'La ley federal (FLSA) exige 1.5× la tarifa regular por horas sobre 40/semana para empleados no exentos.' : 'Federal law (FLSA) requires 1.5× the regular rate for hours over 40/week for non-exempt employees.',
  };
}

/* ---------- 28. 401(k) max-out planner ---------- */
export function k401(v, lang = 'en') {
  const salary = v.salary, contribPct = (v.contribPct || 0) / 100;
  const employee = salary * contribPct;
  const matchPct = (v.matchPct || 0) / 100, capPct = (v.matchCap || 0) / 100;
  const employer = salary > 0 && capPct > 0 ? Math.min(employee, salary * capPct) * matchPct : 0;
  const totalAnnual = employee + employer;
  const IRS = 24500; // 2026 elective deferral limit
  const over = Math.max(0, employee - IRS);
  const taxSave = employee * ((v.marginalRate || 22) / 100);
  const years = Math.max(0, (v.retireAge || 65) - (v.age || 30));
  const r = v.rate / 100 / 12, n = years * 12;
  const current = v.current || 0;
  const projected = current * Math.pow(1 + r, n) + fvAnnuity(totalAnnual / 12, r, n);
  const pts = [], lab = [];
  let b = current;
  for (let y = 1; y <= Math.min(years, 50); y++) {
    for (let m = 0; m < 12; m++) b = b * (1 + r) + totalAnnual / 12;
    pts.push(round2(b));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Employee annual contribution'), value: fmt(employee), highlight: true },
      { label: L(lang, 'Employer annual match'), value: fmt(employer) },
      { label: L(lang, 'Total annual contribution'), value: fmt(totalAnnual), highlight: true },
      { label: L(lang, 'Tax savings (est.)'), value: fmt(taxSave) },
      { label: L(lang, 'IRS limit 2026'), value: fmt(IRS) },
      { label: L(lang, 'Over the limit by'), value: fmt(over) },
      { label: L(lang, 'Projected value at retirement'), value: fmt(projected) },
    ],
    donut: {
      labels: [L(lang, 'Employee annual contribution'), L(lang, 'Employer annual match')],
      values: [employee, employer],
      colors: ['#1e3a8a', '#38bdf8'],
    },
    line: pts.length ? { labels: lab, values: pts, title: L(lang, 'Projected value') } : null,
    stacked: null,
    note: lang === 'es' ? 'Límite de aporte electivo del IRS para 2026: $24,500 (menores de 50). El aporte del empleador no cuenta para este límite.' : 'IRS 2026 elective deferral limit: $24,500 (under 50). Employer match does not count toward this limit.',
  };
}

/* ---------- 29. High-yield savings ---------- */
export function savingsapy(v, lang = 'en') {
  const dep = v.deposit, apy = v.apy / 100, reg = (v.regApy || 0.5) / 100;
  const monthly = v.monthly || 0, years = v.years;
  const n = years * 12, rh = apy / 12, rr = reg / 12;
  let bH = dep, bR = dep, cH = dep, cR = dep;
  const ptsH = [], ptsR = [], lab = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      bH = bH * (1 + rh) + monthly;
      bR = bR * (1 + rr) + monthly;
    }
    cH += monthly * 12;
    cR += monthly * 12;
    ptsH.push(round2(bH));
    ptsR.push(round2(bR));
    lab.push(YR(lang) + y);
  }
  const intH = bH - cH, intR = bR - cR;
  return {
    outputs: [
      { label: L(lang, 'Future value'), value: fmt(bH), highlight: true },
      { label: L(lang, 'Interest earned (high-yield)'), value: fmt(intH), highlight: true },
      { label: L(lang, 'High-yield APY'), value: v.apy + '%' },
      { label: L(lang, 'Regular account APY'), value: (v.regApy || 0.5) + '%' },
      { label: L(lang, 'Interest earned (regular)'), value: fmt(intR) },
      { label: L(lang, 'Extra earned vs regular'), value: fmt(Math.max(0, intH - intR)) },
      { label: L(lang, 'Total contributions'), value: fmt(cH) },
    ],
    donut: { labels: [L(lang, 'Total contributions'), L(lang, 'Interest earned (high-yield)')], values: [cH, Math.max(0, intH)], colors: ['#1e3a8a', '#22c55e'] },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'High-yield APY'), values: ptsH, color: '#22c55e' },
        { name: L(lang, 'Regular account APY'), values: ptsR, color: '#94a3b8' },
      ],
      title: L(lang, 'Balance growth over time'),
    },
  };
}

/* ---------- 30. Capital gains tax ---------- */
export function capitalgains(v, lang = 'en') {
  const buy = v.buy, sell = v.sell;
  const gain = sell - buy;
  const income = v.income || 0;
  let rate, rateLabel;
  if (v.holding === 'short') {
    rate = (v.marginalRate || 22) / 100;
    rateLabel = (v.marginalRate || 22) + '% ' + (lang === 'es' ? '(ingreso ordinario)' : '(ordinary income)');
  } else {
    if (gain <= 0) rate = 0;
    else if (income <= 48350) rate = 0;
    else if (income <= 533400) rate = 0.15;
    else rate = 0.2;
    rateLabel = Math.round(rate * 100) + '% ' + (lang === 'es' ? '(largo plazo)' : '(long-term)');
  }
  const tax = Math.max(0, gain) * rate;
  const net = gain - tax;
  return {
    outputs: [
      { label: L(lang, 'Capital gain'), value: fmt(gain), highlight: true },
      { label: L(lang, 'Tax owed'), value: fmt(tax), highlight: true },
      { label: L(lang, 'Net proceeds'), value: fmt(net) },
      { label: L(lang, 'Purchase price'), value: fmt(buy) },
      { label: L(lang, 'Sale price'), value: fmt(sell) },
      { label: L(lang, 'Holding period'), value: v.holding === 'short' ? L(lang, 'Short-term') : L(lang, 'Long-term') },
      { label: L(lang, 'Tax rate applied'), value: rateLabel },
    ],
    donut: { labels: [L(lang, 'Net proceeds'), L(lang, 'Tax owed')], values: [Math.max(0, net), tax], colors: ['#22c55e', '#ef4444'] },
    line: null,
    stacked: null,
    note: lang === 'es'
      ? 'Usa tramos federales 2025 para declarante individual (0% hasta $48,350; 15% hasta $533,400; 20% más). Las ganancias a corto plazo se gravan como ingreso ordinario. No incluye impuestos estatales.'
      : 'Uses 2025 federal single-filer brackets (0% to $48,350; 15% to $533,400; 20% above). Short-term gains are taxed as ordinary income. Excludes state taxes.',
  };
}

/* ---------- 31. Loan comparison ---------- */
export function loancompare(v, lang = 'en') {
  const amt = v.amount;
  const rA = v.rateA / 100 / 12, nA = v.yearsA * 12;
  const rB = v.rateB / 100 / 12, nB = v.yearsB * 12;
  const payA = pmt(amt, rA, nA), payB = pmt(amt, rB, nB);
  const feeA = v.feeA || 0, feeB = v.feeB || 0;
  const intA = payA * nA - amt, intB = payB * nB - amt;
  const totA = amt + intA + feeA, totB = amt + intB + feeB;
  const better = totA <= totB ? 'A' : 'B';
  const diffPay = Math.abs(payA - payB), diffInt = Math.abs(intA - intB);
  const balA = [], balB = [], lab = [];
  let bA = amt, bB = amt;
  const maxN = Math.max(nA, nB);
  for (let m = 1; m <= maxN; m++) {
    if (m <= nA) { const i = bA * rA; bA = Math.max(0, bA - (payA - i)); }
    if (m <= nB) { const i = bB * rB; bB = Math.max(0, bB - (payB - i)); }
    if (m % 12 === 0 || m === maxN) {
      balA.push(round2(bA));
      balB.push(round2(bB));
      lab.push(YR(lang) + Math.ceil(m / 12));
    }
  }
  return {
    outputs: [
      { label: L(lang, 'Better option'), value: (lang === 'es' ? 'Préstamo ' : 'Loan ') + better, highlight: true },
      { label: L(lang, 'Loan A') + ' - ' + L(lang, 'Monthly payment'), value: fmt(payA) },
      { label: L(lang, 'Loan B') + ' - ' + L(lang, 'Monthly payment'), value: fmt(payB) },
      { label: L(lang, 'Loan A') + ' - ' + L(lang, 'Total interest'), value: fmt(intA) },
      { label: L(lang, 'Loan B') + ' - ' + L(lang, 'Total interest'), value: fmt(intB) },
      { label: L(lang, 'Payment difference'), value: fmt(diffPay) },
      { label: L(lang, 'Interest difference'), value: fmt(diffInt), highlight: true },
    ],
    donut: {
      labels: [L(lang, 'Loan A') + ' ' + L(lang, 'Total interest'), L(lang, 'Loan B') + ' ' + L(lang, 'Total interest')],
      values: [intA, intB],
      colors: ['#1e3a8a', '#38bdf8'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'Loan A'), values: balA, color: '#1e3a8a' },
        { name: L(lang, 'Loan B'), values: balB, color: '#38bdf8' },
      ],
      title: L(lang, 'Remaining balance by year'),
    },
  };
}

/* ---------- 32. Paycheck breakdown ---------- */
export function paycheckdetail(v, lang = 'en') {
  const gross = v.gross, pre = v.pretax || 0;
  const taxRate = (v.taxRate || 22) / 100;
  const post = v.posttax || 0;
  const net = Math.max(0, (gross - pre) * (1 - taxRate) - post);
  const bills = v.bills || 0, save = v.savings || 0, debt = v.debt || 0, spend = v.spending || 0;
  const alloc = bills + save + debt + spend;
  const unalloc = net - alloc;
  const pct = (x) => (net > 0 ? round2((x / net) * 100) + '%' : 'N/A');
  return {
    outputs: [
      { label: L(lang, 'Net pay'), value: fmt(net), highlight: true },
      { label: L(lang, 'Gross pay'), value: fmt(gross) },
      { label: L(lang, 'Pre-tax deductions'), value: fmt(pre) },
      { label: L(lang, 'Post-tax deductions'), value: fmt(post) },
      { label: L(lang, 'Bills') + ' (' + pct(bills) + ')', value: fmt(bills) },
      { label: L(lang, 'Your savings') + ' (' + pct(save) + ')', value: fmt(save) },
      { label: L(lang, 'Debt payments') + ' (' + pct(debt) + ')', value: fmt(debt) },
      { label: L(lang, 'Spending money') + ' (' + pct(spend) + ')', value: fmt(spend) },
      { label: L(lang, 'Unallocated'), value: fmt(unalloc), highlight: unalloc !== 0 },
    ],
    donut: {
      labels: [L(lang, 'Bills'), L(lang, 'Your savings'), L(lang, 'Debt payments'), L(lang, 'Spending money'), L(lang, 'Unallocated')],
      values: [bills, save, debt, spend, Math.max(0, unalloc)],
      colors: ['#1e3a8a', '#22c55e', '#ef4444', '#f59e0b', '#e2e8f0'],
    },
    line: null,
    stacked: null,
    note: lang === 'es' ? 'La tasa de impuestos es un estimado fijo. Los impuestos reales dependen de tu W-4, estado civil y deducciones.' : 'Tax rate is a flat estimate. Actual taxes depend on your W-4, filing status and deductions.',
  };
}

/* ---------- 34. Roth vs Traditional IRA ---------- */
export function rothvstrad(v, lang = 'en') {
  const years = Math.max(0, Math.min(60, (v.retireAge || 65) - (v.age || 30)));
  const contrib = v.contrib || 0, r = (v.rate || 7) / 100;
  const nowRate = (v.nowRate || 22) / 100, retRate = (v.retRate || 22) / 100;
  const f = r === 0 ? years : (Math.pow(1 + r, years) - 1) / r;
  const tradPre = contrib * f;
  const tradTax = tradPre * retRate;
  const tradAfter = tradPre - tradTax;
  const rothAfter = contrib * (1 - nowRate) * f;
  const taxNow = contrib * nowRate * years;
  const winner = rothAfter >= tradAfter ? 'Roth' : 'Traditional';
  const diff = Math.abs(rothAfter - tradAfter);
  const sR = [], sT = [], lab = [];
  for (let y = 1; y <= years; y++) {
    const fy = r === 0 ? y : (Math.pow(1 + r, y) - 1) / r;
    sR.push(round2(contrib * (1 - nowRate) * fy));
    sT.push(round2(contrib * fy * (1 - retRate)));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Winner'), value: (lang === 'es' ? 'IRA ' : '') + winner + (lang === 'es' ? '' : ' IRA'), highlight: true },
      { label: L(lang, 'Roth value (after tax)'), value: fmt(rothAfter), highlight: true },
      { label: L(lang, 'Traditional value (after tax)'), value: fmt(tradAfter), highlight: true },
      { label: L(lang, 'Difference'), value: fmt(diff) },
      { label: L(lang, 'Tax paid now (Roth)'), value: fmt(taxNow) },
      { label: L(lang, 'Tax paid at withdrawal (Traditional)'), value: fmt(tradTax) },
      { label: L(lang, 'Total contributions'), value: fmt(contrib * years) },
      { label: L(lang, 'Years invested'), value: String(years) },
    ],
    donut: {
      labels: [L(lang, 'Roth value (after tax)'), L(lang, 'Traditional value (after tax)')],
      values: [Math.max(0, rothAfter), Math.max(0, tradAfter)],
      colors: ['#22c55e', '#1e3a8a'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: 'Roth IRA', values: sR, color: '#22c55e' },
        { name: L(lang, 'Traditional IRA'), values: sT, color: '#1e3a8a' },
      ],
      title: L(lang, 'Balance growth over time'),
    },
    note: lang === 'es'
      ? 'Modelo simplificado: aportes al final de cada año, sin límites del IRS ni RMD. Los impuestos reales dependen de tu situación.'
      : 'Simplified model: year-end contributions, no IRS limits or RMDs. Actual taxes depend on your situation.',
  };
}

/* ---------- 35. Biweekly mortgage payoff ---------- */
export function biweekly(v, lang = 'en') {
  const loan = v.loan || 0, annual = (v.rate || 6.5) / 100, years = v.years || 30;
  const n = years * 12, rm = annual / 12;
  const monthly = pmt(loan, rm, n);
  let b = loan, intStd = 0, mStd = 0;
  while (b > 0.01 && mStd < n + 24) {
    const i = b * rm;
    intStd += Math.min(i, b + i);
    b = b + i - Math.min(monthly, b + i);
    mStd++;
    if (b <= 0.01) { b = 0; break; }
  }
  const rb = annual / 26, bwPay = monthly / 2;
  let bb = loan, intBw = 0, per = 0;
  while (bb > 0.01 && per < 26 * 60) {
    const i = bb * rb;
    intBw += i;
    bb = bb + i - Math.min(bwPay, bb + i);
    per++;
    if (bb <= 0.01) { bb = 0; break; }
  }
  const yrsStd = mStd / 12, yrsBw = per / 26;
  const yrsSaved = Math.max(0, yrsStd - yrsBw);
  const intSaved = Math.max(0, intStd - intBw);
  const balS = [], balB = [], lab = [];
  b = loan; bb = loan;
  const maxY = Math.ceil(Math.max(yrsStd, yrsBw));
  for (let y = 1; y <= maxY; y++) {
    for (let m = 0; m < 12 && b > 0; m++) { const i = b * rm; b = Math.max(0, b + i - monthly); }
    for (let k = (y - 1) * 26; k < y * 26 && bb > 0; k++) { const i = bb * rb; bb = Math.max(0, bb + i - bwPay); }
    balS.push(round2(b));
    balB.push(round2(bb));
    lab.push(YR(lang) + y);
  }
  return {
    outputs: [
      { label: L(lang, 'Payoff time (biweekly)'), value: yrsBw.toFixed(1) + ' ' + L(lang, 'years'), highlight: true },
      { label: L(lang, 'Years saved'), value: yrsSaved.toFixed(1) + ' ' + L(lang, 'years'), highlight: true },
      { label: L(lang, 'Interest saved'), value: fmt(intSaved), highlight: true },
      { label: L(lang, 'Biweekly payment'), value: fmt(bwPay) },
      { label: L(lang, 'Monthly payment'), value: fmt(monthly) },
      { label: L(lang, 'Standard total interest'), value: fmt(intStd) },
      { label: L(lang, 'Biweekly total interest'), value: fmt(intBw) },
      { label: L(lang, 'Payoff time (standard)'), value: yrsStd.toFixed(1) + ' ' + L(lang, 'years') },
    ],
    donut: {
      labels: [L(lang, 'Standard total interest'), L(lang, 'Biweekly total interest')],
      values: [Math.max(0, intStd), Math.max(0, intBw)],
      colors: ['#94a3b8', '#22c55e'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: L(lang, 'Standard schedule'), values: balS, color: '#94a3b8' },
        { name: L(lang, 'Biweekly schedule'), values: balB, color: '#22c55e' },
      ],
      title: L(lang, 'Remaining balance by year'),
    },
    note: lang === 'es'
      ? 'El pago quincenal equivale a 13 pagos mensuales al año. No todos los prestamistas lo aplican automáticamente al capital; confirma con el tuyo.'
      : 'Biweekly payments equal 13 monthly payments per year. Not all lenders auto-apply the extra to principal - confirm with yours.',
  };
}

/* ---------- 2026 federal tax helpers (shared by freelancer-tax tools) ---------- */
function fedBrackets2026(status) {
  if (status === 'mfj')
    return [[24800, 0.1], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]];
  if (status === 'hoh')
    return [[17700, 0.1], [67450, 0.12], [105700, 0.22], [201750, 0.24], [256200, 0.32], [640600, 0.35], [Infinity, 0.37]];
  return [[12400, 0.1], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]];
}

function stdDed2026(status) {
  if (status === 'mfj') return 32200;
  if (status === 'hoh') return 24150;
  return 16100;
}

function fedTax2026(taxable, status) {
  const brackets = fedBrackets2026(status);
  let tax = 0, prev = 0;
  for (const [cap, r] of brackets) {
    const inB = Math.min(taxable, cap) - prev;
    if (inB > 0) tax += inB * r;
    prev = cap;
    if (taxable <= cap) break;
  }
  return tax;
}

/* Self-employment tax on net SE earnings (Schedule C profit), 2026 law. */
function seTax2026(netSE, status) {
  const base = Math.max(0, netSE) * 0.9235;
  const ssPart = Math.min(base, 184500) * 0.124;
  const medPart = base * 0.029;
  const addlThreshold = status === 'mfj' ? 250000 : 200000;
  const addl = Math.max(0, base - addlThreshold) * 0.009;
  return { base, ssPart, medPart, addl, total: ssPart + medPart + addl };
}

/* ---------- 39. 1099 vs W-2 take-home pay (2026 figures) ---------- */
export function se1099vsw2(v, lang = 'en') {
  const gross = Math.max(0, v.gross || 0);
  const status = v.filingStatus || 'single';
  const stateRate = (v.stateRate || 0) / 100;
  const stdDed = stdDed2026(status);
  const addlThreshold = status === 'mfj' ? 250000 : 200000;

  /* W-2 employee side: employer pays half of FICA behind the scenes. */
  const w2Taxable = Math.max(0, gross - stdDed);
  const w2Fed = fedTax2026(w2Taxable, status);
  const w2SS = Math.min(gross, 184500) * 0.062;
  const w2Med = gross * 0.0145;
  const w2Addl = Math.max(0, gross - addlThreshold) * 0.009;
  const w2Fica = w2SS + w2Med + w2Addl;
  const w2State = gross * stateRate;
  const w2TakeHome = gross - w2Fed - w2Fica - w2State;

  /* 1099 contractor side: pays both halves via SE tax, deducts half. */
  function c1099(g) {
    const se = seTax2026(g, status);
    const halfSE = se.total / 2;
    const agi = Math.max(0, g - halfSE);
    const taxable = Math.max(0, agi - stdDed);
    const fed = fedTax2026(taxable, status);
    const state = g * stateRate;
    return { takeHome: g - se.total - fed - state, seTax: se.total, fed, state };
  }
  const c = c1099(gross);

  /* Break-even: 1099 gross needed to match the W-2 take-home (bisection). */
  let breakEven = gross, multiplier = 1;
  if (gross > 0 && c.takeHome < w2TakeHome) {
    let lo = gross, hi = gross * 2 + 5000, guard = 0;
    while (c1099(hi).takeHome < w2TakeHome && guard < 20) { hi *= 1.5; guard++; }
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (c1099(mid).takeHome < w2TakeHome) lo = mid; else hi = mid;
    }
    breakEven = (lo + hi) / 2;
    multiplier = breakEven / gross;
  }

  const gap = w2TakeHome - c.takeHome;
  return {
    outputs: [
      { label: 'W-2 take-home pay', value: fmt(w2TakeHome), highlight: true },
      { label: '1099 take-home pay (same gross)', value: fmt(c.takeHome), highlight: true },
      { label: '1099 break-even gross', value: fmt(breakEven), highlight: true },
      { label: 'Contractor rate multiplier', value: multiplier.toFixed(2) + 'x  (charge ' + (Math.round((multiplier - 1) * 1000) / 10) + '% more than the W-2 salary)' },
      { label: 'W-2 federal income tax', value: fmt(w2Fed) },
      { label: 'W-2 FICA (employee half)', value: fmt(w2Fica) },
      { label: '1099 self-employment tax', value: fmt(c.seTax) },
      { label: '1099 federal income tax', value: fmt(c.fed) },
      { label: 'State tax, flat estimate (both)', value: fmt(gross * stateRate) },
      { label: 'Take-home gap at equal gross', value: fmt(Math.max(0, gap)) },
    ],
    donut: null,
    line: null,
    stacked: {
      labels: ['W-2 employee', '1099 contractor'],
      series: [
        { name: 'Take-home pay', values: [round2(Math.max(0, w2TakeHome)), round2(Math.max(0, c.takeHome))], color: '#22c55e' },
        { name: 'All taxes', values: [round2(Math.max(0, gross - w2TakeHome)), round2(Math.max(0, gross - c.takeHome))], color: '#ef4444' },
      ],
      title: 'Take-home comparison at the same gross pay',
    },
    note: 'Planning estimate using 2026 federal brackets, standard deduction, and SE tax law (SS wage base $184,500). Assumes the 1099 gross equals net self-employment earnings (no business expenses deducted) and a flat state rate. Real results vary with deductions, W-4 withholding, and your state\'s actual tax code.',
  };
}

/* ---------- 40. Self-employment tax (2026) ---------- */
export function selfemptax(v, lang = 'en') {
  const income = Math.max(0, v.netIncome || 0);
  const status = v.filingStatus || 'single';
  const stdDed = stdDed2026(status);
  const se = seTax2026(income, status);
  const halfSE = se.total / 2;
  const agi = Math.max(0, income - halfSE);
  const taxable = Math.max(0, agi - stdDed);
  const fedTax = fedTax2026(taxable, status);
  const totalTax = se.total + fedTax;
  const effective = income > 0 ? (totalTax / income) * 100 : 0;
  return {
    outputs: [
      { label: 'Self-employment tax', value: fmt(se.total), highlight: true },
      { label: 'Social Security part (12.4% to $184,500)', value: fmt(se.ssPart) },
      { label: 'Medicare part (2.9%, no cap)', value: fmt(se.medPart) },
      { label: 'Additional Medicare (0.9%)', value: fmt(se.addl) },
      { label: 'Deductible half (lowers income tax)', value: fmt(halfSE) },
      { label: 'Estimated federal income tax', value: fmt(fedTax) },
      { label: 'Combined tax bill', value: fmt(totalTax), highlight: true },
      { label: 'Effective tax rate', value: effective.toFixed(1) + '%' },
      { label: 'You keep', value: fmt(Math.max(0, income - totalTax)) },
    ],
    donut: {
      labels: ['You keep', 'SE tax', 'Income tax'],
      values: [round2(Math.max(0, income - totalTax)), round2(se.total), round2(fedTax)],
      colors: ['#22c55e', '#1e3a8a', '#38bdf8'],
    },
    line: null,
    stacked: null,
    note: 'Estimate using 2026 law: SE tax is 15.3% on 92.35% of net earnings (12.4% Social Security to the $184,500 wage base + 2.9% Medicare), plus 0.9% additional Medicare above $200k single / $250k joint. Half of SE tax is deductible for income tax. Income tax uses the 2026 standard deduction; setting aside 25-30% of profit is a common rule of thumb.',
  };
}

/* ---------- 41. Quarterly estimated tax (2026) ---------- */
export function quarterlytax(v, lang = 'en') {
  const seIncome = Math.max(0, v.seIncome || 0);
  const w2Wages = Math.max(0, v.w2Wages || 0);
  const w2Withholding = Math.max(0, v.w2Withholding || 0);
  const priorTax = Math.max(0, v.priorYearTax || 0);
  const priorHighAGI = !!v.priorHighAGI;
  const status = v.filingStatus || 'single';
  const stdDed = stdDed2026(status);

  const se = seTax2026(seIncome, status);
  const halfSE = se.total / 2;
  const agi = Math.max(0, seIncome - halfSE + w2Wages);
  const taxable = Math.max(0, agi - stdDed);
  const fedTax = fedTax2026(taxable, status);
  const totalLiability = se.total + fedTax;

  /* Safe harbor: pay the smaller of 90% of current-year tax or 100%/110% of prior-year tax. */
  const safeHarbor = priorTax * (priorHighAGI ? 1.1 : 1.0);
  const targetAnnual = Math.min(totalLiability * 0.9, safeHarbor);
  const requiredAnnual = Math.max(0, targetAnnual - w2Withholding);
  const quarterly = requiredAnnual / 4;
  const cum = [1, 2, 3, 4].map((q) => round2(quarterly * q));

  return {
    outputs: [
      { label: 'Pay each quarter', value: fmt(quarterly), highlight: true },
      { label: 'Total 2026 tax liability (est.)', value: fmt(totalLiability), highlight: true },
      { label: 'Safe-harbor target (' + (priorHighAGI ? '110' : '100') + '% of prior-year tax)', value: fmt(safeHarbor) },
      { label: 'Annual estimated needed (after W-2 withholding)', value: fmt(requiredAnnual) },
      { label: 'Self-employment tax portion', value: fmt(se.total) },
      { label: 'Federal income tax portion', value: fmt(fedTax) },
      { label: 'Q1 due Apr 15, 2026', value: fmt(quarterly) },
      { label: 'Q2 due Jun 15, 2026', value: fmt(quarterly) },
      { label: 'Q3 due Sep 15, 2026', value: fmt(quarterly) },
      { label: 'Q4 due Jan 15, 2027', value: fmt(quarterly) },
    ],
    donut: {
      labels: ['SE tax', 'Income tax'],
      values: [round2(se.total), round2(fedTax)],
      colors: ['#1e3a8a', '#38bdf8'],
    },
    line: {
      labels: ['Q1 (Apr 15)', 'Q2 (Jun 15)', 'Q3 (Sep 15)', 'Q4 (Jan 15)'],
      values: cum,
      title: 'Cumulative estimated payments through 2026',
    },
    stacked: null,
    note: 'Pay the smaller of 90% of this year\'s tax or 100% of last year\'s tax (110% if prior-year AGI exceeded $150k) to avoid an underpayment penalty - W-2 withholding counts toward it. Due dates: April 15, June 15, September 15, 2026 and January 15, 2027. State estimated taxes are separate. This is a planning estimate, not tax advice.',
  };
}

/* ---------- 42. Roth vs Traditional 401(k) with employer match (2026) ---------- */
/* Equal-take-home normalization: $1 pre-tax to Traditional costs (1-nowRate) of
   take-home, so the Roth contribution with the identical paycheck impact is
   contrib*(1-nowRate). Employer match always lands pre-tax (taxed at withdrawal). */
export function roth401k(v, lang = 'en') {
  const age = Math.max(0, v.age || 0);
  const retireAge = Math.max(0, v.retireAge || 0);
  const years = Math.max(0, Math.min(60, retireAge - age));
  const nowRate = Math.max(0, Math.min(0.9, (v.nowRate || 0) / 100));
  const retRate = Math.max(0, Math.min(0.9, (v.retRate || 0) / 100));
  const contrib = Math.max(0, v.contrib || 0);
  const salary = Math.max(0, v.salary || 0);
  const matchPct = Math.max(0, (v.matchPct || 0) / 100);
  const matchCap = Math.max(0, (v.matchCap || 0) / 100);
  const r = Math.max(0, (v.rate || 0) / 100);

  const f = r === 0 ? years : (Math.pow(1 + r, years) - 1) / r;
  const matchAnnual = Math.min(contrib, salary * matchCap) * matchPct;

  /* Traditional path: full pre-tax contribution + match, all taxed at withdrawal. */
  const tradBalance = (contrib + matchAnnual) * f;
  const tradAfter = tradBalance * (1 - retRate);
  const tradTaxPaid = tradBalance * retRate;

  /* Roth path (same take-home cost): smaller after-tax contribution, tax-free
     growth; the employer match still rides pre-tax and is taxed at withdrawal. */
  const takeHomeCost = contrib * (1 - nowRate);
  const rothOwnBalance = takeHomeCost * f;
  const matchBalance = matchAnnual * f;
  const matchAfter = matchBalance * (1 - retRate);
  const rothAfter = rothOwnBalance + matchAfter;
  const rothTaxPaid = (contrib - takeHomeCost) * years + matchBalance * retRate;

  const winner = rothAfter >= tradAfter ? 'Roth 401(k)' : 'Traditional 401(k)';
  const diff = Math.abs(rothAfter - tradAfter);

  const sR = [], sT = [], lab = [];
  for (let y = 1; y <= years; y++) {
    const fy = r === 0 ? y : (Math.pow(1 + r, y) - 1) / r;
    sR.push(round2(takeHomeCost * fy + matchAnnual * fy * (1 - retRate)));
    sT.push(round2((contrib + matchAnnual) * fy * (1 - retRate)));
    lab.push('Yr ' + y);
  }

  return {
    outputs: [
      { label: 'Winner (after tax)', value: winner, highlight: true },
      { label: 'Roth 401(k) value at retirement', value: fmt(rothAfter), highlight: true },
      { label: 'Traditional 401(k) value at retirement', value: fmt(tradAfter), highlight: true },
      { label: 'Difference', value: fmt(diff) },
      { label: 'Annual take-home cost (identical both ways)', value: fmt(takeHomeCost) },
      { label: 'Roth annual contribution (same paycheck hit)', value: fmt(takeHomeCost) },
      { label: 'Employer match per year', value: fmt(matchAnnual) },
      { label: 'Match value at retirement (after tax)', value: fmt(matchAfter) },
      { label: 'Lifetime tax paid - Roth path', value: fmt(rothTaxPaid) },
      { label: 'Lifetime tax paid - Traditional path', value: fmt(tradTaxPaid) },
      { label: 'Years invested', value: String(years) },
    ],
    donut: {
      labels: ['Roth 401(k) after tax', 'Traditional 401(k) after tax'],
      values: [round2(Math.max(0, rothAfter)), round2(Math.max(0, tradAfter))],
      colors: ['#22c55e', '#1e3a8a'],
    },
    line: null,
    stacked: {
      labels: lab,
      series: [
        { name: 'Roth 401(k)', values: sR, color: '#22c55e' },
        { name: 'Traditional 401(k)', values: sT, color: '#1e3a8a' },
      ],
      title: 'After-tax balance growth over time',
    },
    note: 'Equal-take-home comparison: the Roth contribution is sized so both choices reduce your paycheck by the same amount - the only fair way to compare. Employer match is always pre-tax and taxed at withdrawal in both paths. Simplified model: year-end contributions, constant tax rates and returns, no IRS contribution limits, RMDs, or early-withdrawal penalties. Actual results depend on your tax situation.',
  };
}

/* ---------- 43. Side-hustle / gig-worker tax (2026) ---------- */
export function sidehustle(v, lang = 'en') {
  const w2 = Math.max(0, v.w2Salary || 0);
  const gross = Math.max(0, v.hustleIncome || 0);
  const expenses = Math.max(0, Math.min(gross, v.hustleExpenses || 0));
  const status = v.filingStatus || 'single';
  const stdDed = stdDed2026(status);

  const netHustle = gross - expenses;
  const se = seTax2026(netHustle, status);
  const halfSE = se.total / 2;

  /* Marginal income tax caused by the hustle: total tax with vs without it. */
  const agiWith = Math.max(0, w2 + netHustle - halfSE);
  const agiWithout = Math.max(0, w2);
  const taxWith = fedTax2026(Math.max(0, agiWith - stdDed), status);
  const taxWithout = fedTax2026(Math.max(0, agiWithout - stdDed), status);
  const marginalIncomeTax = Math.max(0, taxWith - taxWithout);

  const hustleTax = se.total + marginalIncomeTax;
  const takeHome = Math.max(0, netHustle - hustleTax);
  const quarterly = hustleTax / 4;
  const setAside = gross > 0 ? (hustleTax / gross) * 100 : 0;
  const effRate = netHustle > 0 ? (hustleTax / netHustle) * 100 : 0;

  return {
    outputs: [
      { label: 'Side-hustle take-home pay', value: fmt(takeHome), highlight: true },
      { label: 'Total hustle tax bill', value: fmt(hustleTax), highlight: true },
      { label: 'Set aside per hustle dollar', value: (Math.round(setAside * 10) / 10) + '%', highlight: true },
      { label: 'Self-employment tax on hustle', value: fmt(se.total) },
      { label: 'Extra income tax from hustle', value: fmt(marginalIncomeTax) },
      { label: 'Net hustle profit (after expenses)', value: fmt(netHustle) },
      { label: 'Quarterly estimated payment (hustle portion)', value: fmt(quarterly) },
      { label: 'Effective tax rate on hustle profit', value: effRate.toFixed(1) + '%' },
      { label: 'Deductible half of SE tax', value: fmt(halfSE) },
    ],
    donut: {
      labels: ['You keep', 'SE tax', 'Income tax'],
      values: [round2(takeHome), round2(se.total), round2(marginalIncomeTax)],
      colors: ['#22c55e', '#1e3a8a', '#38bdf8'],
    },
    line: null,
    stacked: null,
    note: 'Planning estimate using 2026 federal law (SE tax 15.3% on 92.35% of net profit, SS wage base $184,500; standard deduction ' + fmt(stdDed) + ' single). Assumes W-2 withholding already covers the salary portion. Set aside the "per hustle dollar" percentage from every payout - gig platforms withhold nothing. State tax and the 0.9% additional Medicare above $200k single / $250k joint are not included. Not tax advice.',
  };
}

/* ---------- 44. Calculadora de pago mínimo de tarjeta (ES, Banxico) ---------- */
/* Simula pagar solo el mínimo (regla Banxico: % del saldo o piso fijo) vs un
   pago fijo mayor. El CAT se usa como tasa anual de la simulación. */
export function pagominimo(v, lang = 'en') {
  const saldo = Math.max(0, v.saldo || 0);
  const cat = Math.max(0, v.cat || 0) / 100;
  const pctMin = Math.max(0.1, v.pctMin || 1.5) / 100;
  const piso = Math.max(0, v.piso || 0);
  const pagoFijo = Math.max(0, v.pagoFijo || 0);
  const rm = cat / 12;

  function anosMeses(m) {
    const a = Math.floor(m / 12), r = m % 12;
    return a > 0 ? a + ' años' + (r > 0 ? ', ' + r + ' meses' : '') : m + ' meses';
  }

  function simular(pagoFn) {
    let b = saldo, meses = 0, totInt = 0;
    const pts = [], lab = [];
    if (saldo <= 0.01) return { meses: 0, totInt: 0, total: 0, nunca: false, pts, lab };
    if (pagoFn(saldo) <= saldo * rm + 0.001) return { meses: 0, totInt: 0, total: 0, nunca: true, pts, lab };
    while (b > 0.01 && meses < 1200) {
      const interes = b * rm;
      let pago = Math.min(pagoFn(b), b + interes);
      if (pago <= interes) return { meses, totInt, total: totInt + (saldo - b), nunca: true, pts, lab };
      totInt += interes;
      b = b + interes - pago;
      meses++;
      if (meses % 12 === 0) { pts.push(round2(Math.max(0, b))); lab.push('Año ' + meses / 12); }
    }
    pts.push(0); lab.push('Listo');
    return { meses, totInt, total: saldo + totInt, nunca: false, pts, lab };
  }

  const minFn = (b) => Math.max(b * pctMin, piso);
  const rMin = simular(minFn);
  const rFijo = pagoFijo > 0 ? simular(() => pagoFijo) : null;

  const ahorroInt = rFijo && !rFijo.nunca && !rMin.nunca ? Math.max(0, rMin.totInt - rFijo.totInt) : 0;
  const ahorroMeses = rFijo && !rFijo.nunca && !rMin.nunca ? Math.max(0, rMin.meses - rFijo.meses) : 0;

  const outputs = [];
  if (rMin.nunca) {
    outputs.push({ label: 'Pagando solo el mínimo', value: 'Nunca terminas: el pago no cubre el interés mensual', highlight: true });
  } else {
    outputs.push({ label: 'Tiempo pagando solo el mínimo', value: anosMeses(rMin.meses), highlight: true });
    outputs.push({ label: 'Intereses totales (solo mínimo)', value: fmt(rMin.totInt), highlight: true });
    outputs.push({ label: 'Total pagado (solo mínimo)', value: fmt(rMin.total) });
  }
  if (rFijo) {
    if (rFijo.nunca) {
      outputs.push({ label: 'Con pago fijo de ' + fmt(pagoFijo) + '/mes', value: 'Tampoco alcanza: debe superar el interés mensual' });
    } else {
      outputs.push({ label: 'Tiempo con pago fijo de ' + fmt(pagoFijo) + '/mes', value: anosMeses(rFijo.meses), highlight: true });
      outputs.push({ label: 'Intereses con pago fijo', value: fmt(rFijo.totInt) });
      if (!rMin.nunca) {
        outputs.push({ label: 'Ahorro en intereses', value: fmt(ahorroInt), highlight: true });
        outputs.push({ label: 'Tiempo ahorrado', value: anosMeses(ahorroMeses) });
      } else {
        outputs.push({ label: 'Ventaja del pago fijo', value: 'Sales de una deuda que con el mínimo nunca terminaría', highlight: true });
      }
    }
  }
  outputs.push({ label: 'Pago mínimo este mes', value: fmt(Math.min(minFn(saldo), saldo * (1 + rm))) });

  return {
    outputs,
    donut: rMin.nunca ? null : {
      labels: ['Capital', 'Intereses (solo mínimo)'],
      values: [round2(saldo), round2(rMin.totInt)],
      colors: ['#1e3a8a', '#ef4444'],
    },
    line: (!rMin.nunca && rFijo && !rFijo.nunca) ? {
      labels: rMin.lab.filter((_, i) => i < rFijo.lab.length || true).slice(0, Math.max(rMin.lab.length, rFijo.lab.length)),
      values: rMin.pts,
      title: 'Saldo con pago mínimo año por año',
    } : null,
    stacked: null,
    note: 'Simulación con la regla habitual de pago mínimo en México (el mayor entre el % del saldo y el piso fijo; Banxico/CONDUSEF suelen usar 1.5% como referencia, cada banco define el suyo). El CAT se usa como tasa anual e incluye comisiones por definición, por lo que el costo real puede variar. No se agregan compras nuevas ni anualidades. Es un estimado educativo, no asesoría financiera.',
  };
}

/* ---- Text tools (pure string stats; UI lives in components/text-tools) ---- */

const TEXT_LABELS = {
  en: {
    chars: 'Characters (with spaces)',
    charsNoSpaces: 'Characters (no spaces)',
    words: 'Words',
    lines: 'Lines',
    sentences: 'Sentences',
    reading: 'Reading time (~200 wpm)',
    speaking: 'Speaking time (~150 wpm)',
    converted: 'Converted text',
    previewNote: 'Live preview above - use the full tool for copy & platform meters.',
  },
  es: {
    chars: 'Caracteres (con espacios)',
    charsNoSpaces: 'Caracteres (sin espacios)',
    words: 'Palabras',
    lines: 'Líneas',
    sentences: 'Oraciones',
    reading: 'Tiempo de lectura (~200 ppm)',
    speaking: 'Tiempo de narración (~150 ppm)',
    converted: 'Texto convertido',
    previewNote: 'Vista previa en vivo arriba - usa la herramienta completa para copiar y ver los medidores.',
  },
};

export function textCharStats(v, lang = 'en') {
  const L = TEXT_LABELS[lang] || TEXT_LABELS.en;
  const s = textStats(v && v.text);
  return {
    outputs: [
      { label: L.chars, value: String(s.chars), highlight: true },
      { label: L.charsNoSpaces, value: String(s.charsNoSpaces) },
      { label: L.words, value: String(s.words) },
      { label: L.lines, value: String(s.lines) },
      { label: L.reading, value: formatDuration(readingSeconds(s.words), lang) },
    ],
    note: L.previewNote,
  };
}

export function textWordStats(v, lang = 'en') {
  const L = TEXT_LABELS[lang] || TEXT_LABELS.en;
  const s = textStats(v && v.text);
  return {
    outputs: [
      { label: L.words, value: String(s.words), highlight: true },
      { label: L.chars, value: String(s.chars) },
      { label: L.sentences, value: String(s.sentences) },
      { label: L.reading, value: formatDuration(readingSeconds(s.words, 200), lang) },
      { label: L.speaking, value: formatDuration(readingSeconds(s.words, 150), lang) },
    ],
    note: L.previewNote,
  };
}

export function textCaseStats(v, lang = 'en') {
  const L = TEXT_LABELS[lang] || TEXT_LABELS.en;
  const text = (v && v.text) || '';
  const mode = (v && v.mode) || 'upper';
  const out = convertCase(text, mode);
  const s = textStats(out);
  const shown = out.length > 220 ? out.slice(0, 220) + '…' : out;
  return {
    outputs: [
      { label: L.converted, value: shown || '-', highlight: true },
      { label: L.words, value: String(s.words) },
      { label: L.chars, value: String(s.chars) },
    ],
    note: L.previewNote,
  };
}

/* ---- QR tools (payload summaries; full rendering lives in components/qr-tools) ---- */
import { buildWifiPayload, qrFits } from './qr-tools.js';

const QR_LABELS = {
  en: {
    payload: 'Encoded payload',
    chars: 'Payload size (bytes)',
    ecc: 'Error correction',
    fits: 'Fits in a QR code',
    yes: 'Yes',
    no: 'Too long - shorten it',
    size: 'Download size',
    previewNote: 'Live preview above - use the full tool for the QR image and downloads.',
  },
  es: {
    payload: 'Contenido codificado',
    chars: 'Tamaño (bytes)',
    ecc: 'Corrección de errores',
    fits: 'Cabe en un QR',
    yes: 'Sí',
    no: 'Demasiado largo - acórtalo',
    size: 'Tamaño de descarga',
    previewNote: 'Vista previa en vivo arriba - usa la herramienta completa para la imagen QR y las descargas.',
  },
};

export function qrCodeStats(v, lang = 'en') {
  const L = QR_LABELS[lang] || QR_LABELS.en;
  const text = (v && (v.text || v.content)) || '';
  const ecc = (v && v.ecc) || 'M';
  const size = (v && v.size) || 512;
  const bytes = Buffer.byteLength(String(text), 'utf8');
  const shown = text.length > 120 ? text.slice(0, 120) + '...' : text;
  return {
    outputs: [
      { label: L.payload, value: shown || '-', highlight: true },
      { label: L.chars, value: String(bytes) },
      { label: L.ecc, value: ecc },
      { label: L.fits, value: qrFits(text, ecc) ? L.yes : L.no },
      { label: L.size, value: size + ' x ' + size + ' px' },
    ],
    note: L.previewNote,
  };
}

export function wifiQrStats(v, lang = 'en') {
  const L = QR_LABELS[lang] || QR_LABELS.en;
  const payload = buildWifiPayload({
    ssid: (v && v.ssid) || '',
    password: (v && v.password) || '',
    encryption: (v && v.encryption) || 'WPA',
    hidden: !!(v && v.hidden),
  });
  const bytes = Buffer.byteLength(payload, 'utf8');
  return {
    outputs: [
      { label: L.payload, value: payload, highlight: true },
      { label: L.chars, value: String(bytes) },
      { label: L.fits, value: qrFits(payload, 'M') ? L.yes : L.no },
    ],
    note: L.previewNote,
  };
}

/* ---- Pay Stub Generator stats (gross / deductions / net from stub inputs) ---- */
const PAYSTUB_LABELS = {
  en: {
    gross: 'Gross pay', ded: 'Total deductions', net: 'Net pay', rate: 'Effective deduction rate',
    note: 'Estimate only - your employer payroll applies the exact tax tables.',
  },
  es: {
    gross: 'Pago bruto', ded: 'Deducciones totales', net: 'Pago neto', rate: 'Tasa efectiva de deducción',
    note: 'Solo una estimación - tu empleador aplica las tablas fiscales exactas.',
  },
};

export function payStubStats(v, lang = 'en') {
  const L = PAYSTUB_LABELS[lang] || PAYSTUB_LABELS.en;
  const n = (x) => {
    const f = parseFloat(x);
    return Number.isFinite(f) && f > 0 ? f : 0;
  };
  const hourly = !v || v.payType !== 'salary';
  const rate = n(v && v.rate);
  const regularPay = hourly ? rate * n(v && v.hours) : n(v && v.salary);
  const overtimePay = hourly ? rate * n(v && v.otHours) * (n(v && v.otMult) || 1.5) : 0;
  const gross = regularPay + overtimePay + n(v && v.bonus) + n(v && v.commission) + n(v && v.otherEarn);
  const ss = v && v.ssAuto === false ? n(v.ss) : gross * 0.062;
  const med = v && v.medAuto === false ? n(v.med) : gross * 0.0145;
  const ded = n(v && v.fed) + n(v && v.state) + ss + med + n(v && v.retirement) + n(v && v.health) + n(v && v.otherDed);
  const net = gross - ded;
  const money = (x) =>
    new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(x);
  return {
    outputs: [
      { label: L.gross, value: money(gross), highlight: true },
      { label: L.ded, value: money(ded) },
      { label: L.net, value: money(net), highlight: true },
      { label: L.rate, value: gross > 0 ? ((ded / gross) * 100).toFixed(1) + '%' : '-' },
    ],
    note: L.note,
  };
}

/* Password Generator: static SEO preview (the interactive tool is client-side). */
const PASSWORD_LABELS = {
  en: {
    length: 'Password length',
    charset: 'Character pool',
    entropy: 'Entropy (20 chars, all sets)',
    note: 'Preview only - use the interactive tool above to generate and copy.',
  },
  es: {
    length: 'Longitud',
    charset: 'Caracteres posibles',
    entropy: 'Entropía (20 caracteres, todo)',
    note: 'Solo vista previa - usa la herramienta interactiva para generar y copiar.',
  },
};

export function passwordStats(v, lang = 'en') {
  const L = PASSWORD_LABELS[lang] || PASSWORD_LABELS.en;
  const bits = 20 * Math.log2(88);
  return {
    outputs: [
      { label: L.length, value: '20', highlight: true },
      { label: L.charset, value: '88' },
      { label: L.entropy, value: '~' + bits.toFixed(0) + ' bits' },
    ],
    note: L.note,
  };
}

const JSON_LABELS = {
  en: {
    modes: 'Modes',
    valid: 'Valid JSON',
    keys: 'Top-level keys',
    note: 'Preview only - paste your JSON above and format it interactively.',
  },
  es: {
    modes: 'Modos',
    valid: 'JSON válido',
    keys: 'Claves de nivel superior',
    note: 'Solo vista previa - pega tu JSON arriba y dale formato de forma interactiva.',
  },
};

export function jsonStats(v, lang = 'en') {
  const L = JSON_LABELS[lang] || JSON_LABELS.en;
  return {
    outputs: [
      { label: L.valid, value: '100%', highlight: true },
      { label: L.modes, value: '4' },
      { label: L.keys, value: 'CSV' },
    ],
    note: L.note,
  };
}

const UUID_LABELS = {
  en: {
    version: 'Version',
    batch: 'Bulk mode',
    rfccited: 'RFC 4122',
    note: 'Preview only - use the interactive tool to generate and copy UUIDs.',
  },
  es: {
    version: 'Versión',
    batch: 'Modo masivo',
    rfccited: 'RFC 4122',
    note: 'Solo vista previa - usa la herramienta interactiva para generar y copiar UUIDs.',
  },
};

export function uuidStats(v, lang = 'en') {
  const L = UUID_LABELS[lang] || UUID_LABELS.en;
  return {
    outputs: [
      { label: L.version, value: 'v4', highlight: true },
      { label: L.batch, value: '1-500' },
      { label: L.rfccited, value: 'crypto' },
    ],
    note: L.note,
  };
}

const LOREM_LABELS = {
  en: {
    themes: 'Text themes',
    paragraphs: 'Paragraphs per run',
    words: 'Words per paragraph',
    note: 'Preview only - use the interactive tool above to generate themed placeholder text.',
  },
  es: {
    themes: 'Temas de texto',
    paragraphs: 'Párrafos por generación',
    words: 'Palabras por párrafo',
    note: 'Solo vista previa - usa la herramienta interactiva para generar texto de relleno temático.',
  },
};

export function loremStats(v, lang = 'en') {
  const L = LOREM_LABELS[lang] || LOREM_LABELS.en;
  return {
    outputs: [
      { label: L.themes, value: '4', highlight: true },
      { label: L.paragraphs, value: '1-10' },
      { label: L.words, value: '~30-85' },
    ],
    note: L.note,
  };
}
