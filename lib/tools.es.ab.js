/* Spanish (US) translations - batch AB (JavaScript Minifier).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AB = [
  {
    slug: 'minificador-de-javascript',
    enSlug: 'javascript-minifier',
    lastReviewed: '2026-11-10',
    name: 'Minificador de JavaScript',
    tagline: 'Minifica JavaScript online gratis con Terser: acorta nombres de variables, pliega constantes, quita código muerto y llamadas a console, y embellece JS minificado para leerlo de nuevo. 100% en tu navegador, sin registro.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Js',
    calcKey: 'jsMinifierStats',
    customComponent: 'jsmin-minify',
    inputs: [],
    metaTitle: 'Minificador de JavaScript Online Gratis: Minifica Código JS [Sin Registro]',
    metaDescription:
      'Minificador de JavaScript gratis online: minifica código JS en tu navegador con Terser, acorta nombres de variables, quita llamadas a console y embellece código minificado. 100% privado, sin registro.',
    keywords: 'minificador de javascript, minificar javascript online, minificador js, minificar js online, compresor de javascript, minificar codigo js, embellecedor de javascript, formatear javascript online',
    explainer:
      'Un minificador de JavaScript reduce un script quitando todo lo que el navegador no necesita para ejecutarlo: comentarios, espacios en blanco, saltos de línea y nombres locales largos. El código funciona exactamente igual, pero el archivo es más pequeño, se descarga antes y se analiza más rápido, algo que se nota sobre todo en conexiones móviles lentas, donde cada kilobyte retrasa la primera interacción. Pega tu código aquí, o sube un archivo .js, y la versión minificada aparece al instante con el conteo de bytes antes y después y el porcentaje ahorrado.\n\nEsta herramienta minifica con Terser, el mismo minificador basado en el parser que usan muchas herramientas de compilación, corriendo por completo en tu navegador. Terser primero convierte tu código en un árbol de sintaxis real, así entiende cadenas, template literals, expresiones regulares y comentarios en lugar de adivinar con reemplazos de texto. Por eso puede acortar nombres de variables locales con seguridad, plegar constantes como 2 + 3 en 5, quitar código muerto que nunca se ejecuta y eliminar llamadas a console si lo pides, conservando los comentarios de licencia que empiezan con /*! cuando se lo pides. Si Terser no puede cargar, la herramienta usa un escáner seguro que solo quita comentarios y espacios y nunca renombra nada, y lo dice en pantalla.\n\nEl modo embellecer hace lo contrario: convierte un archivo minificado en código legible con sangría, una sentencia por línea, útil cuando heredas un fragmento minificado de un CDN antiguo o de un panel de DevTools y necesitas leerlo. Un bundler como esbuild o webpack suele ahorrar más en un proyecto completo, porque une muchos archivos, divide el código y entiende mapas de origen, pero para un solo archivo esta herramienta es más rápida: sin instalación, sin configuración, sin subidas. Ten en cuenta que los tamaños reales de transferencia serán aún menores cuando el servidor aplique gzip o Brotli, así que el porcentaje que se muestra aquí es el ahorro bruto antes de la compresión. Tu código nunca sale de tu dispositivo.',
    faqs: [
      { q: '¿Cómo minifico JavaScript online?', a: 'Pega tu JavaScript en el cuadro de entrada, o sube un archivo .js o .mjs. La versión minificada aparece al instante, con el conteo de bytes antes y después y el porcentaje ahorrado. Copia el resultado o descárgalo como script.min.js. Nada se sube: la minificación corre en tu navegador.' },
      { q: '¿Es seguro minificar JavaScript? ¿Cambia cómo funciona mi código?', a: 'No. Terser convierte tu código en un árbol de sintaxis real antes de cambiar nada, así solo acorta nombres de variables locales y nunca toca globales, propiedades de objetos, cadenas, template literals ni expresiones regulares. Plegar constantes y quitar código muerto preserva el comportamiento. Si tu código tiene un error de sintaxis, la herramienta muestra el mensaje de error de Terser y no devuelve nada, así el código roto nunca te llega en silencio.' },
      { q: '¿Cuál es la diferencia entre minificar y ofuscar?', a: 'Minificar reduce el código para que rinda mejor: nombres más cortos, sin comentarios, sin espacios de más. Ofuscar esconde a propósito lo que hace el código, con trucos como aplanar el flujo de control y cifrar cadenas. Los nombres acortados no son seguridad: cualquiera puede pasar el código por un embellecedor y leerlo de nuevo, así que nunca uses la minificación para esconder secretos o claves de API.' },
      { q: '¿Cuándo uso un bundler en lugar de esta herramienta?', a: 'Usa un bundler como esbuild, webpack, Rollup o Vite cuando tu proyecto tiene muchos archivos, imports, paquetes npm, división de código o mapas de origen. Para un solo archivo que quieres más pequeño ahora mismo, pégalo aquí: sin instalación, sin configuración, sin subidas, y el resultado está listo en un segundo.' },
      { q: '¿Mi código sale de mi navegador?', a: 'No. La minificación y el embellecimiento corren localmente en tu navegador con Terser. Tu código nunca se sube, se guarda ni lo ve nadie más, así que la herramienta es segura para código privado, aunque igual conviene no pegar secretos reales donde no hace falta.' },
      { q: '¿Soporta TypeScript o JSX?', a: 'No, esta herramienta solo trabaja con JavaScript, incluyendo sintaxis ES2020 y módulos ES. TypeScript y JSX hay que compilarlos primero a JavaScript con tsc, Babel o esbuild, y luego puedes minificar el resultado aquí.' },
    ],
  },
];
