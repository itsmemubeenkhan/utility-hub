/* Copy-paste embed snippets handed to bloggers, plus the per-tool copy for
   the "Embed this calculator" section on each tool page. Each snippet pairs
   the iframe with a visible attribution link; both point back to the tool
   page, which is the backlink this program exists to earn.
   Keyed by tool slug (EN and ES slugs are unique across locales). */

const SITE = 'https://www.theutilityhub.online';

function makeSnippet({ embedPath, height, name, canonical, creditPrefix }) {
  return `<iframe src="${SITE}${embedPath}" width="100%" height="${height}" style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;" title="${name} by The Utility Hub" loading="lazy"></iframe>
<p style="font-size:13px;">${name} ${creditPrefix} <a href="${canonical}" target="_blank" rel="noopener">The Utility Hub</a></p>`;
}

export const EMBEDS = {
  'tip-calculator': {
    lang: 'en',
    heading: 'Embed this calculator',
    blurb:
      'Run a food, travel or personal finance site? Put this tip calculator on your own page, free. Paste the code below into your post or sidebar and the calculator works right there. The small credit line under it is all we ask in return.',
    snippet: makeSnippet({
      embedPath: '/embed/tip-calculator',
      height: 1020,
      name: 'Tip Calculator',
      canonical: `${SITE}/tools/tip-calculator`,
      creditPrefix: 'by',
    }),
  },
  'pay-stub-generator': {
    lang: 'en',
    heading: 'Embed this calculator',
    blurb:
      'Run an HR, payroll or small business site? Put this pay stub generator on your own page, free. Paste the code below into your post or sidebar and the generator works right there. The small credit line under it is all we ask in return.',
    snippet: makeSnippet({
      embedPath: '/embed/pay-stub-generator',
      height: 1900,
      name: 'Pay Stub Generator',
      canonical: `${SITE}/tools/pay-stub-generator`,
      creditPrefix: 'by',
    }),
  },
  'mortgage-calculator': {
    lang: 'en',
    heading: 'Embed this calculator',
    blurb:
      'Run a real estate or personal finance site? Put this mortgage calculator on your own page, free. Paste the code below into your post or sidebar and the calculator works right there. The small credit line under it is all we ask in return.',
    snippet: makeSnippet({
      embedPath: '/embed/mortgage-calculator',
      height: 1200,
      name: 'Mortgage Calculator',
      canonical: `${SITE}/tools/mortgage-calculator`,
      creditPrefix: 'by',
    }),
  },
  'student-loan-calculator': {
    lang: 'en',
    heading: 'Embed this calculator',
    blurb:
      'Run a personal finance or education site? Put this student loan calculator on your own page, free. Paste the code below into your post or sidebar and the calculator works right there. The small credit line under it is all we ask in return.',
    snippet: makeSnippet({
      embedPath: '/embed/student-loan-calculator',
      height: 1050,
      name: 'Student Loan Calculator',
      canonical: `${SITE}/tools/student-loan-calculator`,
      creditPrefix: 'by',
    }),
  },
  'calculadora-de-cuotas-mensuales': {
    lang: 'es',
    heading: 'Inserta esta calculadora en tu sitio',
    blurb:
      '¿Tienes un sitio de finanzas personales o préstamos? Pon esta calculadora de cuotas mensuales en tu propia página, gratis. Pega el código siguiente en tu artículo o barra lateral y la calculadora funcionará allí mismo. La pequeña línea de crédito debajo es todo lo que pedimos a cambio.',
    copyLabel: 'Copiar código de inserción',
    copiedLabel: '¡Copiado!',
    snippet: makeSnippet({
      embedPath: '/embed/calculadora-de-cuotas-mensuales',
      height: 1300,
      name: 'Calculadora de cuotas mensuales',
      canonical: `${SITE}/es/tools/calculadora-de-cuotas-mensuales`,
      creditPrefix: 'por',
    }),
  },
  'calculadora-de-prestamos': {
    lang: 'es',
    heading: 'Inserta esta calculadora en tu sitio',
    blurb:
      '¿Tienes un sitio de finanzas personales o préstamos? Pon esta calculadora de préstamos en tu propia página, gratis. Pega el código siguiente en tu artículo o barra lateral y la calculadora funcionará allí mismo. La pequeña línea de crédito debajo es todo lo que pedimos a cambio.',
    copyLabel: 'Copiar código de inserción',
    copiedLabel: '¡Copiado!',
    snippet: makeSnippet({
      embedPath: '/embed/calculadora-de-prestamos',
      height: 1300,
      name: 'Calculadora de préstamos',
      canonical: `${SITE}/es/tools/calculadora-de-prestamos`,
      creditPrefix: 'por',
    }),
  },
  'calculadora-de-salario-a-por-hora': {
    lang: 'es',
    heading: 'Inserta esta calculadora en tu sitio',
    blurb:
      '¿Tienes un sitio de empleo, salarios o finanzas personales? Pon esta calculadora de salario a por hora en tu propia página, gratis. Pega el código siguiente en tu artículo o barra lateral y la calculadora funcionará allí mismo. La pequeña línea de crédito debajo es todo lo que pedimos a cambio.',
    copyLabel: 'Copiar código de inserción',
    copiedLabel: '¡Copiado!',
    snippet: makeSnippet({
      embedPath: '/embed/calculadora-de-salario-a-por-hora',
      height: 950,
      name: 'Calculadora de salario a por hora',
      canonical: `${SITE}/es/tools/calculadora-de-salario-a-por-hora`,
      creditPrefix: 'por',
    }),
  },
};

/* Kept for backward compatibility with the original tip embed commit. */
export const TIP_CALCULATOR_EMBED = EMBEDS['tip-calculator'].snippet;
