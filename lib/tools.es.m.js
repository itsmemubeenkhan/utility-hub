/* Spanish (US) translations - batch M (url encoder/decoder).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_M = [
  {
    slug: 'codificador-decodificador-url',
    enSlug: 'url-encoder-decoder',
    lastReviewed: '2026-10-26',
    name: 'Codificador y Decodificador de URL',
    tagline: 'Codifica URLs y texto en porcentaje o decodifícalos de vuelta: ámbitos encodeURIComponent vs encodeURI, espacios %20 vs +, detección de doble codificación, desglose de partes de la URL y constructor de cadenas de consulta, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'U1',
    calcKey: 'urlStats',
    customComponent: 'url-encode',
    inputs: [],
    metaTitle: 'Codificador y Decodificador de URL Online Gratis: encodeURIComponent vs encodeURI, Constructor de Consultas',
    metaDescription:
      'Codificador y decodificador de URL gratis en línea: codifica texto y URLs en porcentaje o decodifícalos, ámbitos encodeURIComponent vs encodeURI, espacios %20 vs +, detección de doble codificación, partes de la URL y constructor de cadenas de consulta. Privado, sin registro.',
    keywords: 'codificador url, decodificador url, codificación de porcentaje, encodeURIComponent, encodeURI, codificar url online, constructor de cadena de consulta, decodificar url online',
    explainer:
      'Una URL solo puede llevar un conjunto limitado de caracteres. Todo fuera de ese conjunto, o con un trabajo estructural en la dirección, debe escribirse como una secuencia de porcentaje antes de que el enlace sea seguro de enviar: un espacio se convierte en %20, un & en %26, un ? en %3F, y el texto no ASCII se codifica primero como bytes UTF-8, así que café se convierte en caf%C3%A9. Esta herramienta codifica texto y URLs y los decodifica de vuelta, todo en tu navegador. Pega un valor, elige Codificar o Decodificar, y copia el resultado.\n\nLa elección que más confunde es el ámbito. Codifica un solo valor (encodeURIComponent) cuando va dentro de una URL: un término de búsqueda, un destino de redirección, un segmento de ruta. Escapa también los caracteres estructurales, así que https://example.com/search?q=hello world&lang=en como un solo valor se convierte en https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den, que es exactamente correcto como valor de parámetro y exactamente incorrecto como enlace clicable. Codifica una URL completa (encodeURI) cuando la dirección debe seguir clicable: mantiene intactos : / ? & = # y solo corrige espacios y caracteres no ASCII, así que el mismo ejemplo queda https://example.com/search?q=hello%20world&lang=en. Ejemplo concreto: el valor "hello world & friends?" se codifica como hello%20world%20%26%20friends%3F en modo valor.\n\nDos trampas más vale conocer. Los espacios tienen dos escrituras: %20 es la codificación de porcentaje estándar y segura en todas partes, mientras que + significa un espacio solo en datos de formularios HTML (application/x-www-form-urlencoded), así que un signo más literal debe llegar como %2B o se convierte en silencio en un espacio. Y si una cadena decodificada aún muestra %20 o %25, fue codificada dos veces, normalmente porque un codificador corrió sobre un valor ya codificado; decodifica de nuevo para resolverlo y luego corrige el paso que la duplicó. El constructor de cadenas de consulta al final de la herramienta maneja las reglas de codificación de formularios por ti, y el desglose de partes de la URL muestra qué contiene realmente una dirección pegada, que es la forma más rápida de leer un enlace de redirección o rastreo sospechoso.',
    faqs: [
      { q: '¿Cuál es la diferencia entre encodeURIComponent y encodeURI?', a: 'encodeURIComponent codifica un valor dentro de una URL y escapa caracteres estructurales como / ? & = : #, así el valor no puede romper la dirección que lo rodea. encodeURI codifica una URL completa y mantiene esos caracteres estructurales, corrigiendo solo espacios y caracteres no ASCII. Usa el primero para un valor de parámetro o segmento de ruta, el segundo para una dirección completa clicable.' },
      { q: '¿Un espacio debe ser %20 o +?', a: '%20 es la codificación de porcentaje estándar y segura en todas partes. + significa un espacio solo en datos de formularios HTML (application/x-www-form-urlencoded), que es lo que envían los navegadores desde formularios y lo que produce URLSearchParams. En una ruta o un enlace simple, usa %20; en una cadena de consulta construida por un formulario, + también es correcto.' },
      { q: '¿Por qué mi URL decodificada aún muestra %20?', a: 'Fue codificada dos veces: un codificador corrió sobre un valor ya codificado, convirtiendo %20 en %2520. Decodifica una vez para obtener %20, decodifica de nuevo para obtener el espacio, y luego corrige el paso que la codificó dos veces. Esta herramienta marca automáticamente la entrada doblemente codificada.' },
      { q: '¿Por qué falló mi decodificación?', a: 'Normalmente un % sin dos dígitos hexadecimales después, por ejemplo un "50% off" literal que nunca fue codificado, o texto armado por concatenación en vez de un codificador real. Un % solo en un componente codificado también falla: codifícalo como %25 primero.' },
      { q: '¿Cómo leo los parámetros dentro de una URL larga?', a: 'Pega la URL en la herramienta: la sección de parámetros de consulta lista cada clave y valor decodificado en orden, incluidos los duplicados. Es la forma más rápida de verificar qué lleva realmente un enlace de redirección, analítica o webhook.' },
      { q: '¿Algo de lo que pego se sube?', a: 'No. La codificación y decodificación corren localmente en tu navegador con las funciones de codificación de la plataforma. Nada se envía a un servidor, se guarda ni se registra, así que pegar una URL con token o una línea de registro queda privado en tu máquina.' },
    ],
  },
];
