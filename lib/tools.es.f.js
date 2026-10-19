/* Spanish (US) translations - batch F (developer tools).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. Entries carry customComponent
   so the tool page renders the rich dev-tool UI. */
export const TOOLS_ES_F = [
  {
    slug: 'formateador-json',
    enSlug: 'json-formatter',
    lastReviewed: '2026-10-19',
    name: 'Formateador y Validador JSON',
    tagline: 'Dale formato, minifica, valida y explora JSON en tu navegador: con vista de árbol, ubicación exacta de errores y JSON a CSV.',
    category: 'Herramientas para desarrolladores',
    badge: 'Js',
    calcKey: 'jsonStats',
    customComponent: 'json-formatter',
    inputs: [],
    metaTitle: 'Formateador y Validador JSON 2026: Formatea y Minifica Online [Gratis]',
    metaDescription:
      'Formateador y validador JSON gratis: embellece, minifica, valida con la ubicación exacta del error, vista de árbol y exportación JSON a CSV. Sin registro, 100% en tu navegador.',
    keywords: 'formateador json, validador json, formatear json online, minificar json, json a csv, visor json, json bonita',
    explainer:
      'JSON es el idioma que hablan las APIs, pero el JSON crudo de una respuesta real es una sola línea imposible de leer. Un formateador JSON toma ese bloque denso y lo reindenta con saltos de línea para que la estructura sea visible de un vistazo. Pega cualquier JSON en la herramienta de arriba y presiona Formatear: los objetos anidados se indentan, los arreglos se apilan y los corchetes desaparecidos dejan de ser un misterio.\n\nLa validación es la parte que ahorra horas. Una coma de más, una coma que falta o una comilla perdida producen errores que un editor de texto normal jamás encontrará por ti. Este validador procesa con el propio motor JSON del navegador e informa la línea y columna exactas donde falla el análisis, más el mensaje de error original, para que saltes directo al punto roto. Usa Minificar cuando necesites reducir un payload para el cuerpo de una petición o un archivo de configuración: elimina cada espacio y salto de línea innecesario con un clic.\n\nLa vista de árbol es la forma más rápida de explorar respuestas profundas de APIs. Cada objeto y arreglo se colapsa a un resumen de una línea, así puedes bajar exactamente a la rama que te interesa sin desplazarte por miles de líneas. Las fichas de estadísticas muestran la profundidad, el total de claves y el conteo de valores de un vistazo, útil para dimensionar una respuesta desconocida. Y si la respuesta es una lista de registros, JSON a CSV la convierte en un archivo listo para hoja de cálculo: fila de encabezados más una fila por objeto, con comillado correcto.\n\nTodo ocurre localmente en tu navegador con el mismo analizador JSON que usan tus aplicaciones. Nada de lo que pegas se sube, se registra ni se almacena, así que es seguro formatear respuestas de API con datos de prueba. El botón de copiar pone el resultado en tu portapapeles con un clic, y Descargar lo guarda como archivo .json (o .csv tras una conversión). Combínalo con el Generador de UUID cuando necesites identificadores frescos para tus payloads de prueba, y el Generador de contraseñas para claves de API y secretos.',
    faqs: [
      { q: '¿Cómo le doy formato bonito a un JSON online?', a: 'Pega tu JSON en el cuadro de arriba y presiona Formatear. La herramienta lo reindenta con sangría de 2 espacios y saltos de línea. Si el JSON es inválido, te dice la línea y columna exactas del error.' },
      { q: '¿Por qué mi JSON no pasa la validación?', a: 'Las causas más comunes son comas finales ({"a": 1,} es inválido), comillas simples en vez de dobles, claves sin comillas o un corchete de cierre faltante. El validador de arriba señala la línea y columna exactas donde se rompe el análisis.' },
      { q: '¿Qué es minificar JSON y cuándo lo uso?', a: 'Minificar elimina todo el espacio innecesario (espacios, saltos de línea, sangrías) del JSON. Úsalo para reducir payloads antes de pegarlos en cuerpos de peticiones API, archivos de configuración o URLs: cada byte cuenta en la red.' },
      { q: '¿Cómo convierto JSON a CSV?', a: 'Si tu JSON es un arreglo de objetos con claves consistentes (típico de endpoints de listas), presiona JSON a CSV. La herramienta crea una fila de encabezados con todas las claves y una fila por objeto, entrecomillando correctamente los valores con comas o comillas. Los objetos anidados se conservan como cadenas JSON compactas dentro de su celda.' },
      { q: '¿Para qué sirve la vista de árbol?', a: 'La vista de árbol muestra tu JSON como un esquema colapsable: cada objeto y arreglo se reduce a un resumen de una línea que puedes expandir. Es la forma más rápida de navegar respuestas grandes de APIs sin desplazarte por miles de líneas.' },
      { q: '¿Es seguro pegar respuestas de API o tokens en un formateador JSON online?', a: 'En esta página, sí en lo que respecta a la herramienta: todo corre localmente en tu navegador con el analizador JSON nativo, y nada se sube, se registra ni se almacena. Como regla general, evita pegar secretos reales de producción en cualquier herramienta web en la que no confíes.' },
    ],
  },
  {
    slug: 'generador-de-uuid',
    enSlug: 'uuid-generator',
    lastReviewed: '2026-10-19',
    name: 'Generador de UUID',
    tagline: 'Genera UUIDs v4 (RFC 4122) en masa: criptográficamente seguros, modos mayúsculas y sin guiones, copia o descarga.',
    category: 'Herramientas para desarrolladores',
    badge: 'Uu',
    calcKey: 'uuidStats',
    customComponent: 'uuid-generator',
    inputs: [],
    metaTitle: 'Generador de UUID 2026: UUIDs v4 en Masa Online [Gratis, Sin Registro]',
    metaDescription:
      'Generador de UUID gratis: genera UUIDs v4 (RFC 4122) en masa (1 a 500) con aleatoriedad criptográficamente segura. Modos mayúsculas y sin guiones, copia o descarga. Sin registro.',
    keywords: 'generador de uuid, generar uuid online, uuid v4, generador de uuid masivo, generador guid, uuid aleatorio',
    explainer:
      'Un UUID (identificador universalmente único) es un valor de 128 bits escrito como 36 caracteres, por ejemplo 550e8400-e29b-41d4-a716-446655440000. Los UUIDs versión 4 se generan a partir de bits aleatorios, lo que hace las colisiones tan improbables que puedes repartirlos como claves primarias de bases de datos, IDs de pedidos, tokens de API o identificadores de prueba sin coordinarte con nadie. Presiona Generar y obtienes 10 por defecto; cambia la cantidad hasta 500 para datos de prueba en masa.\n\nDos opciones cubren las necesidades comunes de formato. El modo mayúsculas muestra los dígitos A-F en mayúsculas para sistemas que lo esperan, y el modo sin guiones elimina los cuatro guiones para producir la forma compacta de 32 caracteres que algunas APIs y bases de datos prefieren. Cada UUID se produce con crypto.randomUUID(), la fuente aleatoria criptográficamente segura del navegador, no el predecible Math.random(), así que sirven como identificadores no adivinables.\n\nEl modo masivo es el gancho de esta herramienta. Llenar una base de datos de prueba, escribir pruebas de integración o generar 500 IDs de pedido de ejemplo toma un clic, y luego Copiar todos o Descargar .txt entrega la lista a tu script o archivo de migración. Combínalo con el Formateador JSON cuando necesites incrustar IDs frescos en payloads de prueba: todo corre localmente en tu navegador y nada se sube ni se almacena.',
    faqs: [
      { q: '¿Qué es un UUID?', a: 'Un UUID (identificador universalmente único) es un valor de 128 bits escrito como 36 caracteres, por ejemplo 550e8400-e29b-41d4-a716-446655440000. Los UUIDs versión 4 se generan con bits aleatorios y se usan como claves primarias de bases de datos, IDs de pedidos, tokens de API e identificadores de prueba.' },
      { q: '¿Estos UUIDs son realmente aleatorios?', a: 'Sí. Se generan con crypto.randomUUID(), la fuente aleatoria criptográficamente segura del navegador, no el predecible Math.random(). Eso los hace aptos como identificadores no adivinables.' },
      { q: '¿Cuál es la diferencia entre UUID y GUID?', a: 'Son el mismo formato de 128 bits. GUID (identificador globalmente único) es simplemente el nombre que Microsoft le da a un UUID. Un UUID v4 de esta herramienta funciona en cualquier lugar donde se acepte un GUID.' },
      { q: '¿Uso UUIDs en mayúsculas o minúsculas?', a: 'El estándar no lo exige, pero elige una forma y manténla. Las minúsculas son la convención común en APIs JSON y URLs; algunos sistemas heredados y bases de datos esperan mayúsculas. La herramienta tiene un modo mayúsculas de un clic.' },
      { q: '¿Por qué quitaría los guiones?', a: 'Algunas APIs, bases de datos y esquemas de URL esperan la forma compacta de 32 caracteres sin guiones. El modo sin guiones los elimina por ti; el valor identifica el mismo UUID de cualquier forma.' },
      { q: '¿Pueden colisionar dos UUIDs?', a: 'En la práctica, no. Con 122 bits aleatorios, tendrías que generar unos 2.7 trillones de billones de UUIDs para llegar a un 50% de probabilidad de una sola colisión. Para uso cotidiano, la unicidad está efectivamente garantizada.' },
    ],
  },
];
