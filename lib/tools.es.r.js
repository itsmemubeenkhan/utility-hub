/* Spanish (US) translations - batch R (markdown to html converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_R = [
  {
    slug: 'convertidor-de-markdown-a-html',
    enSlug: 'markdown-to-html',
    lastReviewed: '2026-10-31',
    name: 'Convertidor de Markdown a HTML',
    tagline: 'Convierte Markdown a HTML limpio y seguro en tu navegador: vista previa en vivo, código HTML, tablas GFM, listas de tareas y bloques de código, con copia y descarga .html independiente.',
    category: 'Herramientas para Desarrolladores',
    badge: 'U1',
    calcKey: 'markdownStats',
    customComponent: 'markdown-converter',
    inputs: [],
    metaTitle: 'Convertidor de Markdown a HTML Online Gratis: Vista Previa en Vivo',
    metaDescription:
      'Convertidor de Markdown a HTML gratis en línea: pega Markdown para obtener HTML limpio y sanitizado con vista previa en vivo, tablas GFM, listas de tareas y bloques de código. Corre 100% en tu navegador, nada se sube, sin registro.',
    keywords: 'markdown a html, convertidor markdown a html, convertir markdown a html, markdown a html online, conversor de markdown, vista previa markdown online, md a html',
    explainer:
      'Markdown es texto plano con algunos símbolos para la estructura: # para un encabezado, - para un elemento de lista, acentos graves para código. HTML es lo que el navegador realmente lee: encabezados <h1>, listas <ul>, elementos <table>. Un convertidor de Markdown a HTML lee el Markdown, descubre su estructura y escribe los elementos HTML correspondientes. Como HTML es aquello para lo que se creó Markdown, esta es la conversión más directa del conjunto.\n\nEjemplo concreto: pega "# Markdown a HTML, de un vistazo" seguido de una lista de tareas y una tabla pequeña, y la herramienta produce <h1>Markdown a HTML, de un vistazo</h1>, una <ul> con elementos de lista con casillas, y una <table> real con <thead> y <tbody>. Un bloque delimitado marcado ```js se convierte en <pre><code class="language-js">, así que los resaltadores de sintaxis lo reconocen automáticamente. La vista previa en vivo muestra exactamente cómo se ve el resultado, mientras la pestaña de código HTML muestra el marcado para copiar en un CMS, un editor de blog o una plantilla de correo.\n\nDos cosas hacen este convertidor más seguro que pegar documentos en un sitio cualquiera. Primero, todo corre localmente en tu navegador: el documento nunca se sube, guarda ni registra. Segundo, la salida está sanitizada por construcción: cualquier HTML escrito en la entrada se escapa, nunca se ejecuta, así que una etiqueta <script> suelta en un documento pegado se vuelve texto inofensivo en lugar de ejecutar código. El HTML que copies es seguro para pegar en WordPress, Ghost o cualquier CMS que acepte HTML crudo. Para la dirección inversa, combina esta herramienta con el Formateador JSON y las herramientas Base64 del mismo grupo para desarrolladores.',
    faqs: [
      { q: '¿Cómo convierto Markdown a HTML?', a: 'Pega tu Markdown en el panel izquierdo. La vista previa y el código HTML se actualizan al instante, sin botón. Pulsa Copiar HTML para tomar el marcado, o Descargar .html para guardar un documento independiente completo con estilos básicos.' },
      { q: '¿Qué sintaxis Markdown es soportada?', a: 'Encabezados, párrafos, negrita, cursiva, tachado, código en línea, enlaces, imágenes, listas ordenadas y sin orden, citas, reglas horizontales, bloques de código delimitados con pista de lenguaje, y los extras de GitHub Flavored Markdown: tablas, listas de tareas y autoenlaces.' },
      { q: '¿El HTML resultante es seguro para pegar en mi blog?', a: 'Sí. Cualquier HTML escrito en la entrada se escapa antes de convertir, así que solo las etiquetas que este convertidor genera pueden aparecer en la salida. Ningún script, iframe o atributo de evento puede sobrevivir, lo que hace el resultado seguro para un CMS o editor de blog.' },
      { q: '¿Cuál es la diferencia entre Markdown y HTML?', a: 'Markdown es una sintaxis ligera de escritura en texto plano creada por John Gruber en 2004; HTML es el lenguaje de marcado que los navegadores renderizan. Markdown fue diseñado para convertirse a HTML, así que un convertidor asigna cada construcción Markdown a su elemento HTML correspondiente.' },
      { q: '¿Puedo convertir un archivo .md?', a: 'Sí. Usa Subir archivo .md para cargar un archivo Markdown desde tu dispositivo, o pega su contenido directamente. La conversión sigue corriendo por completo en tu navegador, así que el archivo nunca sale de tu máquina.' },
      { q: '¿Algo de lo que pego se sube o se guarda?', a: 'No. Toda la conversión corre localmente en tu navegador sin viaje al servidor, sin cuenta y sin almacenamiento. Cerrar la página descarta todo lo que escribiste.' },
    ],
  },
];
