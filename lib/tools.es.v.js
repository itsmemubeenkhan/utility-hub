/* Spanish (US) translations - batch V (CSS gradient generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_V = [
  {
    slug: 'generador-de-degradados-css',
    enSlug: 'css-gradient-generator',
    lastReviewed: '2026-11-04',
    name: 'Generador de Degradados CSS Gratis',
    tagline: 'Crea degradados CSS lineales, radiales y cónicos de forma visual: 2 a 5 colores, 8 plantillas, vista previa grande, CSS y clases Tailwind para copiar, descargas PNG y SVG, y enlaces para compartir, todo en tu navegador.',
    category: 'Herramientas de Diseño',
    badge: 'Gr',
    calcKey: 'gradientStats',
    customComponent: 'gradient-css',
    inputs: [],
    metaTitle: 'Generador de Degradados CSS: Lineales, Radiales y Cónicos [Gratis, Sin Registro]',
    metaDescription:
      'Generador de degradados CSS gratis: crea degradados lineales, radiales y cónicos con 2 a 5 colores, 8 plantillas, vista previa en vivo, CSS y clases Tailwind para copiar, exportación PNG y SVG, y enlaces para compartir. 100% en tu navegador, sin registro.',
    keywords: 'generador de degradados css, generador de degradado lineal, generador de degradado radial, generador de degradado cónico, crear degradado, herramienta de degradados css, generador de degradado tailwind, selector de colores degradado',
    explainer:
      'Un degradado CSS mezcla dos o más colores a lo largo de una línea, un círculo o una rotación completa, y es la forma más rápida de dar a una página, un banner o una publicación un fondo moderno sin usar un archivo de imagen. Este generador crea el CSS por ti: elige lineal, radial o cónico, coloca los colores en su lugar y copia el código terminado. Todo corre en tu navegador, así que no hay subida de archivos, ni cuenta, ni marca de agua, y el resultado son unas pocas líneas de CSS simple que puedes pegar en cualquier lado.\n\nLos tres tipos cubren trabajos distintos. Los degradados lineales van en una dirección recta, fijada por un ángulo o una de las ocho direcciones rápidas, y son el recurso habitual para encabezados, botones y secciones principales. Los radiales se expanden desde un punto, como círculo o elipse, lo que sirve para brillos, focos de luz y viñetas suaves. Los cónicos giran alrededor de un punto central, que es como se hacen los gráficos circulares, las ruedas de color y los bordes giratorios. Los tres tipos comparten el mismo editor de colores: 2 a 5 colores, cada uno con selector de color, campo HEX exacto y control de posición, más 8 plantillas como atardecer, océano y real cuando quieres un buen resultado en un clic.\n\nDos detalles hacen que un degradado sirva de verdad y no solo se vea bonito. Primero, la herramienta siempre incluye una línea de color de respaldo con el primer color, así que los navegadores antiguos muestran un color sólido en vez de nada. Segundo, la nota de contraste bajo la vista previa te dice si el texto oscuro o el claro se lee mejor sobre tu degradado, lo que importa en cuanto pones un titular encima. Para usarlo en producción, copia la clase Tailwind en vez del CSS directo, descarga un PNG de 1200 x 630 para imágenes de redes sociales, o toma el SVG independiente cuando necesites el degradado como archivo.',
    faqs: [
      { q: '¿Cómo creo un degradado lineal en CSS?', a: 'Elige Lineal, fija el ángulo con el control o una dirección rápida, y luego ajusta los colores. La herramienta entrega código como background: linear-gradient(135deg, #FF512F 0%, #DD2476 100%); más una línea de color de respaldo con el primer color.' },
      { q: '¿Cuál es la diferencia entre degradados lineales, radiales y cónicos?', a: 'El lineal mezcla colores en línea recta según un ángulo. El radial los expande desde un punto, como círculo o elipse. El cónico los gira alrededor de un punto central, que es lo que usan los gráficos circulares y las ruedas de color. Los tres son CSS simple, sin archivo de imagen.' },
      { q: '¿Cuántos colores puede tener un degradado?', a: 'Este generador admite de 2 a 5 colores. Con dos se logra una mezcla limpia; al añadir colores intermedios se crean transiciones de varios tonos, por ejemplo un atardecer que pasa por naranja, rosa y morado. Cada color tiene su propio control de posición, así que un color puede dominar o aparecer como una franja fina.' },
      { q: '¿Cómo uso un degradado con Tailwind CSS?', a: 'Copia la clase Tailwind de la herramienta, por ejemplo bg-[linear-gradient(135deg,_#FF512F_0%,_#DD2476_100%)]. Es una clase de valor arbitrario, así que funciona en Tailwind v3 y v4 sin cambiar ninguna configuración: pégala donde usarías una clase de fondo normal.' },
      { q: '¿Puedo descargar mi degradado como imagen?', a: 'Sí. Descarga un PNG de 1200 x 630, el tamaño estándar para compartir en redes, o un archivo SVG independiente. El PNG se genera en tu navegador desde el mismo degradado, y el SVG funciona como un archivo de imagen normal o dentro del HTML.' },
      { q: '¿Mi degradado funcionará en navegadores antiguos?', a: 'El CSS copiado incluye una línea de color de respaldo con el primer color, así que los navegadores sin soporte para degradados igual muestran un color sólido. Los navegadores modernos de la última década admiten degradados lineales, radiales y cónicos de forma nativa.' },
    ],
  },
];
