import { absUrl, SITE_NAME } from '@/lib/seo';

const PATH = '/privacy-policy';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const url = absUrl((isEs ? '/es' : '') + PATH);
  const altUrl = absUrl((isEs ? '' : '/es') + PATH);
  const title = isEs ? 'Política de privacidad' : 'Privacy Policy';
  const description = isEs
    ? `${SITE_NAME} política de privacidad: qué datos recopilamos, cómo funciona la publicidad y tus opciones.`
    : `${SITE_NAME} privacy policy: what data we collect, how ads work, and your choices.`;
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

export default async function PrivacyPage({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  if (isEs) {
    return (
      <div className="container">
        <div className="page-head" style={{ margin: '32px 0' }}>
          <h1>Política de privacidad</h1>
          <p className="lede">Última actualización: 30 de septiembre de 2026</p>
        </div>
        <div className="card prose">
          <h2>Resumen</h2>
          <p>
            {SITE_NAME} («nosotros») respeta tu privacidad. Esta política explica
            qué información recopilamos cuando usas nuestras calculadoras y
            artículos, y cómo se utiliza.
          </p>
          <h2>Datos que ingresas en las calculadoras</h2>
          <p>
            Los números que ingresas en nuestras calculadoras se procesan por
            completo en tu navegador web con JavaScript. Nunca se transmiten a
            nuestros servidores, ni se almacenan ni se comparten con nadie.
          </p>
          <h2>Información que recopilamos</h2>
          <p>
            No exigimos cuentas ni pedimos información personal. Como la mayoría
            de los sitios web, nuestro proveedor de alojamiento puede registrar
            datos técnicos básicos (como la dirección IP, el tipo de navegador y
            las páginas visitadas) por seguridad y diagnóstico.
          </p>
          <h2>Publicidad</h2>
          <p>
            Mostramos anuncios y enlaces patrocinados servidos por el socio
            externo stature nonsense (staturenonsense.com). El socio y sus
            proveedores de publicidad pueden usar cookies, información del
            dispositivo y tecnologías similares para ofrecer, medir y
            personalizar los anuncios. La recopilación y el uso de la información
            se rigen por sus propios términos de privacidad. Puedes gestionar las
            cookies desde la configuración de tu navegador; bloquearlas puede
            afectar las funciones publicitarias.
          </p>
          <h2>Cookies</h2>
          <p>
            Usamos cookies que pueden ser establecidas por socios publicitarios
            y, solo en el área de administración, una cookie de autenticación.
            Puedes desactivar las cookies en la configuración de tu navegador,
            aunque es posible que algunas funciones no funcionen.
          </p>
          <h2>Menores</h2>
          <p>
            Este sitio es un recurso general de educación financiera y no está
            dirigido a menores de 13 años. No recopilamos intencionalmente
            información de menores.
          </p>
          <h2>Cambios</h2>
          <p>
            Podemos actualizar esta política periódicamente. El uso continuado
            del sitio después de los cambios constituye la aceptación de la
            política actualizada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head" style={{ margin: '32px 0' }}>
        <h1>Privacy Policy</h1>
        <p className="lede">Last updated: September 30, 2026</p>
      </div>
      <div className="card prose">
        <h2>Overview</h2>
        <p>
          {SITE_NAME} ("we") respects your privacy. This policy explains what
          information we collect when you use our calculators and articles, and how
          it is used.
        </p>
        <h2>Calculator inputs</h2>
        <p>
          The numbers you enter into our calculators are processed entirely in your
          web browser using JavaScript. They are never transmitted to our servers,
          stored, or shared with anyone.
        </p>
        <h2>Information we collect</h2>
        <p>
          We do not require accounts and do not ask for personal information. Like
          most websites, our hosting provider may log basic technical data (such as
          IP address, browser type and pages visited) for security and diagnostics.
        </p>
        <h2>Advertising</h2>
        <p>
          We display advertisements and sponsored links served by the third-party
          partner stature nonsense (staturenonsense.com). The partner and its
          advertising providers may use cookies, device information, and similar
          technologies to deliver, measure, and personalize ads. Their collection
          and use of information is governed by their own privacy terms. You can
          manage cookies through your browser settings; blocking them may affect
          advertising features.
        </p>
        <h2>Cookies</h2>
        <p>
          We use cookies that may be set by advertising partners and, on the admin
          area only, an authentication cookie. You can disable
          cookies in your browser settings, though some features may not work.
        </p>
        <h2>Children</h2>
        <p>
          This site is a general-audience financial education resource and is not
          directed at children under 13. We do not knowingly collect information
          from children.
        </p>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. Continued use of the site
          after changes constitutes acceptance of the updated policy.
        </p>
      </div>
    </div>
  );
}
