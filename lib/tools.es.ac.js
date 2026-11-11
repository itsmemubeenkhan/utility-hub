/* Spanish (US) translations - batch AC (HTML Minifier).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AC = [
  {
    slug: 'minificador-de-html',
    enSlug: 'html-minifier',
    lastReviewed: '2026-11-11',
    name: 'Minificador de HTML',
    tagline: 'Minifica HTML online gratis: quita comentarios y espacios, elimina etiquetas opcionales, acorta atributos y embellece HTML minificado para leerlo de nuevo. 100% en tu navegador, sin registro.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Hm',
    calcKey: 'htmlMinifierStats',
    customComponent: 'htmlmin-minify',
    inputs: [],
    metaTitle: 'Minificador de HTML Online Gratis: Minifica Código HTML [Sin Registro]',
    metaDescription:
      'Minificador de HTML gratis online: minifica código HTML en tu navegador, quita comentarios y espacios, elimina etiquetas opcionales y embellece HTML minificado. 100% privado, sin registro.',
    keywords: 'minificador de html, minificar html online, minificador html gratis, comprimir html, minificar codigo html, embellecedor de html, formatear html online, compresor html',
    explainer:
      'Un minificador de HTML reduce una página quitando todo lo que el navegador no necesita para mostrarla: comentarios, sangría, saltos de línea y caracteres redundantes. La página se ve exactamente igual, pero el archivo es más pequeño, se descarga antes y se analiza más rápido, algo que se nota sobre todo en conexiones móviles lentas, donde cada kilobyte retrasa la primera pintura. Pega tu código aquí, o sube un archivo .html, y la versión minificada aparece al instante con el conteo de bytes antes y después y el porcentaje ahorrado.\n\nEste minificador es un pequeño escáner que entiende HTML, no un reemplazo de texto a ciegas. Quita comentarios, colapsa espacios, elimina etiquetas de cierre que la especificación de HTML dice que son opcionales, acorta atributos booleanos como checked="checked" a checked, y quita las comillas de los atributos solo cuando el valor es seguro sin ellas, así las URLs conservan sus comillas. Lo que nunca toca es igual de importante: el contenido de los elementos pre, textarea, script y style pasa intacto, porque el espacio dentro de un bloque pre es texto visible y un carácter fuera de lugar dentro de un script puede romper la página, y los comentarios condicionales para versiones antiguas de Internet Explorer se conservan. El espacio entre dos elementos en línea también se conserva, porque <b>Hola</b> <i>mundo</i> lo necesita para seguir siendo dos palabras.\n\nEl modo embellecer hace lo contrario: convierte un archivo minificado en HTML legible con sangría, un elemento de bloque por línea, útil cuando heredas una plantilla aplastada de una exportación de CMS o del código fuente de una página y necesitas leerla. El CSS y el JavaScript en línea se dejan como están, así que pásalos primero por el Minificador de CSS y el Minificador de JavaScript si también necesitan achicarse. Una herramienta de compilación suele ahorrar más en un proyecto completo, porque también maneja archivos enlazados y mapas de origen, pero para una sola página o fragmento esta herramienta es más rápida: sin instalación, sin configuración, sin subidas. Ten en cuenta que los tamaños reales de transferencia serán aún menores cuando el servidor aplique gzip o Brotli, así que el porcentaje que se muestra aquí es el ahorro bruto antes de la compresión. Tu código nunca sale de tu dispositivo.',
    faqs: [
      { q: '¿Cómo minifico HTML online?', a: 'Pega tu HTML en el cuadro de entrada, o sube un archivo .html o .htm. La versión minificada aparece al instante, con el conteo de bytes antes y después y el porcentaje ahorrado. Copia el resultado o descárgalo como page.min.html. Nada se sube: la minificación corre en tu navegador.' },
      { q: '¿Minificar puede romper mi página?', a: 'No. El minificador solo quita cosas que el navegador no necesita para mostrar la página: comentarios, espacios entre etiquetas de bloque, etiquetas de cierre opcionales y caracteres redundantes en atributos. El contenido de los elementos pre, textarea, script y style se conserva intacto, y el espacio entre dos elementos en línea se mantiene para que las palabras nunca se unan. Prueba siempre el resultado en un navegador antes de reemplazar un archivo en vivo, sobre todo en correos HTML, donde algunos clientes antiguos son sensibles a los espacios.' },
      { q: '¿Qué quita exactamente el minificador?', a: 'Comentarios (salvo los condicionales), espacios y saltos de línea entre etiquetas de bloque, etiquetas de cierre opcionales como </html>, </head>, </body>, </p> y </li> donde la especificación lo permite, comillas en valores de atributo seguros sin ellas, y valores de atributos booleanos (checked="checked" se convierte en checked). Cada paso se puede desactivar.' },
      { q: '¿Cuál es la diferencia entre minificar y embellecer?', a: 'Minificar quita comentarios, espacios y caracteres redundantes para que el archivo sea lo más pequeño posible para transferirlo. Embellecer agrega saltos de línea y sangría para que el HTML minificado sea fácil de leer y editar. Ambas mantienen la página idéntica: solo cambian los espacios y el formato.' },
      { q: '¿Minifica el CSS y el JavaScript dentro de mi página?', a: 'No. El contenido de los elementos style y script se conserva exactamente como está escrito, porque cambiarlo a ciegas puede romper una página. Para achicarlos, pasa el CSS por el Minificador de CSS y el JavaScript por el Minificador de JavaScript, y luego pega los resultados de vuelta en tu página.' },
      { q: '¿Mi HTML se sube a algún lado?', a: 'No. La minificación y el embellecimiento corren localmente en tu navegador. Tu código nunca se sube, se guarda ni lo ve nadie más, así que la herramienta es segura para páginas y plantillas sin publicar, aunque igual conviene no pegar secretos reales donde no hace falta.' },
    ],
  },
];
