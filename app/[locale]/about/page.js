import { absUrl, SITE_NAME, AUTHOR_NAME } from '@/lib/seo';

const PATH = '/about';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl((isEs ? '/es' : '') + PATH);
  const altUrl = absUrl((isEs ? '' : '/es') + PATH);
  const title = isEs
    ? `Acerca de ${SITE_NAME}: Calculadoras financieras gratuitas y guías de dinero`
    : `About ${SITE_NAME}: Free Finance Calculators & Money Guides`;
  const description = isEs
    ? `Acerca de ${SITE_NAME}: quién crea nuestras calculadoras financieras gratuitas y guías de dinero en EE. UU., nuestra metodología y cómo seguimos siendo gratis.`
    : `About ${SITE_NAME}: who builds our free US finance calculators and money guides, our methodology, and how we stay free.`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: isEs ? altUrl : url,
        es: isEs ? url : altUrl,
        'x-default': isEs ? altUrl : url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(isEs ? { locale: 'es_US' } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  if (isEs) {
    return (
      <div className="container">
        <div className="page-head" style={{ margin: '32px 0' }}>
          <h1>Acerca de UtilityHub</h1>
        </div>
        <div className="card prose">
          <p>
            UtilityHub es un recurso gratuito para quienes quieren entender mejor
            su dinero. Creamos calculadoras financieras precisas para hipotecas,
            préstamos, inversiones, impuestos y pago de deudas. Cada una incluye
            una explicación en lenguaje sencillo de cómo funciona la matemática
            detrás.
          </p>
          <h2>Quién lo crea</h2>
          <p>
            UtilityHub es creado y mantenido por {AUTHOR_NAME}, un desarrollador
            de software enfocado en hacer que la matemática financiera sea
            transparente y accesible. Cada calculadora se implementa con fórmulas
            estándar y verificables, y se prueba contra valores de referencia
            conocidos antes de publicarla. Las guías están escritas en lenguaje
            sencillo y se revisan para garantizar su precisión en cada
            actualización.
          </p>
          <h2>Qué hacemos</h2>
          <p>
            Cada calculadora de este sitio se ejecuta por completo en tu navegador
            y usa fórmulas financieras estándar y verificables: amortización de
            préstamos, crecimiento compuesto, tramos del impuesto federal de
            EE. UU. y la clásica regla 28/36 de capacidad de compra de vivienda.
            Cada herramienta se prueba contra valores de referencia conocidos, y
            cada página explica los conceptos detrás de los números para que puedas
            tomar decisiones con confianza, no por adivinación.
          </p>
          <h2>Qué no somos</h2>
          <p>
            UtilityHub es una herramienta educativa, no un prestamista, corredor,
            preparador de impuestos ni asesor de inversiones. Nada en este sitio
            es asesoramiento financiero. Las cifras son estimaciones con fines de
            planificación. Confirma siempre las decisiones importantes con un
            profesional calificado.
          </p>
          <h2>Cómo seguimos siendo gratis</h2>
          <p>
            Las calculadoras son gratuitas y no requieren cuenta. Mantenemos el
            sitio con publicidad. Nunca vendemos tus datos y nunca recopilamos los
            números que ingresas; los cálculos se realizan localmente en tu
            dispositivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>About UtilityHub</h1>
      </div>
      <div className="card prose">
        <p>
          UtilityHub is a free resource for anyone who wants to understand their money
          better. We build precision finance calculators for mortgages, loans,
          investing, taxes and debt payoff. Each comes with a plain-English explanation
          of how the underlying math works.
        </p>
        <h2>Who builds this</h2>
        <p>
          UtilityHub is built and maintained by {AUTHOR_NAME}, a software developer
          focused on making financial math transparent and accessible. Every
          calculator is implemented from standard, verifiable formulas and tested
          against known benchmarks before publishing. Guides are written in
          plain English and reviewed for accuracy on every update.
        </p>
        <h2>What we do</h2>
        <p>
          Every calculator on this site runs entirely in your browser and uses standard,
          verifiable financial formulas: loan amortization, compound growth, US federal
          tax brackets and the classic 28/36 home-affordability rule. Each tool is
          tested against known benchmarks, and each page explains the concepts behind
          the numbers so you can make decisions with confidence, not guesswork.
        </p>
        <h2>What we are not</h2>
        <p>
          UtilityHub is an educational tool, not a lender, broker, tax preparer or
          investment advisor. Nothing on this site is financial advice. Figures are
          estimates for planning purposes. Always confirm important decisions with a
          qualified professional.
        </p>
        <h2>How we stay free</h2>
        <p>
          The calculators are free to use with no account required. We keep the lights
          on with advertising. We never sell your data, and we never collect the
          numbers you enter; calculations happen locally on your device.
        </p>
      </div>
    </div>
  );
}
