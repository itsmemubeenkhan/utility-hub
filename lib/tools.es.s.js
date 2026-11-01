/* Spanish (US) translations - batch S (regex tester).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_S = [
  {
    slug: 'probador-de-regex',
    enSlug: 'regex-tester',
    lastReviewed: '2026-11-01',
    name: 'Probador de Regex',
    tagline: 'Prueba expresiones regulares de JavaScript en vivo: coincidencias resaltadas, inspección de grupos de captura, las seis banderas, biblioteca de patrones, vista previa de buscar y reemplazar y fragmento de código copiable, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Rx',
    calcKey: 'regexStats',
    customComponent: 'regex-tester',
    inputs: [],
    metaTitle: 'Probador de Regex Online Gratis: Prueba RegExp de JavaScript en Vivo',
    metaDescription:
      'Probador de regex gratis en línea: prueba expresiones regulares de JavaScript contra tu texto con coincidencias resaltadas en vivo, detalle de grupos de captura, banderas g/i/m/s/u/y, biblioteca de patrones comunes y vista previa de buscar y reemplazar. Corre 100% en tu navegador, nada se sube, sin registro.',
    keywords: 'probador de regex, probar regex online, tester de expresiones regulares, regex tester javascript, probar expresion regular, validador regex, expresiones regulares online',
    explainer:
      'Una expresión regular, o regex, es un patrón compacto que describe un conjunto de cadenas: \\d+ significa uno o más dígitos, \\w+@ significa uno o más caracteres de palabra seguidos de un arroba, y ^ ancla una coincidencia al inicio de una línea. Los desarrolladores usan regex para validar formularios, extraer correos de un texto, reescribir líneas de registro y renombrar archivos en lote. El problema es que un patrón que parece correcto a menudo coincide con lo incorrecto, o con nada, y la única forma de saberlo es ejecutarlo contra texto real. Eso es lo que hace un probador de regex: escribes el patrón, pegas el texto y cada coincidencia se ilumina al instante.\n\nEjemplo concreto: carga el ejemplo y el patrón (\\w+)@([\\w.-]+\\.[a-z]{2,}) corre contra un párrafo de contactos. Encuentra tres direcciones de correo, ada@example.com, regexkit@mail.co.uk y sales@shop-example.org, mientras ignora correctamente not-an-email@, que no tiene dominio. La tabla de coincidencias muestra por qué funcionó cada una: el grupo 1 guarda el usuario (ada, regexkit, sales) y el grupo 2 guarda el dominio (example.com, mail.co.uk, shop-example.org). Activa la bandera i y el mismo patrón empieza a aceptar direcciones en mayúsculas; quita la bandera g y solo se encuentra la primera dirección, que es exactamente como se comporta String.replace sin g.\n\nTres cosas hacen este probador más seguro que pegar patrones en un sitio cualquiera. Primero, todo corre localmente en tu navegador con el motor RegExp de JavaScript, el mismo motor que usan Node.js y todos los navegadores, así que un patrón que pasa aquí se comporta igual en tu código, y tu texto de prueba nunca se sube, guarda ni registra. Segundo, los patrones inválidos fallan con el mensaje de error del propio motor en lugar de no coincidir en silencio, lo que revela corchetes sin cerrar y cuantificadores malos al instante. Tercero, la tabla de coincidencias expone los grupos de captura, incluidos los grupos con nombre, para confirmar el orden de los grupos antes de publicar el patrón. Una advertencia honesta: los cuantificadores anidados como (a+)+ sobre entradas casi coincidentes pueden tardar un tiempo exponencial, un defecto llamado backtracking catastrófico, así que prueba patrones sospechosos contra tu entrada real más larga antes de desplegarlos. Combina este probador con el Formateador JSON, las herramientas Base64 y el Comparador de Textos del mismo grupo para desarrolladores.',
    faqs: [
      { q: '¿Cómo pruebo una expresión regular en línea?', a: 'Escribe tu patrón sin barras alrededor, elige las banderas y pega tu texto de prueba. Las coincidencias se resaltan al instante, y la tabla lista cada coincidencia con su índice y grupos de captura. Usa la biblioteca de patrones para partir de un patrón probado de correo, URL, teléfono o UUID.' },
      { q: '¿Qué variante de regex usa este probador?', a: 'JavaScript (ECMAScript), el motor integrado en todos los navegadores y Node.js. Los grupos con nombre, lookahead, lookbehind y escapes de propiedad Unicode con la bandera u funcionan. Las funciones solo de PCRE, como cuantificadores posesivos y grupos atómicos, no existen en JavaScript.' },
      { q: '¿Qué hacen las banderas g, i, m, s, u e y?', a: 'g encuentra todas las coincidencias en lugar de solo la primera; i ignora mayúsculas y minúsculas; m hace que ^ y $ coincidan con límites de línea en lugar de solo los límites del texto; s permite que . acepte saltos de línea; u activa el modo Unicode completo y los escapes \\p{...}; y (sticky) solo coincide en la posición lastIndex actual sin buscar más adelante.' },
      { q: '¿Cómo funcionan los grupos de captura?', a: 'Los paréntesis capturan parte de una coincidencia: en (\\w+)@(\\w+), el grupo 1 es el usuario y el grupo 2 es el dominio. Los grupos con nombre usan la sintaxis (?<nombre>...) y aparecen en la columna de grupos con nombre. La coincidencia completa es siempre el grupo 0, mostrada en la columna de coincidencia.' },
      { q: '¿Por qué mi regex no coincide con nada?', a: 'Las causas habituales son una bandera faltante (sin g solo se encuentra la primera coincidencia), un carácter especial que necesita escape (un punto literal es \\., un . solo acepta cualquier carácter) y ^ o $ sin la bandera m en texto multilínea. El probador muestra el error del motor para patrones inválidos, así que un error de sintaxis se detecta fácil.' },
      { q: '¿Mi texto de prueba se sube o se guarda?', a: 'No. La comparación, la vista previa de reemplazo y la generación del fragmento corren localmente en tu navegador sin viaje al servidor, sin cuenta y sin almacenamiento. Cerrar la página descarta todo lo que escribiste, lo que también hace seguro probar patrones contra líneas de registro reales.' },
    ],
  },
];
