/* Spanish (US) translations - batch AD (HTML to Text Converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AD = [
  {
    slug: 'convertidor-de-html-a-texto',
    enSlug: 'html-to-text-converter',
    lastReviewed: '2026-11-12',
    name: 'Convertidor de HTML a Texto',
    tagline: 'Convierte HTML a texto plano online gratis: quita las etiquetas, conserva encabezados, párrafos, listas y tablas legibles, decodifica entidades y conserva las URLs de los enlaces y el texto alt de las imágenes. 100% en tu navegador, sin registro.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Ht',
    calcKey: 'htmlToTextStats',
    customComponent: 'htmltotext-convert',
    inputs: [],
    metaTitle: 'Convertidor de HTML a Texto Online Gratis: Quita Etiquetas [Sin Registro]',
    metaDescription:
      'Convertidor de HTML a texto gratis online: convierte HTML en texto plano limpio en tu navegador, con listas, tablas, URLs de enlaces y texto alt. Extracción segura, sin subidas, sin registro.',
    keywords: 'convertidor de html a texto, convertir html a texto, html a texto plano, quitar etiquetas html online, html a texto gratis, extraer texto de html, html a txt, eliminar etiquetas html',
    explainer:
      'Un convertidor de HTML a texto toma una página web o un fragmento de código y devuelve solo las palabras que leería una persona, sin las etiquetas, los scripts ni los estilos que las rodean. Eso sirve cuando el formato estorba: sacar el texto de una página copiada para un documento, limpiar un correo HTML en una nota plana, comprobar lo que realmente ve un buscador o un lector de pantalla, o preparar contenido para una herramienta que solo acepta texto plano. Pega tu HTML aquí, o sube un archivo .html, y el texto legible aparece al instante con conteos de caracteres, palabras y líneas.\n\nEl conversor se construye sobre cómo lee una página el navegador, no sobre borrar corchetes angulares. Los elementos de bloque como párrafos, encabezados, divs y secciones empiezan en líneas nuevas, y los párrafos y encabezados se separan con una línea en blanco, así el texto conserva la forma de la página original. Las listas sin orden reciben viñetas y las listas ordenadas reciben números, con las listas anidadas sangradas, y las filas de las tablas caen en líneas nuevas con sus celdas separadas por tabulaciones, así el resultado se pega limpio en una hoja de cálculo o un documento. Los saltos de línea se convierten en saltos reales, y el contenido de los bloques pre conserva su espaciado exacto, porque ese espaciado es parte del texto.\n\nLa seguridad es parte del diseño: la entrada se trata como texto inerte, así los scripts nunca se ejecutan y nada se descarga, y el contenido de los elementos script, style y head se descarta antes de mostrar ningún texto. Las entidades HTML se decodifican, así &amp; se convierte en &, &copy; en © y las entidades numéricas en sus caracteres reales. Tres opciones cubren las decisiones habituales: mostrar las URLs de los enlaces como "texto (https://...)" para que una copia impresa siga diciendo adónde apuntan los enlaces, conservar el texto alt de las imágenes como [texto alt] para que la descripción de una imagen sobreviva, y poner los encabezados en mayúsculas para documentos que lo necesiten. Tu HTML nunca sale de tu dispositivo, y el resultado se puede copiar o descargar como archivo .txt.',
    faqs: [
      { q: '¿Cómo convierto HTML a texto online?', a: 'Pega tu HTML en el cuadro de entrada, o sube un archivo .html o .htm. El texto plano aparece al instante, con conteos en vivo de caracteres, palabras y líneas y el número de etiquetas quitadas. Copia el resultado o descárgalo como texto.txt. Nada se sube: la conversión corre en tu navegador.' },
      { q: '¿Es seguro pegar HTML con scripts en el conversor?', a: 'Sí. El conversor trata tu entrada como texto inerte: nunca ejecuta scripts, nunca descarga imágenes ni hojas de estilo, y descarta el contenido de los elementos script, style y head antes de mostrar ningún texto. Es seguro para páginas aún no publicadas.' },
      { q: '¿Cómo se manejan las listas y las tablas?', a: 'Los elementos de listas sin orden reciben viñetas y los de listas ordenadas reciben números, con las listas anidadas sangradas dos espacios por nivel. Las filas de las tablas van en líneas separadas y sus celdas se separan con tabulaciones, así la salida se pega bien en una hoja de cálculo o un documento de texto.' },
      { q: '¿Qué pasa con los enlaces y las imágenes?', a: 'Por defecto, los enlaces conservan su texto y agregan la URL entre paréntesis, como "Ejemplo (https://example.com)", y las imágenes conservan su texto alt entre corchetes, como [Logo de la empresa]. Ambas opciones se pueden desactivar si solo quieres las palabras visibles.' },
      { q: '¿Se decodifican las entidades HTML?', a: 'Sí. Las entidades con nombre como &amp;, &copy; y &mdash; se convierten en sus caracteres reales, y también las entidades numéricas como &#169; y &#x2014;. Un espacio de no separación se convierte en un espacio normal, así las palabras nunca se unen ni se parten de forma rara.' },
      { q: '¿Puedo convertir un archivo HTML completo a un archivo .txt?', a: 'Sí. Sube un archivo .html o .htm, o pega una página completa, y descarga el resultado como texto.txt con el botón de descarga. La herramienta no tiene límite de tamaño de archivo, pero las páginas muy grandes pueden tardar un momento en procesarse en tu navegador.' },
    ],
  },
];
