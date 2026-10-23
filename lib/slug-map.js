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
  'roth-vs-traditional-ira': 'roth-vs-tradicional-ira',
  'biweekly-mortgage-calculator': 'calculadora-de-hipoteca-quincenal',
  'character-counter': 'contador-de-caracteres',
  'word-counter': 'contador-de-palabras',
  'case-converter': 'convertidor-de-mayusculas',
  'qr-code-generator': 'generador-de-codigos-qr',
  'wifi-qr-generator': 'generador-qr-wifi',
  'pay-stub-generator': 'generador-de-recibo-de-pago',
  'password-generator': 'generador-de-contrasenas-aleatorias',
  'json-formatter': 'formateador-json',
  'uuid-generator': 'generador-de-uuid',
  'lorem-ipsum-generator': 'generador-de-lorem-ipsum',
  'stopwatch-timer': 'cronometro-y-temporizador',
  'hex-to-rgb': 'convertidor-de-hex-a-rgb',
  'barcode-generator': 'generador-de-codigos-de-barras',
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
  'how-mortgage-interest-works': 'como-funciona-el-interes-de-una-hipoteca',
  'how-long-to-pay-off-credit-card': 'cuanto-tarda-pagar-tarjeta-de-credito',
  'biweekly-mortgage-payments-worth-it': 'pagos-quincenales-de-hipoteca-valen-la-pena',
  'how-much-car-can-i-afford': 'cuanto-coche-puedo-comprar',
  'how-much-do-i-need-to-retire': 'cuanto-necesito-para-jubilarme',
  'emi-vs-simple-interest': 'emi-vs-interes-simple',
};

function reverse(map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}

export const TOOL_SLUG_EN = reverse(TOOL_SLUG_ES);
export const POST_SLUG_EN = reverse(POST_SLUG_ES);
