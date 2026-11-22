/* Spanish (US) translations - batch AN (JSON to YAML Converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AN = [
  {
    slug: 'convertidor-de-json-a-yaml',
    enSlug: 'json-to-yaml-converter',
    lastReviewed: '2026-11-22',
    name: 'Convertidor de JSON a YAML',
    tagline: 'Convierte JSON a YAML en línea gratis: pega JSON o sube un archivo .json y obtén YAML en vivo con sangría de 2 o 4 espacios, orden alfabético de claves, estilo de bloque o de flujo, errores exactos, copiar y descarga .yaml. 100% en tu navegador, sin registro.',
    category: 'Herramientas de Desarrollo',
    badge: 'JY',
    calcKey: 'jsonToYamlStats',
    customComponent: 'jsontoyaml-convert',
    inputs: [],
    metaTitle: 'Convertidor de JSON a YAML Gratis en Línea [Sin Registro]',
    metaDescription:
      'Convertidor de JSON a YAML gratis: convierte JSON a YAML en línea con sangría, orden de claves y estilo de bloque o de flujo, errores exactos, copiar y descarga .yaml. 100% en tu navegador, sin registro.',
    keywords: 'convertidor de json a yaml, convertir json a yaml, json a yaml online, json a yaml gratis, convertidor json yaml, convertir archivo json a yaml, json a yml, yaml converter',
    explainer:
      'JSON es el formato de datos de las API, los scripts y los registros, mientras YAML es el formato de configuración de los manifiestos de Kubernetes, los archivos de Docker Compose y los flujos de GitHub Actions. Mover datos entre los dos a mano es lento y propenso a errores: una sangría perdida cambia la estructura, y una palabra simple como yes puede cambiar de significado por completo. Este conversor lo hace al instante y en vivo: pega JSON o sube un archivo .json y aparece YAML legible mientras escribes, listo para pegar en un manifiesto. Todo corre en tu navegador, así que tus datos nunca salen de tu dispositivo.\n\nTres opciones controlan la salida. Elige sangría de 2 o 4 espacios para igualar el estilo que tu proyecto ya usa. Activa el orden alfabético de claves cuando quieras una salida estable y fácil de comparar, por ejemplo cuando la misma configuración se genera en distintas máquinas y la diferencia debe mostrar solo cambios reales. Elige el estilo de bloque para el diseño legible de una clave por línea, o el estilo de flujo cuando un valor corto pertenece a una sola línea dentro de un script o un mensaje de chat. Cuando el JSON está roto, el error indica la línea y la columna exactas además de qué salió mal, así una coma que falta o un corchete sin cerrar se arregla en un minuto. Copia el YAML o descárgalo como archivo .yaml, y el panel de conteos muestra claves, líneas y caracteres en vivo.\n\nUna regla de comillas vale la pena conocer antes de convertir. YAML lee las palabras simples por su forma, así que yes y on parecen booleanos para los analizadores antiguos, 123 parece un número, y a: b parece un mapa anidado. Este conversor entrecomilla exactamente esos valores, y solo esos, así cada cadena vuelve a ser cadena y cada número vuelve a ser número. Las palabras simples no necesitan comillas y quedan sin ellas. Si necesitas el sentido contrario, el Convertidor de YAML a JSON lleva YAML de vuelta a JSON con el mismo reporte exacto de errores, y el Formateador JSON limpia el JSON desordenado antes de convertirlo.',
    faqs: [
      { q: '¿Cómo convierto JSON a YAML en línea?', a: 'Pega tu JSON en el cuadro de entrada, o sube un archivo .json. El YAML aparece en vivo mientras escribes, con la sangría, el orden de claves y el estilo que elijas. Copia el resultado o descárgalo como archivo .yaml. Nada se sube: la conversión corre en tu navegador.' },
      { q: '¿Cuál es la diferencia entre el estilo de bloque y el estilo de flujo en YAML?', a: 'El estilo de bloque escribe una clave por línea con sangría, que es el predeterminado legible para archivos de configuración. El estilo de flujo escribe todo el valor en una línea con llaves y corchetes, como {"name": "my-app"}, útil para valores cortos que se pegan en un script o un mensaje. Ambos guardan exactamente los mismos datos.' },
      { q: '¿Por qué algunas de mis cadenas llevan comillas en el YAML?', a: 'Un valor se entrecomilla solo cuando YAML lo leería como otra cosa. Las palabras yes, no, on y off parecen booleanos para los analizadores YAML 1.1 antiguos, 123 parece un número, y a: b parece un mapa anidado, así que todos llevan comillas. Las palabras simples como my-app no necesitan comillas y quedan sin ellas, y cada valor entrecomillado vuelve a leerse como la misma cadena.' },
      { q: '¿Qué hace la opción de ordenar claves?', a: 'Escribe las claves de los objetos en orden alfabético, en todos los niveles de anidación, así los mismos datos siempre producen el mismo archivo. Eso hace que las diferencias sean limpias cuando una configuración se genera en distintas máquinas o se guarda en control de versiones, porque solo aparecen los cambios reales y no claves reordenadas.' },
      { q: '¿Qué pasa si mi JSON tiene un error?', a: 'La herramienta muestra la línea y la columna exactas del primer problema, además del mensaje del analizador, por ejemplo una coma que falta o un corchete sin cerrar. Corrige ese punto y el YAML aparece de inmediato. Las causas comunes son comas finales, comillas simples alrededor de las cadenas y claves sin comillas, ninguna de las cuales es JSON válido.' },
      { q: '¿Mi JSON se sube a algún servidor?', a: 'No. El análisis y la conversión corren localmente en tu navegador con js-yaml. Tus datos nunca se suben, se guardan ni los ve nadie más, lo que hace la herramienta segura para archivos de configuración con nombres de host internos o credenciales, aunque igual debes evitar pegar secretos reales donde no haga falta.' },
    ],
  },
];
