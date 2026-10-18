/* Spanish (US) translations - batch D (text tools).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. Entries carry customComponent
   so the tool page renders the rich text-tool UI. */
export const TOOLS_ES_D = [
  {
    slug: 'contador-de-caracteres',
    enSlug: 'character-counter',
    lastReviewed: '2026-10-18',
    name: 'Contador de caracteres',
    tagline: 'Cuenta caracteres, palabras y líneas al instante - con medidores de límites por plataforma.',
    category: 'Herramientas de texto',
    badge: 'Ch',
    calcKey: 'textCharStats',
    customComponent: 'character-counter',
    inputs: [
      { key: 'text', label: 'Tu texto', type: 'textarea', default: '', rows: 6, placeholder: 'Escribe o pega tu texto aquí…' },
    ],
    metaTitle: 'Contador de Caracteres 2026: Cuenta Letras, Palabras y Límites [Gratis]',
    metaDescription:
      'Contador de caracteres gratis con conteo en vivo (con/sin espacios) y medidores de límites para X, biografía de Instagram y meta descripciones. Sin registro.',
    keywords: 'contador de caracteres, contar caracteres, contar caracteres online, contador de letras, contador de caracteres con espacios, character counter',
    explainer:
      'Un contador de caracteres responde una pregunta engañosamente simple - ¿qué tan largo es este texto, exactamente? - que importa cada vez que una plataforma impone un límite estricto. Pega o escribe en el cuadro de arriba y cada conteo se actualiza en vivo: caracteres con espacios, caracteres sin espacios, palabras y líneas. Los medidores por plataforma traducen el número bruto a los límites que de verdad te importan: una publicación de X/Twitter tiene un tope de 280 caracteres, una biografía de Instagram de 150, y Google trunca las meta descripciones alrededor de los 155. Verde significa que estás bien, ámbar que estás cerca, rojo que te pasaste.\n\n¿Por qué contar también sin espacios? Algunos sistemas de envío - portales de empleo, formularios de becas, campos de resúmenes - cuentan solo los caracteres sin espacios, y descubrirlo después de redactar es doloroso. Al contar puntos de código (y no unidades UTF-16), cada emoji cuenta como un carácter, igual que la mayoría de las plataformas modernas. La herramienta funciona por completo en tu navegador: nada de lo que escribes se sube ni se guarda, así que tus borradores y textos no publicados se quedan privados.\n\nLos redactores usan la estimación de tiempo de lectura para revisar artículos (200 palabras por minuto es el promedio estándar), los estudiantes verifican mínimos de ensayos y los community managers prueban publicaciones antes de publicarlas. Combínalo con el Contador de palabras para analizar densidad de palabras clave o con el Convertidor de mayúsculas para reformatear títulos sin reescribir.',
    faqs: [
      { q: '¿Cómo cuento caracteres con y sin espacios?', a: 'Pega tu texto en el contador de arriba - ambos números se actualizan en vivo. "Con espacios" es lo que aplican X/Twitter y la mayoría de las plataformas; "sin espacios" es lo que cuentan algunos formularios y portales.' },
      { q: '¿Cuál es el límite de caracteres de X (Twitter) en 2026?', a: 'Las publicaciones estándar están limitadas a 280 caracteres. El medidor de arriba muestra tu texto contra ese límite en tiempo real.' },
      { q: '¿Cuántos caracteres puede tener la biografía de Instagram?', a: '150 caracteres. El medidor de biografía de Instagram de arriba sigue tu texto en vivo.' },
      { q: '¿Qué tan larga debe ser una meta descripción?', a: 'Google suele truncar las meta descripciones alrededor de los 155–160 caracteres. Mantén la tuya por debajo de ~155 para que el mensaje completo aparezca en los resultados - el medidor usa 155.' },
      { q: '¿Los emojis cuentan como uno o dos caracteres?', a: 'Este contador cuenta puntos de código Unicode, así que cada emoji cuenta como un carácter - igual que la mayoría de las plataformas modernas (X, Instagram).' },
      { q: '¿Mi texto se sube a algún servidor?', a: 'No. Todo funciona localmente en tu navegador con JavaScript - tu texto nunca sale de tu dispositivo.' },
    ],
  },
  {
    slug: 'contador-de-palabras',
    enSlug: 'word-counter',
    lastReviewed: '2026-10-18',
    name: 'Contador de palabras',
    tagline: 'Cuenta palabras y caracteres, estima el tiempo de lectura y revisa la densidad de palabras clave.',
    category: 'Herramientas de texto',
    badge: 'Wo',
    calcKey: 'textWordStats',
    customComponent: 'word-counter',
    inputs: [
      { key: 'text', label: 'Tu texto', type: 'textarea', default: '', rows: 6, placeholder: 'Pega tu ensayo, artículo o publicación aquí…' },
    ],
    metaTitle: 'Contador de Palabras 2026: Cuenta Palabras Online al Instante [Gratis]',
    metaDescription:
      'Contador de palabras gratis: conteo de palabras y caracteres en vivo, estimación de tiempo de lectura y análisis de densidad de palabras clave. Sin registro.',
    keywords: 'contador de palabras, contar palabras, contador de palabras online, cuantas palabras tiene mi texto, tiempo de lectura, densidad de palabras clave',
    explainer:
      'El conteo de palabras es la restricción invisible detrás de casi toda la escritura: los ensayos piden mínimos, los blogs necesitan profundidad, los currículums piden brevedad y los discursos necesitan tiempo. Este contador de palabras actualiza cada cifra en el instante en que escribes - palabras, caracteres, oraciones y párrafos - más dos estimaciones de tiempo que los redactores usan de verdad: tiempo de lectura (al estándar de 200 palabras por minuto) y tiempo de narración (unas 150 palabras por minuto, el ritmo del habla natural).\n\nLa tabla de densidad de palabras clave es el ángulo SEO: elimina las palabras vacías comunes y muestra tus cinco términos más repetidos con su porcentaje sobre las palabras significativas. Un artículo informativo sano suele ubicar su palabra clave principal alrededor del 1–2%; mucho más alto se lee como relleno tanto para lectores como para buscadores. Los blogueros la usan como autoedición rápida antes de publicar: si un sinónimo que querías usar nunca aparece, quizá tu borrador no está diciendo lo que crees.\n\nLos estudiantes que verifican mínimos de ensayos deben notar que el contador divide por espacios, así que las palabras con guion cuentan como una y los números cuentan como palabras - igual que la mayoría de los procesadores de texto. Como cada herramienta de este sitio, funciona 100% en tu navegador: borradores no publicados, trabajo de clientes y escritura personal nunca salen de tu dispositivo.',
    faqs: [
      { q: '¿Cómo cuento las palabras de mi ensayo?', a: 'Pega el ensayo en el cuadro de arriba - el conteo de palabras se actualiza en vivo, junto con caracteres, oraciones y párrafos. Sin subir archivos ni registrarte.' },
      { q: '¿Cuál es una buena densidad de palabras clave para SEO?', a: 'Para la mayoría del contenido informativo, 1–2% para tu palabra clave principal es un rango seguro y natural. La tabla de densidad de arriba muestra tus cinco términos principales.' },
      { q: '¿Cómo se calcula el tiempo de lectura?', a: 'Palabras divididas entre 200 por minuto, el promedio estándar de lectura de un adulto. El tiempo de narración usa 150 palabras por minuto, el ritmo del habla natural.' },
      { q: '¿Cuántas palabras tiene un discurso de 5 minutos?', a: 'Unas 750 palabras a un ritmo natural de 150 ppm. Pega tu borrador arriba y revisa la estimación de tiempo de narración para medirlo con precisión.' },
      { q: '¿Mi texto se envía a un servidor?', a: 'No. Todo el análisis se ejecuta localmente en tu navegador - nada se sube, se guarda ni se registra.' },
    ],
  },
  {
    slug: 'convertidor-de-mayusculas',
    enSlug: 'case-converter',
    lastReviewed: '2026-10-18',
    name: 'Convertidor de mayúsculas',
    tagline: 'Convierte texto entre MAYÚSCULAS, minúsculas, Tipo Título, Tipo oración y más.',
    category: 'Herramientas de texto',
    badge: 'Aa',
    calcKey: 'textCaseStats',
    customComponent: 'case-converter',
    inputs: [
      { key: 'text', label: 'Tu texto', type: 'textarea', default: '', rows: 5, placeholder: 'Escribe o pega tu texto aquí…' },
      { key: 'mode', label: 'Convertir a', type: 'select', default: 'upper', options: [
        { value: 'upper', label: 'MAYÚSCULAS' },
        { value: 'lower', label: 'minúsculas' },
        { value: 'title', label: 'Tipo Título' },
        { value: 'sentence', label: 'Tipo oración' },
        { value: 'alternating', label: 'aLtErNaDo' },
        { value: 'inverse', label: 'InVeRsO' },
      ] },
    ],
    metaTitle: 'Convertidor de Mayúsculas 2026: a Minúsculas, Título y Más [Gratis]',
    metaDescription:
      'Convierte texto de mayúsculas a minúsculas, tipo título, tipo oración, alternado o inverso al instante. Con botón de copiar. Gratis.',
    keywords: 'convertidor de mayusculas, pasar texto a minusculas, convertir mayusculas a minusculas online, texto en mayusculas a minusculas, case converter',
    explainer:
      'Reformatear texto a mano es puro trabajo mecánico - este convertidor lo hace en un clic. Pega cualquier texto, elige un estilo y el resultado convertido aparece al instante con un botón de copiar listo. Las MAYÚSCULAS sirven para encabezados y siglas; las minúsculas normalizan texto pegado EN MAYÚSCULAS; el Tipo Título capitaliza cada palabra importante para titulares; el Tipo oración pone todo en minúsculas y capitaliza cada inicio de oración, la forma más rápida de arreglar un párrafo en mayúsculas.\n\nLos dos modos divertidos son el diferenciador que la mayoría de los convertidores no tiene: el modo aLtErNaDo alterna letra por letra (omitendo la puntuación para que el patrón quede limpio) para publicaciones con estilo, y el modo InVeRsO invierte la caja de cada letra - útil para arreglar texto escrito con Bloq Mayús activado. Todas las transformaciones entienden Unicode, así que los caracteres acentuados (é, ñ, ü) se convierten correctamente.\n\nTodo funciona localmente en tu navegador, con conteo de caracteres y palabras en vivo sobre el resultado - nada de lo que conviertes se sube a ningún servidor.',
    faqs: [
      { q: '¿Cómo paso un texto de mayúsculas a minúsculas?', a: 'Pega el texto arriba y elige "minúsculas" - el resultado aparece al instante. Usa el botón de copiar para tomarlo.' },
      { q: '¿Qué es el tipo título?', a: 'Un estilo donde la primera letra de cada palabra importante va en mayúscula, usado en titulares: "El Zorro Veloz". Elige "Tipo Título" arriba para aplicarlo.' },
      { q: '¿Qué es el tipo oración?', a: 'Capitalización normal de oración: todo en minúsculas excepto la primera letra de cada oración. Es el arreglo más rápido para texto escrito por accidente en mayúsculas.' },
      { q: '¿Qué es el texto alternado?', a: 'aLtErNaR mAyÚsCuLaS y MiNúScUlAs letra por letra, popular en redes sociales para dar énfasis con tono irónico. Esta herramienta alterna por letra omitiendo la puntuación.' },
      { q: '¿El convertidor respeta los acentos?', a: 'Sí - las transformaciones entienden Unicode, así que é, ñ, ü y otros caracteres acentuados se convierten correctamente en todos los modos.' },
      { q: '¿Mi texto se sube a un servidor?', a: 'No. La conversión ocurre por completo en tu navegador; tu texto nunca sale de tu dispositivo.' },
    ],
  },
];
