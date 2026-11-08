/* Spanish (US) translations - batch Z (YAML to JSON converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_Z = [
  {
    slug: 'convertidor-de-yaml-a-json',
    enSlug: 'yaml-to-json-converter',
    lastReviewed: '2026-11-08',
    name: 'Convertidor de YAML a JSON',
    tagline: 'Convierte YAML a JSON y JSON a YAML en tu navegador: conversión en dos direcciones con resultados en vivo, soporte multidocumento, errores exactos de línea y columna, archivos de ejemplo de Kubernetes y Docker Compose, copiar y descargar, 100% privado.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Yl',
    calcKey: 'yamlStats',
    customComponent: 'yaml-convert',
    inputs: [],
    metaTitle: 'Convertidor de YAML a JSON Online: Convierte YAML a JSON Gratis [Sin Registro]',
    metaDescription:
      'Convertidor de YAML a JSON gratis: convierte YAML a JSON y JSON a YAML online con soporte multidocumento, posiciones exactas de error y archivos de ejemplo. 100% en tu navegador, sin registro.',
    keywords: 'convertidor yaml a json, yaml a json online, convertir yaml a json, convertidor json a yaml, convertidor yaml online, analizador yaml online, validador yaml',
    explainer:
      'YAML es el formato de configuración de la infraestructura moderna: los manifiestos de Kubernetes, los archivos de Docker Compose, los flujos de GitHub Actions e innumerables configuraciones de aplicaciones son todos YAML, mientras que la mayoría de las APIs, los scripts y las herramientas de datos hablan JSON. Mover datos entre los dos a mano es lento y propenso a errores, un solo espacio mal puesto cambia la estructura. Este conversor lo hace al instante y en vivo: pega YAML y el JSON aparece mientras escribes, o cambia la dirección y pega JSON para obtener YAML legible en estilo de bloque. Todo corre en tu navegador, así que tus archivos de configuración nunca salen de tu dispositivo.\n\nEl conversor maneja los archivos reales que la gente pega. El YAML multidocumento, donde varios documentos viven en un archivo separados por líneas ---, se convierte en un arreglo JSON con una entrada por documento. Las anclas y los alias, los atajos &nombre y *nombre que YAML usa para no repetir bloques, se expanden en valores simples en el JSON. En la otra dirección, el JSON se convierte en YAML limpio con sangría, con listas como elementos con guion y objetos anidados como mapas con sangría, listo para pegar en un manifiesto. Puedes elegir sangría JSON de 2 o 4 espacios, o salida minificada para pegar en un script, y cuando algo está mal el error indica la línea y la columna exactas, además de qué salió mal, así que una sangría mala o un corchete sin cerrar es una corrección de un minuto en vez de un juego de adivinanzas.\n\nUn detalle de tipos vale la pena conocerlo antes de convertir. Los analizadores de YAML 1.1 convertían palabras simples como yes, no, on y off en booleanos, y así los archivos de configuración ganaban valores true por sorpresa. El esquema central de YAML 1.2, que sigue esta herramienta, trata esas palabras como cadenas simples, así que yes sigue siendo la cadena "yes" y solo true y false se vuelven booleanos. Si un valor debe ser una palabra literal, ponlo entre comillas en el YAML y sobrevivirá al viaje de ida y vuelta en cualquier caso. Para el trabajo diario, eso significa que los archivos de Kubernetes y Compose se convierten limpiamente aquí, el JSON de una API se vuelve configuración que sí se puede leer, y nada de lo que pegues se sube o se guarda jamás.',
    faqs: [
      { q: '¿Para qué sirve un convertidor de YAML a JSON?', a: 'Convierte archivos de configuración YAML en datos JSON y viceversa. Los desarrolladores lo usan para inspeccionar manifiestos de Kubernetes y archivos de Docker Compose como JSON, para alimentar configuración YAML a scripts y APIs que esperan JSON, y para convertir el JSON de una API en configuración YAML legible. Esta herramienta hace ambas direcciones, en vivo, en tu navegador.' },
      { q: '¿Cómo funcionan los archivos YAML multidocumento aquí?', a: 'Un archivo YAML puede contener varios documentos separados por líneas que solo tienen ---. Este conversor analiza cada documento y devuelve un arreglo JSON con una entrada por documento, en orden. Al convertir ese arreglo de vuelta a YAML, los documentos se escriben de nuevo con separadores ---.' },
      { q: '¿Funcionan las anclas y los alias?', a: 'Sí. Las anclas (&nombre) y los alias (*nombre) son una función de YAML para reutilizar un bloque en vez de repetirlo, y las claves de fusión (<<: *nombre) pliegan un mapa dentro de otro. El conversor las expande en valores simples en la salida JSON, así que los datos son idénticos sin atajos que solo existen en YAML.' },
      { q: '¿Por qué yes, no, on u off cambiaron de tipo en mi conversión?', a: 'Esa es la diferencia entre YAML 1.1 y 1.2. Los analizadores antiguos de YAML 1.1 convertían yes, no, on y off sin comillas en booleanos, lo cual sorprendía a mucha gente cuando un valor de configuración se volvía true en silencio. El esquema central de YAML 1.2, que sigue esta herramienta, trata esas palabras como cadenas simples, así que solo true y false se vuelven booleanos. Si quieres decir la palabra literal, ponla entre comillas en YAML ("yes") y seguirá siendo una cadena en cualquier analizador.' },
      { q: '¿Mi YAML se sube a algún lugar?', a: 'No. La conversión, el análisis y los informes de error corren localmente en tu navegador con js-yaml. Tus archivos nunca se suben, se guardan ni los ve nadie más, lo cual hace que la herramienta sea segura para archivos de configuración con nombres de host internos, secretos o credenciales, aunque igual deberías evitar pegar secretos reales donde no sea necesario.' },
    ],
  },
];
