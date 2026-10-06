import { absUrl, SITE_NAME } from '@/lib/seo';

const PATH = '/contact';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl((isEs ? '/es' : '') + PATH);
  const altUrl = absUrl((isEs ? '' : '/es') + PATH);
  const title = isEs ? 'Contacto' : 'Contact';
  const description = isEs
    ? `Contacta a ${SITE_NAME}: preguntas, comentarios y correcciones.`
    : `Contact ${SITE_NAME}: questions, feedback and corrections.`;
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

export default async function ContactPage({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  if (isEs) {
    return (
      <div className="container">
        <div className="page-head" style={{ margin: '32px 0' }}>
          <h1>Contáctanos</h1>
          <p className="lede">
            ¿Preguntas sobre una calculadora, una corrección para un artículo o
            comentarios sobre el sitio? Nos gustaría saber de ti.
          </p>
        </div>
        <div className="card prose">
          <h2>Correo electrónico</h2>
          <p>
            Escríbenos a <a href="mailto:mubeenmuhammadsiddiq@gmail.com">mubeenmuhammadsiddiq@gmail.com</a>.
          </p>
          <h2>Qué incluir</h2>
          <p>
            Para problemas con calculadoras, dinos qué herramienta usaste, los
            números que ingresaste y qué parecía estar mal. Eso nos ayuda a
            reproducir y corregir el problema rápidamente. Para correcciones de
            artículos, incluye el título del artículo y el pasaje en cuestión.
          </p>
          <p>Nuestro objetivo es responder en unos días hábiles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Contact us</h1>
        <p className="lede">
          Questions about a calculator, a correction for an article, or feedback on
          the site. We would like to hear from you.
        </p>
      </div>
      <div className="card prose">
        <h2>Email</h2>
        <p>
          Reach us at <a href="mailto:mubeenmuhammadsiddiq@gmail.com">mubeenmuhammadsiddiq@gmail.com</a>.
        </p>
        <h2>What to include</h2>
        <p>
          For calculator issues, tell us which tool you used, the numbers you entered
          and what looked wrong. That helps us reproduce and fix the problem quickly.
          For article corrections, include the article title and the passage in
          question.
        </p>
        <p>We aim to respond within a few business days.</p>
      </div>
    </div>
  );
}
