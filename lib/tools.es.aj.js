/* Spanish (US) translations - batch AJ (ASCII Art Generator).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AJ = [
  {
    slug: 'generador-de-arte-ascii',
    enSlug: 'ascii-art-generator',
    lastReviewed: '2026-11-18',
    name: 'Generador de Arte ASCII',
    tagline: 'Convierte cualquier imagen en arte ASCII en línea gratis, o escribe una palabra y obtén un banner de texto: arrastra una foto, elige un conjunto de caracteres, ajusta el ancho, el brillo y el contraste, y copia o descarga el resultado como texto o PNG. 100% en tu navegador, nada se sube.',
    category: 'Herramientas de Imagen',
    badge: 'Aa',
    calcKey: 'asciiArtStats',
    customComponent: 'ascii-art',
    inputs: [],
    metaTitle: 'Generador de Arte ASCII Gratis - Imagen a Arte ASCII en Línea [Sin Registro]',
    metaDescription:
      'Generador de arte ASCII gratis: convierte cualquier imagen en arte ASCII en línea, o escribe una palabra y obtén un banner de texto. 4 conjuntos, modo color, copiar, descargar .txt o PNG.',
    keywords: 'generador de arte ascii, imagen a ascii, texto a ascii, arte ascii online, foto a arte ascii, banner ascii, convertir imagen a ascii, arte ascii gratis',
    explainer:
      'Un generador de arte ASCII convierte una imagen en texto: lee el brillo de cada píxel y lo reemplaza con un carácter de una rampa que va de claro a oscuro, así las zonas oscuras se vuelven caracteres densos como @ y # mientras las claras se vuelven un punto o un espacio, y la imagen reaparece en texto plano. Este funciona de dos maneras. Suelta, pega o elige una imagen en PNG, JPG, WebP o GIF y se muestrea en vivo en tu navegador, o cambia al modo Texto, escribe una palabra, y el mismo motor la convierte en un banner grande en negrita. Controlas el ancho de 40 a 200 caracteres, cuatro conjuntos de caracteres (Estándar, Detallado, Bloques y Simple), invertir, brillo y contraste, y un modo color que pinta cada carácter con el color de su propio píxel para que las fotos sigan siendo reconocibles incluso en tamaños pequeños.\n\nLa calidad del resultado depende de la fuente y de los ajustes. Las fotos de alto contraste con un sujeto claro funcionan mejor: un retrato con fondo simple, un logo, o una foto de tu mascota. Los fondos con mucho detalle se vuelven ruido, así que recorta la imagen primero con el Redimensionador de Imágenes o comprímela con el Compresor de Imágenes antes de convertirla. Detallado da el sombreado más suave con unos 70 caracteres, Estándar es el aspecto clásico de 10 pasos, Bloques es mejor para pósters llamativos, y Simple es una rampa de 4 pasos que se lee bien en chats y comentarios. Los caracteres monoespaciados son casi el doble de altos que de anchos, así que la altura se reduce a la mitad de forma automática para que la imagen no se estire, y los conteos de caracteres y líneas bajo la vista previa te dicen exactamente qué tan grande es el resultado.\n\nTodo corre en tu navegador: la imagen se dibuja en un canvas, se muestrea píxel por píxel, y se convierte en caracteres en tu dispositivo, así que tus fotos nunca se suben, se guardan ni las ve nadie más. Copia el arte como texto para pegarlo en un comentario, un README, un banner de terminal o un mensaje de chat, descárgalo como archivo .txt, o descárgalo como imagen PNG con los mismos caracteres en una fuente monoespaciada limpia. Si necesitas que la imagen original sea más pequeña primero, usa el Compresor de Imágenes, y si quieres compartir el arte como un código escaneable, prueba el Generador de Códigos QR.',
    faqs: [
      { q: '¿Cómo convierto una imagen en arte ASCII?', a: 'Suelta la imagen en la página, pégala desde el portapapeles, o haz clic para elegir un archivo (PNG, JPG, WebP o GIF). El arte aparece al instante. Ajusta el deslizador de ancho, prueba el conjunto Detallado para un sombreado más suave, y copia el resultado o descárgalo como .txt o PNG.' },
      { q: '¿Cuál es la mejor imagen para arte ASCII?', a: 'Las fotos de alto contraste con un solo sujeto claro: un retrato con fondo simple, un logo, o una foto de tu mascota. Los fondos con mucho detalle se vuelven ruido. Recorta la imagen primero y mantén el ancho entre 80 y 120 caracteres para un buen equilibrio entre detalle y legibilidad.' },
      { q: '¿Cómo hago un banner de texto ASCII?', a: 'Cambia al modo Texto, escribe una palabra o frase corta, y la herramienta la dibuja en una fuente grande en negrita, luego la muestrea con el mismo motor de brillo. Prueba el conjunto Bloques para un aspecto de póster, o Estándar para un banner clásico, luego cópialo o descárgalo como .txt o PNG.' },
      { q: '¿Cuál es la diferencia entre los conjuntos de caracteres?', a: 'Estándar es la rampa clásica de 10 pasos, de espacio a @. Detallado usa unos 70 caracteres para el sombreado más suave. Bloques usa solo bloques de sombra para pósters llamativos. Simple es una rampa de 4 pasos que se mantiene legible en chats y comentarios donde las líneas largas se cortan.' },
      { q: '¿Por qué mi arte ASCII se ve estirado o aplastado?', a: 'Los caracteres monoespaciados son casi el doble de altos que de anchos, así que la herramienta reduce la altura a la mitad de forma automática. Si aún se ve mal, cambia el deslizador de ancho: un arte más ancho conserva más detalle pero hace líneas más largas, y un arte más angosto es más grueso. Invertir también ayuda cuando un sujeto claro está sobre un fondo oscuro.' },
      { q: '¿Mi imagen se sube a algún lado?', a: 'No. La imagen se dibuja en un canvas y se muestrea por completo en tu navegador. Nunca se envía a un servidor, se guarda ni la ve nadie más, así que las fotos privadas se quedan en tu dispositivo.' },
    ],
  },
];
