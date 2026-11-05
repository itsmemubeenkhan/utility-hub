/* Spanish (US) translations - batch W (color palette generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_W = [
  {
    slug: 'generador-de-paletas-de-colores',
    enSlug: 'color-palette-generator',
    lastReviewed: '2026-11-05',
    name: 'Generador de Paletas de Colores Gratis',
    tagline: 'Genera una paleta de 5 colores desde un solo color con 6 reglas de armonía, bloquea colores y regenera el resto, revisa el contraste WCAG y exporta variables CSS, una configuración de Tailwind o JSON, todo en tu navegador.',
    category: 'Herramientas de Diseño',
    badge: 'Pa',
    calcKey: 'paletteStats',
    customComponent: 'palette-color',
    inputs: [],
    metaTitle: 'Generador de Paletas de Colores Gratis: 6 Reglas de Armonía, Revisión de Contraste WCAG [Sin Registro]',
    metaDescription:
      'Generador de paletas de colores gratis: crea una paleta de 5 colores desde un color con 6 reglas de armonía, bloquea y regenera colores, revisa el contraste WCAG y exporta variables CSS, configuración de Tailwind o JSON. 100% en tu navegador, sin registro.',
    keywords: 'generador de paletas de colores, generador de esquemas de color, creador de paletas, generador de armonía de color, generar paleta de colores desde un color, revisor de contraste wcag, paleta de colores de marca',
    explainer:
      'Una paleta de colores es un conjunto pequeño de colores que combinan bien, y es lo que hace que un sitio web, una marca o una presentación se vea intencional en vez de aleatoria. Este generador crea una para ti desde un solo color base: elige un color con el selector o escribe un valor HEX, elige una regla de armonía y obtienes una paleta de 5 colores al instante. Todo corre en tu navegador, así que no hay subida de archivos, ni cuenta, ni marca de agua, y cada color se copia con un clic como HEX, RGB o HSL.\n\nLas seis reglas de armonía vienen de la rueda de color, y cada una sirve para un trabajo distinto. Complementaria combina tu base con el color opuesto en la rueda para diseños audaces y de alto contraste. Análoga usa colores vecinos en la rueda para esquemas tranquilos y cohesivos. Triádica separa tres colores de forma uniforme en la rueda para un equilibrio vibrante, complementaria dividida suaviza el contraste de un par complementario, tetrádica usa dos pares complementarios para esquemas ricos y variados, y monocromática se queda en un solo tono y varía la luminosidad para looks limpios y minimalistas. Bloquea cualquier color que te guste y pulsa regenerar (o la barra espaciadora) para cambiar solo los colores sin bloquear, y empieza desde una de las 8 paletas como atardecer, océano o real cuando quieras inspiración.\n\nUna paleta solo sirve si el texto sobre ella se puede leer de verdad, así que el revisor de contraste WCAG te deja elegir cualquier color de la paleta como fondo y un color de texto, y luego muestra la proporción exacta de contraste y si pasa AA y AAA para texto normal y grande. Cuando la paleta está lista, expórtala como variables CSS para pegar en una hoja de estilos, como fragmento de configuración de Tailwind con pasos de 100 a 500, como JSON para tokens de diseño, o como una lista simple de valores HEX, o descarga toda la paleta como archivo .css o .json.',
    faqs: [
      { q: '¿Qué es un generador de paletas de colores?', a: 'Es una herramienta que crea un conjunto de colores que combinan bien, empezando desde un color base que tú eliges. Esta usa reglas de armonía de la rueda de color para producir una paleta de 5 colores, y cada color se puede copiar como HEX, RGB o HSL, o exportar como variables CSS, una configuración de Tailwind o JSON.' },
      { q: '¿Cuál es la diferencia entre paletas complementarias, análogas y triádicas?', a: 'La complementaria combina un color con el opuesto en la rueda de color, lo que da un contraste fuerte. La análoga usa colores vecinos en la rueda, que se ve tranquilo y cohesivo. La triádica elige tres colores separados de forma uniforme en la rueda, que es vibrante pero equilibrada. El generador también ofrece reglas complementaria dividida, tetrádica y monocromática.' },
      { q: '¿Cómo genero una paleta de colores desde un color?', a: 'Escribe tu color base con el selector de color o un valor HEX, y luego elige una regla de armonía como complementaria o triádica. La herramienta crea una paleta de 5 colores desde esa base al instante. Bloquea los colores que quieras conservar y pulsa regenerar o la barra espaciadora para cambiar solo los colores sin bloquear hasta que la paleta se vea bien.' },
      { q: '¿Cómo reviso el contraste y el cumplimiento WCAG?', a: 'Usa el revisor de contraste: elige un color de la paleta como fondo y un color de texto, y la herramienta muestra la proporción exacta de contraste y si pasa AA y AAA para texto normal y grande. WCAG AA necesita una proporción de al menos 4.5 a 1 para texto normal y 3 a 1 para texto grande, mientras que AAA necesita 7 a 1 para texto normal y 4.5 a 1 para texto grande.' },
      { q: '¿Cómo exporto mi paleta a CSS o Tailwind?', a: 'Abre el panel de exportación y copia el bloque de variables CSS para pegarlo en cualquier hoja de estilos, copia el fragmento de configuración de Tailwind para extender los colores de tu tema con pasos de 100 a 500, o copia el JSON para tokens de diseño. También puedes descargar la paleta como archivo .css o .json, o copiar la lista simple de valores HEX.' },
      { q: '¿Este generador de paletas de colores es gratis? ¿Necesito una cuenta?', a: 'Sí, es completamente gratis y no hay registro, ni cuenta, ni subida de archivos. Todas las paletas se generan en tu dispositivo en el navegador, así que tus colores nunca salen de tu computadora.' },
    ],
  },
];
