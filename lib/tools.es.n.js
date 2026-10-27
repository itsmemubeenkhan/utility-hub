/* Spanish (US) translations - batch N (text diff checker).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_N = [
  {
    slug: 'comparador-de-textos',
    enSlug: 'text-diff-checker',
    lastReviewed: '2026-10-27',
    name: 'Comparador de Textos',
    tagline: 'Compara dos textos en una sola vista: líneas añadidas en verde, líneas eliminadas en rojo, las palabras exactas que cambiaron resaltadas dentro de líneas modificadas, opciones para ignorar espacios y mayúsculas, y un diff unificado descargable, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'U1',
    calcKey: 'diffStats',
    customComponent: 'diff-checker',
    inputs: [],
    metaTitle: 'Comparador de Textos Online Gratis: Compara Dos Textos, Diferencias por Línea y Palabra',
    metaDescription:
      'Comparador de textos gratis en línea: compara dos textos y ve cada línea añadida y eliminada, con las palabras exactas que cambiaron resaltadas, opciones para ignorar espacios y mayúsculas, y un diff unificado descargable. Privado, sin registro.',
    keywords: 'comparador de textos, comparar textos online, diff checker online, encontrar diferencias entre dos textos, comparar dos documentos online, herramienta de comparación de textos',
    explainer:
      'Leer dos versiones largas del mismo documento lado a lado es la forma en que se escapan los cambios pequeños: un número modificado en un contrato, un párrafo eliminado en un ensayo, una línea equivocada en un archivo de configuración. Un comparador hace la comparación tediosa por ti. Pega el texto original en el cuadro izquierdo y el texto revisado en el derecho, pulsa Comparar, y cada línea añadida aparece en verde, cada línea eliminada en rojo, y las líneas sin cambios quedan simples. Dentro de un par de líneas modificadas, las palabras exactas que difieren están resaltadas, así no relees líneas enteras para encontrar una palabra editada.\\n\\nLa comparación en sí es la misma idea detrás del comando diff de Unix de 1974 y del git diff que los desarrolladores usan cada día: encontrar la secuencia más larga de líneas que ambas versiones comparten, y reportar todo lo demás como una adición o una eliminación. Esta herramienta corre esa comparación por completo en tu navegador, así que los contratos, borradores y archivos de configuración que pegas nunca se suben a ningún lado. Ejemplo concreto: un aviso original que dice "The club meets on Friday at 5 pm." revisado a las 6 pm, con una línea nueva "Sign-up closes on March 1." insertada, produce exactamente un par modificado (5 resaltado en rojo, 6 en verde) y una línea añadida, y el resumen dice 1 línea añadida, 1 línea eliminada, 3 sin cambios.\\n\\nDos opciones ocultan diferencias que no te importan. Ignorar espacios trata las líneas como iguales cuando difieren solo en sangría o espacios finales, que es lo que quieres después de reformatear código o copiar texto entre herramientas que usan tabulaciones o espacios. Ignorar mayúsculas trata London y LONDON como la misma línea, útil para comparar SQL o claves de configuración que fueron puestas en mayúsculas. Activa Mostrar solo los cambios para colapsar tramos largos sin cambios e ir directo a las ediciones. El botón Copiar diff te da un diff unificado (líneas eliminadas marcadas con -, añadidas con +) que puedes pegar en una revisión o ticket, y Descargar .patch guarda la misma salida como archivo.',
    faqs: [
      { q: '¿Cómo comparo dos textos en línea?', a: 'Pega la versión original en el cuadro izquierdo y la versión revisada en el derecho, luego pulsa Comparar. Las líneas eliminadas aparecen en rojo con un menos, las añadidas en verde con un más, y las líneas sin cambios quedan simples. El resumen arriba cuenta líneas añadidas, eliminadas y sin cambios.' },
      { q: '¿Qué significan los resaltados rojos y verdes?', a: 'Rojo significa que la línea estaba en el original pero no en el texto revisado; verde significa que la línea es nueva en el texto revisado. Dentro de un par de líneas modificadas, el resaltado más oscuro marca las palabras exactas que cambiaron, así una edición de una palabra no te obliga a releer toda la línea.' },
      { q: '¿Puedo comparar código, contratos y ensayos con esto?', a: 'Sí, cualquier cosa que sea texto plano: fragmentos de código, archivos de configuración, contratos, ensayos, correos, filas CSV y salida de registros. El formato, las imágenes y los metadatos de cambios controlados no se comparan; pega el texto mismo, no un PDF o archivo de Word.' },
      { q: '¿Qué hace Ignorar espacios?', a: 'Trata dos líneas como iguales cuando difieren solo en espacios iniciales o finales, tabulaciones o espacios repetidos. Úsalo después de reformatear código, o cuando el texto copiado de distintas herramientas mezcla tabulaciones y espacios. El texto original siempre se muestra exactamente como lo pegaste.' },
      { q: '¿Qué hace Ignorar mayúsculas?', a: 'Trata las letras mayúsculas y minúsculas como iguales, así Hello y HELLO cuentan como sin cambios. Es útil para consultas SQL o claves de configuración que fueron puestas en mayúsculas, y también aplica al resaltado por palabras dentro de líneas modificadas.' },
      { q: '¿Algo de lo que pego se sube o se guarda?', a: 'No. La comparación corre localmente en tu navegador sin viaje al servidor, sin cuenta y sin almacenamiento. Cerrar la página descarta ambos textos, por eso la herramienta es segura para contratos, borradores y archivos de configuración.' },
    ],
  },
];
