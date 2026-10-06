import { absUrl, SITE_NAME } from '@/lib/seo';

const PATH = '/terms';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl((isEs ? '/es' : '') + PATH);
  const altUrl = absUrl((isEs ? '' : '/es') + PATH);
  const title = isEs ? 'Términos de uso' : 'Terms of Use';
  const description = isEs
    ? `${SITE_NAME} términos de uso: uso aceptable, descargos de responsabilidad y limitaciones.`
    : `${SITE_NAME} terms of use: acceptable use, disclaimers and limitations.`;
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

export default async function TermsPage({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  if (isEs) {
    return (
      <div className="container">
        <div className="page-head" style={{ margin: '32px 0' }}>
          <h1>Términos de uso</h1>
          <p className="lede">Última actualización: 30 de septiembre de 2026</p>
        </div>
        <div className="card prose">
          <h2>Aceptación</h2>
          <p>
            Al acceder a {SITE_NAME} aceptas estos términos. Si no estás de
            acuerdo, por favor no uses el sitio.
          </p>
          <h2>Solo con fines educativos: no es asesoramiento financiero</h2>
          <p>
            Todas las calculadoras, artículos y cifras de este sitio se ofrecen
            únicamente con fines generales de educación y planificación. Son
            estimaciones, no asesoramiento financiero, fiscal, legal ni de
            inversión. Consulta siempre a un profesional calificado antes de tomar
            decisiones financieras. No garantizamos la precisión, integridad ni
            idoneidad para tu situación.
          </p>
          <h2>Uso aceptable</h2>
          <p>
            Puedes usar las calculadoras y los artículos para fines personales no
            comerciales. Aceptas no hacer un uso indebido del sitio, no intentar
            interrumpirlo ni extraer su contenido a ritmos abusivos.
          </p>
          <h2>Propiedad intelectual</h2>
          <p>
            El contenido, el diseño y el código del sitio pertenecen a {SITE_NAME}
            salvo que se indique lo contrario. Puedes enlazar a nuestras páginas
            y citar breves extractos con atribución.
          </p>
          <h2>Limitación de responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley, {SITE_NAME} no se hace
            responsable de las decisiones tomadas ni de las acciones realizadas
            con base en la información de este sitio.
          </p>
          <h2>Cambios</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. El uso
            continuado del sitio después de los cambios constituye aceptación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Terms of Use</h1>
        <p className="lede">Last updated: September 30, 2026</p>
      </div>
      <div className="card prose">
        <h2>Acceptance</h2>
        <p>
          By accessing {SITE_NAME} you agree to these terms. If you do not agree,
          please do not use the site.
        </p>
        <h2>Educational purpose only: not financial advice</h2>
        <p>
          All calculators, articles and figures on this site are provided for
          general educational and planning purposes only. They are estimates, not
          financial, tax, legal or investment advice. Always consult a qualified
          professional before making financial decisions. We make no guarantees
          about accuracy, completeness or suitability for your situation.
        </p>
        <h2>Acceptable use</h2>
        <p>
          You may use the calculators and articles for personal, non-commercial
          purposes. You agree not to misuse the site, attempt to disrupt it, or
          scrape its content at abusive rates.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Site content, design and code are owned by {SITE_NAME} unless otherwise
          noted. You may link to our pages and quote brief excerpts with attribution.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE_NAME} is not liable for any
          decisions made or actions taken based on information on this site.
        </p>
        <h2>Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the site after
          changes constitutes acceptance.
        </p>
      </div>
    </div>
  );
}
