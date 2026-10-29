/* Spanish (US) translations - batch P (unix timestamp converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_P = [
  {
    slug: 'convertidor-de-timestamp-unix',
    enSlug: 'unix-timestamp-converter',
    lastReviewed: '2026-10-29',
    name: 'Convertidor de Timestamp Unix',
    tagline: 'Convierte un timestamp Unix en una fecha legible, o una fecha en un timestamp: segundos, milisegundos, microsegundos y nanosegundos con detección automática, UTC más hora local y 11 zonas horarias extra, tiempo relativo y conversión por lotes, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'U1',
    calcKey: 'timestampStats',
    customComponent: 'timestamp-converter',
    inputs: [],
    metaTitle: 'Convertidor de Timestamp Unix Online Gratis: Epoch a Fecha y Fecha a Epoch',
    metaDescription:
      'Convertidor de timestamp Unix gratis en línea: convierte epoch a una fecha legible o una fecha de vuelta a segundos y milisegundos Unix. Detecta segundos, ms, us y ns, muestra UTC, ISO 8601, hora local y 12 zonas horarias, más conversión por lotes. Privado, sin registro.',
    keywords: 'convertidor de timestamp unix, convertidor epoch, epoch a fecha, timestamp a fecha, fecha a timestamp, convertir timestamp unix, hora unix, convertidor de tiempo epoch',
    explainer:
      'Un timestamp Unix es un solo número entero que cuenta los segundos desde el 1 de enero de 1970, 00:00:00 UTC, el momento llamado epoch Unix. Las APIs, bases de datos, archivos de registro y tokens JWT guardan el tiempo así porque un solo número no depende de zonas horarias, se puede ordenar y comparar fácilmente, pero los humanos no lo leen a simple vista. Esta herramienta convierte en ambas direcciones, por completo en tu navegador. Pega un timestamp y obtén su fecha; ingresa una fecha y obtén su timestamp.\n\nLos timestamps vienen en cuatro unidades y mezclarlas es el error clásico: 10 dígitos significan segundos, el formato que usan la mayoría de APIs y bases de datos; 13 dígitos significan milisegundos, lo que devuelve Date.now() de JavaScript; 16 dígitos significan microsegundos, comunes en registros de alta precisión; 19 dígitos significan nanosegundos, usados por Go y relojes del sistema. Un valor en milisegundos leído como segundos cae en el año 56189, y así se detecta el error. Deja la unidad en detección automática y la herramienta lee la cantidad de dígitos por ti. Ejemplo concreto: 1700000000 tiene 10 dígitos, así que son segundos, y se convierte al martes 14 de noviembre de 2023, 22:13:20 UTC, ISO 8601 2023-11-14T22:13:20.000Z; el mismo momento en milisegundos es 1700000000000.\n\nTres funciones ahorran tiempo real al depurar. Primero, las zonas horarias: el mismo instante se muestra en UTC, en tu hora local y en cualquiera de 11 zonas extra, de Nueva York a Sídney, porque un timestamp de registro que parece incorrecto muchas veces es solo una zona horaria distinta, no un valor erróneo. Segundo, el tiempo relativo: "hace 3 horas" o "en 2 días" responde la pregunta detrás de la mayoría de conversiones, si un token expiró o si un trabajo programado ya se ejecutó. Tercero, el modo por lotes: pega una columna entera de timestamps de un archivo de registro, uno por línea, y obtén cada fecha como una tabla que puedes copiar como CSV, en lugar de convertir valores uno por uno. Nada de lo que ingresas sale de tu máquina en ningún modo, por eso la herramienta es segura para extractos de registros de producción y datos de APIs.',
    faqs: [
      { q: '¿Cómo convierto un timestamp Unix a fecha?', a: 'Pega el número en la herramienta y pulsa Convertir. Detecta automáticamente segundos, milisegundos, microsegundos o nanosegundos según la cantidad de dígitos y muestra la fecha en UTC, ISO 8601, tu hora local y tu zona horaria elegida, más cuánto tiempo pasó o cuánto falta.' },
      { q: '¿Cuál es la diferencia entre timestamps en segundos y en milisegundos?', a: 'Los timestamps en segundos tienen 10 dígitos y los usan la mayoría de APIs, bases de datos y tokens JWT; los de milisegundos tienen 13 dígitos y son lo que devuelve Date.now() de JavaScript. Dividir un valor en milisegundos entre 1000 da segundos. Leer milisegundos como segundos es el error más común con timestamps: ubica la fecha decenas de miles de años en el futuro.' },
      { q: '¿Cómo convierto una fecha a timestamp Unix?', a: 'Cambia a la pestaña Fecha a timestamp, ingresa la fecha y hora, y pulsa Convertir. El resultado se da en segundos, milisegundos y microsegundos Unix. La fecha que ingresas se lee como UTC, así que el timestamp es el mismo sin importar en qué zona horaria estés.' },
      { q: '¿Qué es el epoch Unix?', a: 'El epoch Unix es el 1 de enero de 1970, 00:00:00 UTC. Un timestamp Unix cuenta los segundos (o milisegundos, microsegundos o nanosegundos) transcurridos desde ese momento. Ignora los segundos intercalares y no depende de zonas horarias, por eso todos los lenguajes de programación y bases de datos lo entienden.' },
      { q: '¿Puedo convertir muchos timestamps a la vez?', a: 'Sí. Usa la pestaña Conversión por lotes, pega un timestamp por línea, y pulsa Convertir todos. Cada fila muestra su fecha ISO 8601 y su fecha UTC, y toda la tabla se puede copiar como CSV para una hoja de cálculo o un ticket.' },
      { q: '¿Algo de lo que ingreso se sube o se guarda?', a: 'No. Toda la conversión corre localmente en tu navegador sin viaje al servidor, sin cuenta y sin almacenamiento. Cerrar la página descarta todo lo que ingresaste, por eso la herramienta es segura para extractos de registros de producción.' },
    ],
  },
];
