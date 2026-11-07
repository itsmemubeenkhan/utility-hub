/* Spanish (US) translations - batch Y (XML formatter & validator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_Y = [
  {
    slug: 'formateador-xml',
    enSlug: 'xml-formatter',
    lastReviewed: '2026-11-07',
    name: 'Formateador y Validador XML',
    tagline: 'Formatea, minifica, valida y convierte XML en tu navegador: imprime con sangría de 2 espacios, 4 espacios o tabulación, errores exactos de línea y columna, conversión de XML a JSON, salida con resaltado de sintaxis, copiar y descargar, con DOCTYPE rechazado por seguridad XXE.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Xm',
    calcKey: 'xmlStats',
    customComponent: 'xml-format',
    inputs: [],
    metaTitle: 'Formateador XML Online: Formatear, Validar y Minificar XML Gratis [Sin Registro]',
    metaDescription:
      'Formateador y validador XML gratis: imprime XML con sangría de 2 espacios, 4 espacios o tabulación, minifica XML, valida la buena formación con errores exactos de línea y columna, y convierte XML a JSON. 100% en tu navegador, sin registro.',
    keywords: 'formateador xml online, formateador xml gratis, validador xml, formatear xml, minificar xml, xml a json, validar xml online, embellecedor xml',
    explainer:
      'XML sigue siendo el formato de intercambio para sitemaps, feeds RSS, archivos SVG, documentos de Office e innumerables APIs, y una sola etiqueta de cierre mal puesta basta para que un archivo entero sea ilegible. Este formateador toma XML crudo, en una sola línea o desordenado, y lo reordena en líneas limpias y legibles, para que la estructura sea obvia de un vistazo. Todo corre en tu navegador: pega XML o sube un archivo .xml, elige sangría de 2 espacios, 4 espacios o tabulación, y copia el resultado o descárgalo como archivo .xml.\n\nFormatear es solo la mitad del trabajo. El validador integrado revisa la buena formación y, cuando algo está mal, te dice la línea y la columna exactas además de qué salió mal: una etiqueta de cierre que no coincide con su apertura, un elemento sin cerrar, un & solo que debería escribirse como &amp;, un atributo duplicado, o un valor de atributo sin comillas. Arreglar XML adivinando es lento; una posición exacta lo convierte en un trabajo de un minuto. El modo minificar hace lo contrario de formatear, quitando el espacio en blanco sin importancia para que el archivo sea lo más pequeño posible para transferir, y el modo XML a JSON convierte el documento en un objeto JSON, con atributos como claves @nombre, texto como #text y elementos repetidos como arreglos, útil cuando una API habla JSON pero tus datos llegan como XML.\n\nUna regla de seguridad viene integrada y vale la pena conocerla. Las declaraciones DOCTYPE se rechazan por completo, porque son el único lugar donde se pueden definir entidades externas, y un archivo manipulado puede usarlas para que un analizador lea archivos locales o busque URLs remotas, una clase de ataque llamada XXE. Algunos formateadores procesan esos archivos en silencio, lo cual está bien para un archivo de confianza pero es riesgoso para uno de origen desconocido. Esta herramienta rechaza el DOCTYPE antes de empezar el análisis, así que un archivo malicioso nunca se procesa. Para el trabajo diario, eso significa que sitemaps, feeds RSS, SVG, archivos de configuración y respuestas de API se formatean y validan aquí, mientras que cualquier cosa que necesite un DOCTYPE pertenece a un editor XML dedicado.',
    faqs: [
      { q: '¿Cómo formateo XML online?', a: 'Pega tu XML o sube un archivo .xml, elige una sangría (2 espacios, 4 espacios o tabulación), y la herramienta lo reordena en líneas limpias y legibles. Copia el resultado o descárgalo como archivo .xml. Nada se sube: el formato corre en tu navegador.' },
      { q: '¿Cómo reviso si mi XML es válido?', a: 'Cambia al modo Validar y pega tu XML. La herramienta revisa la buena formación e informa si el documento es válido o la línea y la columna exactas del primer error, con una explicación sencilla como una etiqueta de cierre que no coincide, un elemento sin cerrar o un & solo que debería ser &amp;.' },
      { q: '¿Cuál es la diferencia entre formatear y minificar XML?', a: 'Formatear agrega saltos de línea y sangría para que el XML sea fácil de leer y editar. Minificar quita el espacio en blanco sin importancia entre etiquetas para que el archivo sea lo más pequeño posible para transferir. Ambos mantienen los datos idénticos: solo cambia el espacio en blanco.' },
      { q: '¿Cómo funciona la conversión de XML a JSON?', a: 'Cada elemento se convierte en un objeto JSON: los atributos se vuelven claves @nombre, el contenido de texto se vuelve #text, y los elementos hijos repetidos se vuelven arreglos. Un elemento con solo texto se vuelve una cadena simple. CDATA se vuelve una clave #cdata. Los comentarios no pasan al JSON.' },
      { q: '¿Por qué esta herramienta rechaza las declaraciones DOCTYPE?', a: 'DOCTYPE es el único lugar donde se pueden definir entidades externas, y un archivo manipulado puede usarlas para que un analizador lea archivos locales o busque URLs remotas, un ataque llamado XXE. Esta herramienta rechaza cualquier DOCTYPE antes de empezar el análisis, así que un archivo malicioso nunca se procesa. Quita el DOCTYPE (o lleva el archivo a un editor XML dedicado) y el resto del documento se formatea con normalidad.' },
      { q: '¿Qué es XML bien formado?', a: 'El XML bien formado sigue las reglas básicas de sintaxis: exactamente un elemento raíz, cada etiqueta de apertura tiene su etiqueta de cierre correspondiente (o se cierra sola como <br/>), los valores de atributo van entre comillas, los nombres de atributo son únicos por elemento, y & y < aparecen solo como parte del marcado o de referencias de entidad válidas como &amp;. Bien formado no es lo mismo que válido contra un esquema, que es una revisión más estricta que esta herramienta no hace.' },
    ],
  },
];
