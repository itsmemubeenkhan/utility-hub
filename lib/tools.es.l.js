/* Spanish (US) translations - batch L (base64 encoder/decoder).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_L = [
  {
    slug: 'codificador-base64',
    enSlug: 'base64-encoder-decoder',
    lastReviewed: '2026-10-25',
    name: 'Codificador y Decodificador Base64',
    tagline: 'Codifica texto a Base64 o decodifícalo de vuelta, seguro con UTF-8: alfabetos estándar y seguro para URL, control de relleno, archivo a Base64 y decodificar URI de datos, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'B6',
    calcKey: 'base64Stats',
    customComponent: 'base64-encode',
    inputs: [],
    metaTitle: 'Codificador y Decodificador Base64 Online Gratis: Seguro UTF-8, URL, Archivo a Base64',
    metaDescription:
      'Codificador y decodificador Base64 gratis en línea: codifica texto a Base64 o decodifícalo, seguro con UTF-8 para emoji y texto en otros idiomas, variante segura para URL, archivo a Base64, decodificar URI de datos. Privado, sin registro.',
    keywords: 'codificador base64, decodificador base64, codificar base64, base64url, archivo a base64, decodificar base64 online, base64 a texto',
    explainer:
      'Base64 convierte cualquier byte en texto ASCII simple para que datos binarios puedan viajar por sistemas que solo manejan texto: cargas JSON, adjuntos de correo, URI de datos, tokens JWT y archivos de configuración. Esta herramienta codifica texto a Base64 y decodifica Base64 de vuelta a texto, todo en tu navegador. Pega una cadena, elige Codificar o Decodificar, y copia el resultado. El modo archivo codifica cualquier archivo local a su cadena Base64, y al pegar una URI de datos solo se decodifica la parte después de la coma.\n\nEl detalle que rompe a la mayoría de herramientas rápidas es la codificación de caracteres. Los codificadores ingenuos basados en la vieja función btoa corrompen todo fuera de Latin-1: emoji, letras acentuadas y escrituras de otros idiomas vuelven dañados. Esta herramienta convierte el texto a bytes UTF-8 reales primero, así que hindi, acentos del español y emoji sobreviven intactos. Ejemplo concreto: la palabra Authgear se codifica como QXV0aGdlYXI=, y la palabra hindi नमस्ते se codifica como 4KSo4KSu4KS44KWN4KSk4KWH. Al decodificar se aceptan cadenas con o sin el relleno = final, y la variante segura para URL cambia + por - y / por _, que es el alfabeto que usan los JWT y tokens OAuth.\n\nUna advertencia honesta pertenece a cada página de Base64: Base64 no es cifrado. Cualquiera puede decodificar una cadena Base64 en un segundo, así que nunca lo uses para ocultar una contraseña, clave de API o secreto. Su trabajo es el transporte, no el secreto. Para tokens y cargas de API que estás depurando, el diseño en el navegador importa: nada de lo que pegas se sube, así que inspeccionar una carga Base64 sospechosa de un registro o correo queda privado en tu máquina.',
    faqs: [
      { q: '¿Cómo codifico texto a Base64?', a: 'Pega o escribe tu texto, mantén Codificar seleccionado y copia la salida. La herramienta codifica bytes UTF-8 reales, así que emoji, acentos y texto en otros idiomas sobreviven al viaje de ida y vuelta.' },
      { q: '¿Cómo decodifico una cadena Base64?', a: 'Cambia a Decodificar y pega la cadena. El relleno (=) es opcional, y las URI de datos también funcionan: pega el valor completo data:...;base64,... y solo se decodifica la carga. Si el resultado no es texto UTF-8 válido (por ejemplo una imagen decodificada), la herramienta muestra un error claro en vez de basura.' },
      { q: '¿Cuál es la diferencia entre Base64 y Base64URL?', a: 'Base64URL cambia + por - y / por _, y normalmente quita el relleno =, así la cadena es segura dentro de URLs y nombres de archivo. Marca la casilla segura para URL al codificar para un JWT, token OAuth o parámetro de URL; al decodificar se acepta cualquiera de los dos alfabetos automáticamente.' },
      { q: '¿Por qué falló mi decodificación?', a: 'Normalmente un carácter extra: un espacio dentro de la cadena, un carácter faltante, o texto que nunca fue Base64. El decodificador también rechaza cadenas cuyos bytes no son texto UTF-8 válido, lo que pasa al decodificar la carga de un archivo (como una imagen) como texto.' },
      { q: '¿Puedo codificar un archivo a Base64?', a: 'Sí. Usa el selector de archivo al final de la herramienta: el archivo se lee localmente en tu navegador y su cadena Base64 aparece en la salida. Nada se sube a ningún servidor.' },
      { q: '¿Base64 es cifrado?', a: 'No. Base64 es codificación reversible para transporte, no secreto: cualquiera puede decodificarlo al instante. Nunca lo uses para ocultar contraseñas, claves de API u otros secretos.' },
    ],
  },
];
