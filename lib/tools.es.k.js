/* Spanish (US) translations - batch K (image compressor).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_K = [
  {
    slug: 'compresor-de-imagenes',
    enSlug: 'image-compressor',
    lastReviewed: '2026-10-24',
    name: 'Compresor de Imágenes Gratis',
    tagline: 'Reduce imágenes JPG, PNG y WebP en tu navegador: compresión por lotes, límites de tamaño y modo de tamaño objetivo para límites de portales, sin subir nada y sin registro.',
    category: 'Herramientas de Imagen',
    badge: 'Im',
    calcKey: 'imageStats',
    customComponent: 'image-compress',
    inputs: [],
    metaTitle: 'Compresor de Imágenes Gratis 2026: Comprime JPG, PNG, WebP Online [Sin Subir]',
    metaDescription:
      'Comprime imágenes gratis en línea: reduce JPG, PNG y WebP en tu navegador, carga por lotes, controles de calidad y tamaño, comprime a 100KB. 100% privado, sin subir, sin registro.',
    keywords: 'compresor de imágenes, comprimir imagen online, reducir tamaño de imagen, comprimir jpg a 100kb, comprimir png online, reducir tamaño de foto',
    explainer:
      'Un compresor de imágenes reduce el archivo de una foto para que suba más rápido, quepa en un límite de adjunto o cargue más rápido en una página web. Esta herramienta hace todo el trabajo dentro de tu navegador: suelta archivos JPG, PNG o WebP, elige un nivel de calidad y un ancho y alto máximos, y descarga las versiones más pequeñas. Nada se sube a un servidor, lo que importa para fotos personales, escaneos de documentos y trabajo de clientes, y además significa que no hay cola, marca de agua ni límite diario.\n\nDos controles deciden el resultado. La calidad es la palanca grande para fotos: JPEG al 80 a 85 por ciento se ve igual que el original en pantalla mientras reduce el archivo a una fracción de su tamaño, y WebP logra archivos aún más pequeños en navegadores que lo soportan. Cambiar el tamaño es la segunda palanca: una foto de teléfono de 4000 píxeles mostrada a 800 píxeles de ancho lleva cinco veces los píxeles que necesita, así que fijar una dimensión máxima muchas veces reduce el archivo más que cualquier ajuste de calidad. PNG no tiene pérdida, así que sigue siendo grande para fotos; es la opción correcta solo para capturas de pantalla, logos y gráficos con colores planos.\n\nEl modo de tamaño objetivo está construido para el problema exacto que crean los portales de empleo y exámenes: un formulario que rechaza todo lo que pase de 100 KB. Elige el objetivo y la herramienta busca niveles de calidad, luego reduce la imagen paso a paso, hasta que el archivo cabe, y te dice con claridad cuando ni los ajustes mínimos lo alcanzan. El modo por lotes comprime toda una carpeta de fotos a la vez, así que un conjunto de fotos de producto o un paquete de documentos escaneados queda listo en una sola pasada.',
    faqs: [
      { q: '¿Cómo comprimo una imagen a menos de 100 KB?', a: 'Elige el objetivo "Menos de 100 KB", suelta tu imagen y comprime. La herramienta prueba primero niveles de calidad más bajos, luego reduce la imagen hasta que cabe, e informa si se alcanzó el objetivo. Desde una foto de teléfono, 100 KB suele ser alcanzable sin daño visible.' },
      { q: '¿Comprimir reduce la calidad visible?', a: 'Con calidad JPEG de 80 a 85 por ciento, casi nunca en pantalla: las diferencias están por debajo de lo que la mayoría de ojos nota. Por debajo de 60 por ciento, los degradados y el texto fino empiezan a mostrar artefactos, así que quédate por encima para fotos que te importan. La herramienta siempre muestra los tamaños antes y después para que juzgues el equilibrio.' },
      { q: 'JPEG, PNG o WebP: ¿qué formato de salida elijo?', a: 'JPEG para fotos (archivos pequeños y compatibles en todos lados), WebP para los archivos más pequeños cuando el destino lo soporta (la mayoría de sitios web y apps modernas lo hacen), PNG solo para capturas, logos y gráficos con bordes nítidos o transparencia, ya que PNG sigue siendo grande para fotos.' },
      { q: '¿Por qué cambiar el tamaño reduce más que bajar la calidad?', a: 'El tamaño del archivo escala con la cantidad de píxeles. Reducir ambas dimensiones a la mitad deja la cuarta parte de los píxeles, así que una foto de 4000 píxeles reducida a 2000 es más o menos la cuarta parte de los datos antes de que la calidad entre en juego. Primero cambia el tamaño, luego ajusta la calidad.' },
      { q: '¿Mis imágenes se suben a algún lado?', a: 'No. La compresión corre en tu dispositivo con la API Canvas. Los archivos nunca salen de tu navegador, nunca se guardan en un servidor y nadie más los ve.' },
      { q: '¿Puedo comprimir muchas imágenes a la vez?', a: 'Sí. Suelta un lote completo, fija una política de calidad y tamaño, y descarga cada archivo comprimido, o usa Descargar todas para tomar el conjunto de una vez.' },
    ],
  },
];
