/* Spanish (US) translations - batch J (barcode generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_J = [
  {
    slug: 'generador-de-codigos-de-barras',
    enSlug: 'barcode-generator',
    lastReviewed: '2026-10-23',
    name: 'Generador de Códigos de Barras Gratis',
    tagline: 'Crea códigos de barras escaneables al instante: Code 128, EAN-13, UPC-A, Code 39, ITF-14 y Codabar, con descarga SVG/PNG y hoja de etiquetas imprimible.',
    category: 'Herramientas QR',
    badge: 'Bc',
    calcKey: 'barcodeStats',
    customComponent: 'barcode-gen',
    inputs: [],
    metaTitle: 'Generador de Códigos de Barras Gratis 2026: Code 128, EAN-13, UPC-A [Sin Registro]',
    metaDescription:
      'Genera códigos de barras gratis en línea: Code 128, EAN-13, UPC-A, Code 39, ITF-14 y Codabar. Dígitos de control automáticos, descarga SVG/PNG, hojas de etiquetas imprimibles. 100% en tu navegador.',
    keywords: 'generador de códigos de barras, generador de código de barras gratis, generador code 128, generador ean-13, generador upc, crear código de barras online',
    explainer:
      'Un generador de códigos de barras convierte cualquier código de producto, SKU o número de serie en el patrón de rayas que los escáneres leen en una fracción de segundo. Elige el formato según tu caso: Code 128 codifica letras y dígitos para SKUs y números de serie, EAN-13 y UPC-A son los códigos de barras minoristas impresos en productos que se venden en tiendas, Code 39 sirve para etiquetas de almacén e identificaciones, ITF-14 marca cajas de envío y Codabar aún lo usan bibliotecas y bancos de sangre. Escribe tu valor y el código se genera al instante, con el texto legible impreso debajo para que el personal pueda teclearlo cuando no haya escáner a mano.\n\nLos formatos minoristas llevan un dígito de control, un número final calculado a partir de los demás que permite a los escáneres detectar errores de impresión. Esta herramienta lo añade automáticamente: escribe los 12 dígitos de un EAN-13 o los 11 de un UPC-A y aparece el dígito de control correcto, calculado con el algoritmo estándar GS1 mod-10. Si pegas un código completo de 13 o 12 dígitos, la herramienta verifica el dígito de control y te avisa cuando no coincide, lo que normalmente significa un error de tipeo en el número. Las descargas vienen en SVG para impresión nítida a cualquier tamaño o PNG para documentos y listados, y el ancho de barra, la altura y los colores se ajustan para impresoras de etiquetas y empaques oscuros.\n\nLa hoja de etiquetas es la parte que los vendedores pedían: escribe el nombre del producto y el precio, elige cuántas etiquetas caben en tu hoja e imprime una cuadrícula de etiquetas idénticas, cada una con el código de barras de arriba. Funciona con papel de etiquetas estándar y cualquier impresora casera o de oficina, sin software especial. Como cada herramienta de este sitio, todo corre localmente en tu navegador: nada de lo que codificas se envía a un servidor, y no hay cuenta, marca de agua ni límites.',
    faqs: [
      { q: '¿Qué formato de código de barras debo usar?', a: 'Code 128 para SKUs, números de serie y cualquier cosa alfanumérica. EAN-13 para productos vendidos al por menor fuera de Norteamérica, UPC-A para EE. UU. y Canadá. Code 39 para etiquetas de almacén e identificaciones, ITF-14 para cajas de envío externas, Codabar para bibliotecas y usos heredados similares.' },
      { q: '¿Cómo consigo un número UPC o EAN real para mi producto?', a: 'Compra un prefijo de empresa GS1 en gs1.org (o GS1 US) y asigna a cada producto su propio número. No inventes números ni reutilices los de otro: los minoristas los rechazan y los marketplaces eliminan los listados. Esta herramienta codifica el número que ya tienes; no puede emitir números oficiales.' },
      { q: '¿Mi código de barras va a escanear de verdad?', a: 'Si lo imprimes a un tamaño razonable con buen contraste (barras oscuras sobre fondo claro, márgenes silenciosos despejados a ambos lados) y un dígito de control válido, sí. Imprime siempre una etiqueta de prueba y escanéala con una app de teléfono antes de imprimir la hoja completa.' },
      { q: '¿Qué es el dígito de control y por qué lo añade la herramienta?', a: 'El último dígito de EAN-13, UPC-A e ITF-14 se calcula a partir de los demás con el algoritmo GS1 mod-10, para que los escáneres rechacen errores de impresión. Escribe 12 dígitos para EAN-13, 11 para UPC-A o 13 para ITF-14 y la herramienta añade el dígito correcto; pega el código completo y lo verifica.' },
      { q: 'Code 128 vs Code 39: ¿cuál es la diferencia?', a: 'Code 128 es más denso y codifica todo el juego ASCII, así que los mismos datos caben en una etiqueta más pequeña. Code 39 es más antiguo y grande, con un juego limitado (A-Z, 0-9 y algunos símbolos), pero funciona con escáneres muy viejos. Para proyectos nuevos, Code 128 es la mejor opción.' },
      { q: '¿Mis datos se suben a algún lado?', a: 'No. El código de barras se genera por completo en tu navegador con JavaScript. Nada de lo que escribes se envía a un servidor, se registra ni se almacena.' },
    ],
  },
];
