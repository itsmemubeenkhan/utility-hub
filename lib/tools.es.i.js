/* Spanish (US) translations - batch I (hex to rgb color converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_I = [
  {
    slug: 'convertidor-de-hex-a-rgb',
    enSlug: 'hex-to-rgb',
    lastReviewed: '2026-10-22',
    name: 'Convertidor de Hex a RGB',
    tagline: 'Convierte colores hex a RGB, RGBA y HSL al instante: conversor de dos vías con selector de color en vivo y generador de paleta de marca de 9 pasos.',
    category: 'Herramientas para desarrolladores',
    badge: 'Hx',
    calcKey: 'hexStats',
    customComponent: 'hex-rgb',
    inputs: [],
    metaTitle: 'Convertidor de Hex a RGB 2026: Hex a RGB, RGBA y HSL + Generador de Paletas [Gratis]',
    metaDescription:
      'Convertidor de hex a RGB gratis: convierte HEX a RGB, RGBA y HSL con un selector de color en vivo, convierte RGB de vuelta a HEX y genera una paleta de marca de 9 pasos. 100% en tu navegador, sin registro.',
    keywords: 'hex a rgb, convertidor hex a rgb, rgb a hex, selector de color hex, convertidor de códigos de color, hex a hsl, hex a rgba',
    explainer:
      'Un convertidor de hex a RGB traduce entre las dos formas en que las pantallas describen el color. HEX es la forma compacta que ves en CSS y en las herramientas de diseño: seis dígitos donde cada par fija el canal rojo, verde y azul en una escala de 0 a 255, así que #2563eb significa rojo 37, verde 99, azul 235. Escribe cualquier código hex en la herramienta o elige un color visualmente, y todos los formatos se actualizan en vivo. Las entradas numéricas RGB también funcionan en sentido inverso, así que un valor copiado de una herramienta de diseño se convierte directo a su código hex.\n\nLa salida RGBA añade el canal alfa, la opacidad del color de 0 (totalmente transparente) a 100 por ciento (totalmente opaco). El deslizador muestra la transparencia en la muestra y el fragmento se actualiza, por ejemplo rgba(37, 99, 235, 0.50) para un azul medio transparente. HSL es la tercera notación: tono como un ángulo de 0 a 360 grados en la rueda de color, saturación y luminosidad como porcentajes. Los diseñadores usan HSL cuando quieren aclarar u oscurecer un color sin cambiar su familia, porque esos ajustes se corresponden directamente con los números S y L.\n\nEl generador de paletas convierte cualquier color inicial en una escala de marca utilizable. Nueve pasos van del blanco a tu color y hasta el negro: la mitad izquierda mezcla tu color con blanco para matices claros, la derecha lo mezcla con negro para matices oscuros. Haz clic en cualquier muestra para copiar su código hex para botones, estados hover, fondos y texto. Como cada herramienta de este sitio, la conversión corre por completo en tu navegador, nada de lo que escribes se sube ni se almacena, y no hay cuenta ni límites.',
    faqs: [
      { q: '¿Cómo convierto hex a RGB?', a: 'Cada par de dígitos hex se convierte en un canal de 0 a 255: #2563eb se convierte a rgb(37, 99, 235) porque 25 en hex es 37, 63 es 99 y eb es 235. Escribe el código en la herramienta y todos los formatos se actualizan al instante.' },
      { q: '¿Cómo convierto RGB de vuelta a hex?', a: 'Usa las entradas numéricas RGB de la página: introduce los valores de rojo, verde y azul de 0 a 255 y el código hex se actualiza en vivo. Por ejemplo rgb(37, 99, 235) se convierte de vuelta a #2563eb.' },
      { q: '¿Cuál es la diferencia entre HEX, RGB y HSL?', a: 'Son tres notaciones para el mismo color. HEX (#2563eb) es la forma compacta usada en CSS y herramientas de diseño. RGB (rgb(37, 99, 235)) detalla los canales rojo, verde y azul y es más fácil de leer. HSL (hsl(221, 83%, 53%)) describe tono, saturación y luminosidad, lo que lo hace el más fácil para ajustar qué tan vivo u oscuro es un color.' },
      { q: '¿Qué significa el valor alfa de RGBA?', a: 'Alfa es la opacidad: 100% es totalmente opaco, 0% es totalmente transparente. El deslizador de la página muestra la transparencia en la muestra, así que rgba(37, 99, 235, 0.50) se muestra como un azul medio transparente sobre lo que esté detrás.' },
      { q: '¿Cómo funciona el generador de paleta de marca?', a: 'Mezcla tu color inicial con blanco para producir cinco matices claros a la izquierda y con negro para cuatro matices oscuros a la derecha, nueve pasos en total. Haz clic en cualquier muestra para copiar su código hex para botones, estados hover, fondos y bordes.' },
      { q: '¿Mis datos de color se suben a algún lado?', a: 'No. Las matemáticas de conversión corren por completo en tu navegador con JavaScript. Nada de lo que escribes se envía a un servidor, se registra ni se almacena.' },
    ],
  },
];
