/* Spanish (US) translations - batch AK (Markdown Table Generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AK = [
  {
    slug: 'generador-de-tablas-markdown',
    enSlug: 'markdown-table-generator',
    lastReviewed: '2026-11-19',
    name: 'Generador de Tablas Markdown',
    tagline: 'Crea una tabla Markdown en línea gratis con una cuadrícula estilo hoja de cálculo: escribe en las celdas, agrega filas y columnas, fija la alineación por columna, pega CSV o una tabla Markdown existente, y copia el Markdown o descárgalo como archivo .md, con vista previa en vivo. 100% en tu navegador, nada se sube.',
    category: 'Herramientas de Desarrollo',
    badge: 'T#',
    calcKey: 'markdownTableStats',
    customComponent: 'markdowntable-generator',
    inputs: [],
    metaTitle: 'Generador de Tablas Markdown Gratis - Crea Tablas en Línea [Sin Registro]',
    metaDescription:
      'Generador de tablas Markdown gratis: crea tablas en una cuadrícula, pega CSV o una tabla existente, fija la alineación por columna, y copia Markdown limpio con vista previa en vivo. Corre en tu navegador.',
    keywords: 'generador de tablas markdown, crear tabla markdown, tabla markdown online, editor de tablas markdown, csv a tabla markdown, formato tabla markdown, generador de tablas gfm',
    explainer:
      'Una tabla Markdown es texto plano con barras verticales: la primera línea tiene los encabezados, la segunda línea es una fila de guiones que separa el encabezado del cuerpo, y cada línea después de esa es una fila de la tabla. La fila de guiones tiene doble función: :--- alinea una columna a la izquierda, :---: la centra, y ---: la alinea a la derecha, así la alineación forma parte de la tabla misma y no es un ajuste aparte. Las barras dentro de una celda se escapan como \\| para que queden dentro de la celda en vez de dividirla, y las celdas vacías son solo dos barras sin nada entre ellas. GitHub, GitLab y la mayoría de los renderizadores Markdown leen este formato exacto, por eso es la forma estándar de poner una tabla en un README, un pull request o una wiki.\n\nEscribir barras y guiones a mano se vuelve tedioso rápido, sobre todo cuando una columna crece y el texto deja de alinearse. Este generador te da una cuadrícula estilo hoja de cálculo: haz clic en una celda y escribe, pulsa Tab o Enter para pasar a la siguiente celda, agrega o quita filas y columnas, y elige la alineación de cada columna en el menú sobre ella. Si los datos ya existen en otro lado, pégalos: las celdas de hoja de cálculo y el texto CSV o TSV se detectan automáticamente, los campos entre comillas con comas dentro se mantienen juntos, y una tabla Markdown existente se puede pegar y convertir en la cuadrícula, alineación incluida, para que puedas editar una tabla que escribió otra persona. La salida Markdown queda rellenada para que cada columna se alinee en el texto, y la vista previa muestra la tabla tal como aparecerá.\n\nTodo corre en tu navegador: la tabla se construye en tu dispositivo, así tus datos nunca se suben, se guardan ni los ve nadie más. Copia el Markdown para pegarlo en un README, un issue de GitHub, una página de Notion o un blog, o descárgalo como archivo .md para guardarlo con tu proyecto. Si necesitas la tabla terminada como página web, convierte el Markdown con la herramienta Markdown a HTML, y si tus datos de origen son JSON y no una hoja de cálculo, conviértelos primero en filas con el Convertidor de JSON a CSV.',
    faqs: [
      { q: '¿Cómo creo una tabla Markdown?', a: 'Escribe tus encabezados y valores en la cuadrícula, agrega filas o columnas según necesites, y la salida Markdown se actualiza en vivo. Cópiala o descárgala como archivo .md. También puedes pegar datos CSV o TSV, o una tabla Markdown existente, y la cuadrícula se llena sola.' },
      { q: '¿Cómo alineo las columnas de una tabla Markdown?', a: 'Usa el menú de alineación sobre cada columna: Izquierda, Centro o Derecha. La herramienta escribe la fila separadora que corresponde: :--- para izquierda, :---: para centro, y ---: para derecha. La vista previa muestra la alineación tal como la mostrará GitHub.' },
      { q: '¿Puedo pegar una hoja de cálculo o un CSV en el generador de tablas?', a: 'Sí. Copia celdas de Excel o Google Sheets, o pega texto CSV o TSV, en el cuadro de pegado y pulsa Importar CSV / TSV. El delimitador se detecta automáticamente, y los campos entre comillas que contienen comas se mantienen juntos. La primera fila se convierte en el encabezado.' },
      { q: '¿Puedo editar una tabla Markdown existente?', a: 'Sí. Pega la tabla Markdown en el cuadro de pegado y pulsa Importar tabla Markdown. La cuadrícula se llena con ella, incluida la alineación por columna leída de la fila separadora, así puedes cambiar celdas, agregar filas y exportar Markdown limpio.' },
      { q: '¿Qué pasa con las barras verticales dentro de una celda?', a: 'Una barra dentro de una celda se escapa como \\| en la salida, así queda dentro de la celda en vez de dividirla en dos columnas. Cuando pegas una tabla Markdown de vuelta, esas barras escapadas se restauran como barras normales en la cuadrícula.' },
      { q: '¿Dónde puedo usar la tabla Markdown generada?', a: 'En cualquier lugar donde funcione Markdown con sabor a GitHub: archivos README, issues y pull requests de GitHub, wikis de GitLab, páginas de Notion, y la mayoría de generadores de sitios estáticos y herramientas de documentación. Si necesitas HTML, pega la salida en la herramienta Markdown a HTML.' },
    ],
  },
];
