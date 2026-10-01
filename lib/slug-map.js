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
  'how-much-house-can-i-afford-100k-salary': 'cuanta-casa-puedo-comprar-con-100k-de-salario',
  'debt-snowball-vs-avalanche': 'bola-de-nieve-vs-avalancha-de-deudas',
  'compound-interest-early-investing': 'interes-compuesto-empezar-joven',
};

function reverse(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}

export const TOOL_SLUG_EN = reverse(TOOL_SLUG_ES);
export const POST_SLUG_EN = reverse(POST_SLUG_ES);
