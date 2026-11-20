/* Spanish (US) translations - batch AL (XML to JSON Converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AL = [
  {
    slug: 'convertidor-de-xml-a-json',
    enSlug: 'xml-to-json-converter',
    lastReviewed: '2026-11-20',
    name: 'Convertidor de XML a JSON',
    tagline: 'Convierte XML a JSON en tu navegador: pega XML o sube un archivo .xml y obtén JSON en vivo con el estilo de atributos, la clave de texto, quitar la raíz, inferencia de tipos, sangría y manejo de espacios de nombres que elijas, además de errores exactos de línea y columna. 100% privado, nada se sube.',
    category: 'Herramientas de Desarrollo',
    badge: 'XJ',
    calcKey: 'xmlToJsonStats',
    customComponent: 'xmltojson-converter',
    inputs: [],
    metaTitle: 'Convertidor de XML a JSON Gratis en Línea [Sin Registro]',
    metaDescription:
      'Convertidor de XML a JSON gratis: pega XML o sube un archivo .xml y obtén JSON en vivo con estilo de atributos, quitar la raíz, inferencia de tipos y posiciones exactas de error. 100% en tu navegador, sin registro.',
    keywords: 'convertidor de xml a json, convertir xml a json, xml a json online, xml a json gratis, convertidor xml json, convertir archivo xml a json, analizador xml online',
    explainer:
      'Convertir XML a JSON significa transformar un árbol de elementos en objetos anidados. Cada elemento se convierte en un objeto JSON, o en una cadena simple cuando solo tiene texto. Los atributos se convierten en claves @nombre, el contenido de texto va bajo la clave #text, y los elementos hermanos repetidos se convierten en un arreglo, así tres elementos <book> se vuelven un solo arreglo book con tres entradas. Las secciones CDATA se convierten en texto simple aunque contengan caracteres que parecen marcado, las referencias de entidad como &amp; se decodifican de vuelta a sus caracteres, y los comentarios se revisan para verificar la buena formación pero nunca aparecen en el JSON, porque JSON no tiene sintaxis de comentarios para guardarlos.\n\nCada convertidor toma estas decisiones de mapeo por ti, y este te deja tomarlas tú mismo. Elige el estilo de atributos: claves @nombre junto a los datos del elemento, o un solo objeto @attributes agrupado. Renombra la clave de texto si tu API espera algo distinto de #text. Quita el elemento raíz cuando solo necesites su contenido, activa la inferencia de tipos para que 29.99 se vuelva número y true se vuelva booleano (los valores quedan como cadenas por defecto, y 007 queda como cadena de cualquier modo, porque un cero inicial indica que el valor es un código, no un número), y conserva o quita los prefijos de espacio de nombres como ns: en los nombres de elementos y atributos. También puedes elegir salida JSON con sangría de 2 espacios, 4 espacios o minificada. Cuando el XML está mal formado, el error indica la línea y la columna exactas además de qué salió mal, así una etiqueta de cierre que no coincide o un & solo se arregla en un minuto.\n\nTodo corre en tu navegador: pega XML o sube un archivo .xml o .txt, copia el JSON o descárgalo como archivo .json, y tus datos nunca salen de tu dispositivo. Las declaraciones DOCTYPE se rechazan por completo por seguridad XXE, ya que son el único lugar donde se pueden definir entidades externas. Si tu XML necesita una limpieza primero, fórmatalo con el Formateador XML, y cuando necesites ir en sentido contrario, el Convertidor de JSON a XML lleva JSON de vuelta a XML con las mismas convenciones de @nombre y #text. El Formateador JSON da formato legible al resultado, y el Convertidor de YAML a JSON hace el mismo trabajo para archivos de configuración YAML.',
    faqs: [
      { q: '¿Cómo convierto XML a JSON en línea?', a: 'Pega tu XML en el cuadro de entrada, o sube un archivo .xml o .txt. El JSON aparece en vivo mientras escribes. Cópialo o descárgalo como archivo .json. Nada se sube: el análisis y la conversión corren en tu navegador.' },
      { q: '¿Cómo se convierten los atributos XML a JSON?', a: 'Por defecto cada atributo se convierte en una clave con el prefijo @, así <book id="bk101"> se vuelve { "@id": "bk101" }. Si lo prefieres, cambia el estilo de atributos a agrupado y todos los atributos quedan en un solo objeto @attributes: { "@attributes": { "id": "bk101" } }.' },
      { q: '¿Qué pasa con los elementos XML repetidos?', a: 'Los elementos hermanos repetidos se convierten en un arreglo JSON. Tres elementos <book> bajo un mismo <catalog> se vuelven una sola clave book con un arreglo de tres entradas, en orden de documento. Un solo elemento queda como un objeto o cadena simple, así el JSON solo usa arreglos donde el XML realmente repite.' },
      { q: '¿Por qué mis números siguen siendo cadenas en el JSON?', a: 'Los valores quedan como cadenas por defecto, porque XML en sí no tiene tipo número ni booleano, y adivinar mal puede corromper datos como códigos postales o códigos de producto. Activa la inferencia de tipos y 29.99 se vuelve número y true se vuelve booleano. Los valores con un cero inicial, como 007, siempre quedan como cadenas, porque el cero indica que el valor es un código, no un número.' },
      { q: '¿Qué pasa con los comentarios XML y las secciones CDATA?', a: 'Los comentarios y las instrucciones de procesamiento se revisan para verificar la buena formación, pero nunca aparecen en el JSON, porque JSON no tiene sintaxis de comentarios para guardarlos. Las secciones CDATA se convierten en texto simple, así una descripción envuelta en CDATA conserva su contenido tal cual, aunque contenga caracteres que parecen marcado.' },
      { q: '¿Por qué esta herramienta rechaza las declaraciones DOCTYPE?', a: 'DOCTYPE es el único lugar donde se pueden definir entidades externas, y un archivo manipulado puede usarlas para que un analizador lea archivos locales o busque URLs remotas, un ataque llamado XXE. Esta herramienta rechaza cualquier DOCTYPE antes de empezar el análisis, así que un archivo malicioso nunca se procesa. Quita el DOCTYPE y el resto del documento se convierte con normalidad.' },
    ],
  },
];
