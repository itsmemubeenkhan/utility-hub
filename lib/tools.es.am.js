/* Spanish (US) translations - batch AM (Readability Checker).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AM = [
  {
    slug: 'comprobador-de-legibilidad',
    enSlug: 'readability-checker',
    lastReviewed: '2026-11-21',
    name: 'Comprobador de Legibilidad',
    tagline: 'Comprueba qué tan fácil es leer tu texto: seis fórmulas a la vez (Flesch, Flesch-Kincaid, Niebla de Gunning, SMOG, Coleman-Liau, ARI), conteos en vivo, un mapa de oraciones largas y una revisión por público objetivo. 100% privado, nada se sube.',
    category: 'Herramientas de texto',
    badge: 'RC',
    calcKey: 'readabilityStats',
    customComponent: 'readability-checker',
    inputs: [
      { key: 'text', label: 'Tu texto', type: 'textarea', default: '', rows: 6, placeholder: 'Pega tu ensayo, artículo o publicación aquí…' },
    ],
    metaTitle: 'Comprobador de Legibilidad Gratis: Puntuación Flesch y Nivel de Grado [Sin Registro]',
    metaDescription:
      'Comprobador de legibilidad gratis: puntuación de Facilidad de lectura de Flesch, nivel de grado, Niebla de Gunning, SMOG, Coleman-Liau y ARI en un solo lugar. Pega texto y obtén seis fórmulas en vivo. Sin registro.',
    keywords: 'comprobador de legibilidad, facilidad de lectura flesch, nivel de grado flesch kincaid, indice gunning fog, smog legibilidad, coleman liau, indice de legibilidad automatizado, comprobar legibilidad de un texto, fernandez huerta, szigriszt pazos',
    explainer:
      'Una puntuación de legibilidad responde una pregunta: qué tan difícil es leer este texto. Este comprobador aplica seis fórmulas clásicas a la vez sobre el mismo texto, para que veas dónde coinciden y dónde no. La Facilidad de lectura de Flesch da una puntuación de 0 a 100 donde más alto significa más fácil, el Nivel de grado Flesch-Kincaid traduce ese mismo texto a un grado escolar de EE. UU., la Niebla de Gunning estima los años de escolaridad necesarios para entenderlo, SMOG hace lo mismo a partir de palabras polisilábicas, Coleman-Liau trabaja con letras en lugar de sílabas, y el Índice de legibilidad automatizado (ARI) usa caracteres por palabra. Como cada fórmula pesa la longitud de forma distinta, un texto corto con palabras largas puede salir fácil en una y difícil en otra, y ver las seis juntas es la imagen honesta.\n\nPega o escribe tu texto, o sube un archivo .txt, y cada número se actualiza en vivo mientras escribes. El panel de conteos muestra palabras, oraciones, sílabas y caracteres, además del promedio de palabras por oración, el promedio de sílabas por palabra y las palabras complejas de tres o más sílabas. El mapa de oraciones lista cada oración de más de 25 palabras, hasta diez, y al hacer clic en una se resalta en tu texto para que puedas dividirla en el momento. Elige un público objetivo, público general, escuela, universidad o técnico, y el comprobador te dice si tu texto está en el objetivo o cuántos niveles de grado está por encima o por debajo. Un botón de copiar pone un resumen en texto simple de todas las puntuaciones en tu portapapeles.\n\nLas sílabas se cuentan con una heurística de grupos vocálicos que maneja la e final muda y las terminaciones en -ed, así que los conteos son estimaciones, y los textos cortos mueven las fórmulas más que los largos: busca al menos 100 palabras antes de confiar en un nivel de grado. Las fórmulas en inglés se crearon para el inglés, así que para un texto en español las fórmulas en las que debes confiar son las españolas de esta página: Fernández-Huerta y Szigriszt-Pazos, hechas para el español. Todo corre en tu navegador y tu texto nunca sale de tu dispositivo. Si necesitas los conteos básicos primero, el Contador de palabras da palabras y tiempo de lectura, el Contador de caracteres sigue los límites de publicaciones y biografías, el Convertidor de mayúsculas corrige las mayúsculas, y el Convertidor de Markdown a HTML convierte un borrador terminado en HTML listo para publicar.',
    faqs: [
      { q: '¿Cuál es una buena puntuación de Facilidad de lectura de Flesch?', a: 'Para el público general, de 60 a 70 es inglés estándar y de 70 a 80 es bastante fácil, el rango al que apuntan la mayoría de blogs y artículos de noticias. Más de 80 se lee como fácil, de 50 a 60 es bastante difícil, y menos de 30 es muy difícil, típico de la escritura académica o legal. Elige un público objetivo arriba y el comprobador juzga tu texto contra ese objetivo.' },
      { q: '¿Qué significa el Nivel de grado Flesch-Kincaid?', a: 'Traduce tu texto al grado escolar de EE. UU. necesario para entenderlo. Grado 8 significa que un joven típico de 13 a 14 años puede leerlo con comodidad, grado 12 es nivel de graduado de secundaria, y grado 16 es nivel de graduado universitario. La mayoría de la escritura para el público apunta al grado 7 a 9.' },
      { q: '¿Por qué las seis fórmulas dan puntuaciones distintas?', a: 'Porque miden cosas distintas. Flesch y Flesch-Kincaid usan sílabas por palabra, Niebla de Gunning y SMOG cuentan palabras polisilábicas, Coleman-Liau usa letras por palabra, y ARI usa caracteres por palabra. Un texto con palabras cortas en oraciones largas puntúa distinto que uno con palabras largas en oraciones cortas, así que la diferencia entre fórmulas es normal e informativa.' },
      { q: '¿Cómo se cuentan las sílabas?', a: 'Con una heurística de grupos vocálicos: cada grupo de vocales suele marcar una sílaba, con ajustes para una e final muda (make es una sílaba) y una terminación -ed muda (walked es una sílaba, wanted conserva dos). Es una estimación, no una consulta de diccionario, así que las palabras poco comunes pueden fallar por una sílaba. Las fórmulas toleran pequeños errores de conteo en textos largos.' },
      { q: '¿Qué tan largo debe ser mi texto para una puntuación precisa?', a: 'Al menos 100 palabras. Las fórmulas dividen entre palabras y oraciones, así que una sola oración o unas pocas palabras pueden dar puntuaciones extremas, incluso por encima de 100 o por debajo de cero. Pega un párrafo completo o un artículo entero para un nivel de grado en el que puedas confiar.' },
      { q: '¿Mi texto se sube a algún servidor?', a: 'No. Todo el análisis corre localmente en tu navegador, incluida la subida de archivos, y nada se guarda ni se registra. Puedes revisar borradores largos, trabajo de clientes o textos no publicados con seguridad.' },
    ],
  },
];
