/* Spanish (US) translations - batch AI (Hash Generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AI = [
  {
    slug: 'generador-de-hash',
    enSlug: 'hash-generator',
    lastReviewed: '2026-11-17',
    name: 'Generador de Hash',
    tagline: 'Genera hashes MD5, SHA-1, SHA-256, SHA-384 y SHA-512 en línea gratis: escribe texto o suelta un archivo y obtén los cinco a la vez, con HMAC, salida hex o Base64 y un modo de comparación para verificar un hash. 100% en tu navegador, nada se sube.',
    category: 'Herramientas para Desarrolladores',
    badge: 'H#',
    calcKey: 'hashStats',
    customComponent: 'hash-gen',
    inputs: [],
    metaTitle: 'Generador de Hash en Línea Gratis - MD5, SHA-1, SHA-256, SHA-512 [Sin Registro]',
    metaDescription:
      'Generador de hash en línea gratis: escribe texto o suelta un archivo y obtén MD5, SHA-1, SHA-256, SHA-384 y SHA-512 a la vez, en hex o Base64, con HMAC opcional y un modo de comparación para verificar un hash. 100% en tu navegador, nada se sube.',
    keywords: 'generador de hash, hash md5 online, generador sha256, hash sha-1, generador sha512, texto a hash, verificar hash de archivo, generador hmac, calcular md5 online',
    explainer:
      'Un generador de hash convierte cualquier texto o archivo en una huella corta de longitud fija, llamada hash o resumen, que cambia por completo cuando cambia aunque sea un carácter de la entrada. La misma entrada siempre produce el mismo hash, y el hash no se puede revertir para recuperar el texto original, por eso los hashes aparecen en todas partes: verificar un archivo descargado contra su checksum publicado, guardar contraseñas de forma segura (con un hash lento con sal, nunca MD5 simple), firmar peticiones de API con HMAC, y comprobar que un documento no fue alterado. Escribe o pega texto aquí, o suelta un archivo, y esta herramienta calcula cinco hashes a la vez: MD5, SHA-1, SHA-256, SHA-384 y SHA-512.\n\nLos cinco algoritmos no son iguales, y elegir el correcto importa. MD5 (128 bits) y SHA-1 (160 bits) son rápidos y aún sirven para checksums simples, pero ambos están rotos para seguridad: los investigadores pueden crear dos archivos distintos con el mismo hash MD5 o SHA-1, así que nunca confíes en ellos para probar que un archivo es auténtico o que una contraseña es segura. SHA-256 (256 bits) es el valor por defecto de todos los días para checksums, verificación de archivos y la mayoría de firmas de API, mientras que SHA-384 y SHA-512 son sus hermanos más fuertes para casos que necesitan un resumen más largo. El modo HMAC agrega una clave secreta al hash, que es como los servidores prueban que una petición realmente vino de alguien con la clave, y el modo de comparación pega un hash esperado, adivina su algoritmo por la longitud, y te dice claramente si coincide o no.\n\nTodo corre en tu navegador: la familia SHA usa el Web Crypto integrado de tu navegador, MD5 corre con una pequeña implementación en JavaScript puro en esta página, y ningún texto o archivo se sube, se guarda ni lo ve nadie más. Esa privacidad es el punto: puedes hashear un documento, un archivo de configuración o una cadena secreta sin enviarlo a un servidor. Copia cualquier hash por separado, copia los cinco a la vez, o cambia la salida entre hex (las habituales letras minúsculas y dígitos) y Base64 (más corto, útil para APIs). Si necesitas convertir texto en una codificación reversible, usa el Codificador Base64, y si necesitas un secreto aleatorio para usar como clave HMAC, genera uno con el Generador de Contraseñas.',
    faqs: [
      { q: '¿Cómo genero un hash en línea?', a: 'Escribe o pega tu texto en el cuadro, o cambia al modo Archivo y suelta un archivo. MD5, SHA-1, SHA-256, SHA-384 y SHA-512 aparecen al instante, cada uno con su propio botón de copiar, además de un botón para copiarlos todos. Nada se sube: cada hash se calcula en tu navegador.' },
      { q: '¿Qué algoritmo de hash debería usar?', a: 'SHA-256 es el valor por defecto de todos los días: fuerte, ampliamente compatible y la opción correcta para checksums de archivos, verificación y la mayoría de firmas. Usa SHA-384 o SHA-512 cuando necesites un resumen más largo. MD5 y SHA-1 solo sirven por compatibilidad con checksums viejos, porque ambos están rotos para seguridad y se pueden falsificar con colisiones.' },
      { q: '¿Cuál es la diferencia entre MD5 y SHA-256?', a: 'MD5 produce un hash hex de 32 caracteres y es rápido pero está roto: los atacantes pueden crear dos archivos distintos con el mismo MD5. SHA-256 produce un hash hex de 64 caracteres, es mucho más fuerte, y no se conoce ninguna colisión práctica. Para cualquier cosa relacionada con seguridad, usa siempre SHA-256 o más fuerte, nunca MD5.' },
      { q: '¿Cómo verifico un archivo con un hash?', a: 'Suelta el archivo en el modo Archivo y copia el hash del algoritmo que usó quien lo publicó, normalmente SHA-256. Compáralo con el checksum que publicó: si cada carácter coincide, el archivo está intacto. El modo de comparación lo hace por ti: pega el hash esperado y te dice COINCIDE o NO COINCIDE, y adivina el algoritmo por la longitud del hash.' },
      { q: '¿Qué es HMAC y cuándo lo necesito?', a: 'HMAC mezcla una clave secreta en el hash, así que solo alguien con la clave puede producir el mismo resultado. Las APIs usan HMAC-SHA-256 para firmar peticiones y probar que vinieron de un remitente confiable. Activa el modo HMAC, escribe tu clave secreta, y la herramienta calcula HMAC-MD5, HMAC-SHA-256, HMAC-SHA-384 y HMAC-SHA-512 para tu entrada.' },
      { q: '¿Mi texto o archivo se sube a algún lado?', a: 'No. El hashing corre por completo en tu navegador: la familia SHA usa Web Crypto y MD5 corre en JavaScript puro en esta página. Tu texto y tus archivos nunca se envían a un servidor, se guardan ni los ve nadie más, así que los documentos privados y los secretos se quedan en tu dispositivo.' },
    ],
  },
];
