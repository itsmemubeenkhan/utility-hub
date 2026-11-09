/* Spanish (US) translations - batch AA (CSS Minifier).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AA = [
  {
    slug: 'minificador-de-css',
    enSlug: 'css-minifier',
    lastReviewed: '2026-11-09',
    name: 'Minificador de CSS',
    tagline: 'Minifica CSS online gratis: quita comentarios y espacios en blanco, acorta colores hex, quita unidades de los valores cero, y embellece CSS minificado para leerlo de nuevo. 100% en tu navegador, sin registro.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Cs',
    calcKey: 'cssMinifierStats',
    customComponent: 'cssmin-minify',
    inputs: [],
    metaTitle: 'Minificador de CSS Online Gratis: Minifica Código CSS [Sin Registro]',
    metaDescription:
      'Minificador de CSS gratis online: minifica código CSS en tu navegador, quita comentarios y espacios, acorta colores hex y embellece CSS minificado. 100% privado, sin registro.',
    keywords: 'minificador de css, minificar css online, compresor de css, minificador css gratis, comprimir css, minificar codigo css, embellecedor de css, formatear css online',
    explainer:
      'Un minificador de CSS reduce una hoja de estilos quitando todo lo que el navegador no necesita: comentarios, sangría, saltos de línea y caracteres redundantes. La página se ve exactamente igual, pero el archivo es más pequeño, se descarga antes y bloquea el renderizado menos tiempo. El CSS bloquea el renderizado, lo que significa que el navegador no pinta la página hasta descargar y analizar tus hojas de estilos, así que un archivo más pequeño mejora el First Contentful Paint y el Largest Contentful Paint, dos métricas de Google Core Web Vitals. Pega una hoja de estilos aquí, o sube un archivo .css, y la versión minificada aparece al instante con el conteo de caracteres antes y después y el porcentaje ahorrado.\n\nEste minificador es un pequeño escáner que entiende CSS, no un reemplazo ciego de texto. Quita comentarios, colapsa espacios en blanco, elimina el último punto y coma de cada regla, acorta #ffffff a #fff, convierte 0px, 0em y 0% en un simple 0, y borra las reglas vacías. Cinco interruptores te permiten controlar cada paso, y los comentarios de licencia que empiezan con /*! se conservan por defecto para que la atribución sobreviva. Lo que nunca toca es igual de importante: los espacios alrededor de + y - dentro de calc() se quedan exactamente como están, porque calc(100% - 20px) se rompe sin ellos, y las cadenas entre comillas y los valores de url() pasan intactos, así que las cadenas de content y las rutas de imágenes nunca se dañan.\n\nEl modo embellecer hace lo contrario: convierte un archivo minificado en CSS legible con sangría, una declaración por línea, útil cuando heredas un fragmento minificado de un CDN antiguo o de un panel de DevTools y necesitas leerlo. Una herramienta de compilación como cssnano o Lightning CSS suele ahorrar más en un proyecto completo, porque entiende mapas de origen y fusiona reglas, pero para un flujo de trabajo de pegar y listo esta herramienta es más rápida: sin instalación, sin configuración, sin subidas. Ten en cuenta que los tamaños reales de transferencia serán aún menores cuando el servidor aplique gzip o Brotli, así que el porcentaje que se muestra aquí es el ahorro bruto antes de la compresión.',
    faqs: [
      { q: '¿Cómo minifico CSS online?', a: 'Pega tu hoja de estilos en el cuadro de entrada, o sube un archivo .css. La versión minificada aparece al instante, con el conteo de caracteres antes y después y el porcentaje ahorrado. Copia el resultado o descárgalo como archivo .css. Nada se sube: la minificación corre en tu navegador.' },
      { q: '¿El CSS minificado sigue siendo válido?', a: 'Sí. Minificar solo quita lo que el navegador no necesita para mostrar la página: comentarios, espacios en blanco, el último punto y coma de una regla y caracteres redundantes como las unidades de los valores cero. La salida es CSS válido que los navegadores interpretan igual que el original.' },
      { q: '¿Romperá las expresiones calc()?', a: 'No. El minificador entiende CSS y reconoce calc(): los espacios alrededor de + y - dentro de paréntesis son obligatorios en CSS y se conservan tal cual. Las cadenas entre comillas y los valores de url() también quedan intactos, así que las cadenas de content y las rutas de imágenes nunca se dañan.' },
      { q: '¿Qué quita exactamente el minificador?', a: 'Comentarios (los comentarios de licencia que empiezan con /*! se conservan por defecto), espacios en blanco y saltos de línea, el último punto y coma de cada regla, colores hex acortados (#ffffff se vuelve #fff), unidades en valores cero (0px se vuelve 0) y reglas vacías sin declaraciones. Cada paso se puede desactivar.' },
      { q: '¿Cuánto más pequeño quedará mi CSS?', a: 'La mayoría de las hojas se reducen entre un 15 y un 40 por ciento, según cuántos comentarios y cuánto formato tenga el original. Un archivo con muchos comentarios y formato manual ahorra más que uno ya compacto. La herramienta muestra el porcentaje exacto de tu archivo, antes de la compresión gzip o Brotli, que reduce aún más el tamaño de transferencia.' },
      { q: '¿Para qué sirve el modo embellecer?', a: 'Embellecer convierte un archivo minificado en CSS legible con sangría y una declaración por línea, para que puedas leer un fragmento copiado de un CDN antiguo, un archivo de tema minificado o un panel de DevTools. No restaura los comentarios originales, que la minificación elimina de forma permanente.' },
    ],
  },
];
