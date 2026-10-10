/* Bidirectional slug maps between English and Spanish routes.
   Used for hreflang alternates and the language switcher. */

export const TOOL_SLUG_ES = {
  'mortgage-calculator': 'calculadora-de-hipoteca',
  'home-affordability-calculator': 'cuanta-casa-puedo-comprar',
  'loan-payment-calculator': 'calculadora-de-prestamos',
  'emi-calculator': 'calculadora-de-cuotas-mensuales',
  'compound-interest-calculator': 'calculadora-de-interes-compuesto',
  'savings-goal-calculator': 'calculadora-de-metas-de-ahorro',
  'debt-payoff-calculator': 'calculadora-para-pagar-deudas',
  'refinance-calculator': 'calculadora-de-refinanciamiento',
  'auto-loan-calculator': 'calculadora-de-prestamo-para-auto',
  'salary-paycheck-calculator': 'calculadora-de-salario',
  'credit-card-payoff-calculator': 'calculadora-para-pagar-tarjeta-de-credito',
  'retirement-savings-calculator': 'calculadora-de-ahorro-para-jubilacion',
};

export const POST_SLUG_ES = {
  'how-much-house-can-i-afford-50k-salary': 'cuanta-casa-puedo-comprar-con-50k-de-salario',
  'how-much-house-can-i-afford-60k-salary': 'cuanta-casa-puedo-comprar-con-60k-de-salario',
  'how-much-house-can-i-afford-70k-salary': 'cuanta-casa-puedo-comprar-con-70k-de-salario',
  'how-much-house-can-i-afford-80k-salary': 'cuanta-casa-puedo-comprar-con-80k-de-salario',
  'how-much-house-can-i-afford-90k-salary': 'cuanta-casa-puedo-comprar-con-90k-de-salario',
  'how-much-house-can-i-afford-100k-salary': 'cuanta-casa-puedo-comprar-con-100k-de-salario',
  'how-much-house-can-i-afford-120k-salary': 'cuanta-casa-puedo-comprar-con-120k-de-salario',
  'how-much-house-can-i-afford-150k-salary': 'cuanta-casa-puedo-comprar-con-150k-de-salario',
  'how-much-house-can-i-afford-200k-salary': 'cuanta-casa-puedo-comprar-con-200k-de-salario',
  'debt-snowball-vs-avalanche': 'bola-de-nieve-vs-avalancha-de-deudas',
  'compound-interest-early-investing': 'interes-compuesto-empezar-joven',
  'what-is-pmi-how-to-avoid': 'que-es-el-pmi-y-como-evitarlo',
  '50-30-20-budget-rule': 'regla-50-30-20-presupuesto',
  'rent-vs-buy-which-is-cheaper': 'alquilar-vs-comprar-casa-cual-es-mas-barato',
  'should-i-refinance-my-mortgage': 'deberia-refinanciar-mi-hipoteca',
  '30-vs-15-year-mortgage': 'hipoteca-30-vs-15-anos-cual-conviene',
};

function reverse(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}

export const TOOL_SLUG_EN = reverse(TOOL_SLUG_ES);
export const POST_SLUG_EN = reverse(POST_SLUG_ES);
