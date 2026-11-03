/* Spanish (US) translations - batch U (image resizer).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_U = [
  {
    slug: 'redimensionador-de-imagenes',
    enSlug: 'image-resizer',
    lastReviewed: '2026-11-03',
    name: 'Redimensionador de Imágenes Gratis',
    tagline: 'Cambia el tamaño de imágenes JPG, PNG y WebP en tu navegador: dimensiones exactas, solo ancho o alto, escala por porcentaje y plantillas de redes sociales en un clic, con modos de ajuste, relleno y estiramiento, procesamiento por lotes y sin subir nada.',
    category: 'Herramientas de Imagen',
    badge: 'Im',
    calcKey: 'resizeStats',
    customComponent: 'resize-image',
    inputs: [],
    metaTitle: 'Redimensionador de Imágenes Gratis Online: Cambia Tamaño por Píxeles, % o Plantilla [Sin Subir]',
    metaDescription:
      'Redimensionador de imágenes gratis en línea: cambia el tamaño de JPG, PNG y WebP por píxeles exactos, ancho, alto o porcentaje, o con plantillas de Instagram, Facebook, LinkedIn, YouTube y Pinterest. Cambio por lotes en tu navegador, 100% privado, sin subir, sin registro.',
    keywords: 'redimensionador de imágenes, cambiar tamaño de imagen online, redimensionar foto online, redimensionador sin subir, cambiar tamaño para instagram, redimensionador de redes sociales, cambiar tamaño por píxeles, redimensionar por lotes',
    explainer:
      'Un redimensionador de imágenes cambia las dimensiones en píxeles de una foto: hacerla más pequeña para una página que cargue rápido, o darle el tamaño exacto que pide una plataforma. Esta herramienta hace todo el trabajo dentro de tu navegador: suelta archivos JPG, PNG o WebP, elige un modo y descarga las versiones redimensionadas. Nada se sube a un servidor, lo que importa para fotos personales y trabajo de clientes, y además significa que no hay cola, marca de agua ni límite diario.\n\nCinco modos cubren los trabajos reales. El tamaño exacto fija ambas dimensiones, con tres formas de manejar una proporción distinta: ajustar mantiene toda la foto dentro del cuadro, rellenar recorta los bordes para cubrir el cuadro, y estirar fuerza el cuadro exacto. Solo ancho y solo alto escalan un lado y dejan que el otro siga la proporción, así que nada se ve aplastado. El porcentaje reduce o agranda según una parte del original, útil cuando sabes que una foto es el doble de grande de lo necesario. Las plantillas sociales eliminan la búsqueda: publicación e historia de Instagram, publicación de Facebook, banner de LinkedIn, miniatura de YouTube, publicación de X, pin de Pinterest y un tamaño cuadrado de perfil, cada uno con las dimensiones que esas plataformas realmente muestran.\n\nDos detalles separan un buen cambio de tamaño de uno borroso. Primero, esta herramienta nunca agranda por defecto: escalar una imagen pequeña solo inventa píxeles y la suaviza, así que el agrandado queda apagado salvo que marques la casilla. Segundo, cambiar el tamaño y comprimir son trabajos distintos: cambiar el tamaño recorta la cantidad de píxeles, que suele ser la mayor ganancia en tamaño de archivo, mientras la calidad controla qué tan fuerte se aprietan los píxeles restantes. Combina este redimensionador con el Compresor de Imágenes del mismo sitio cuando una foto redimensionada aún deba caber en un límite de tamaño de archivo, por ejemplo un portal que rechaza todo lo que pase de 100 KB.',
    faqs: [
      { q: '¿Cómo cambio una imagen a un tamaño exacto?', a: 'Elige Tamaño exacto, escribe el ancho y el alto en píxeles, y elige cómo encaja la foto en el cuadro: ajustar mantiene toda la foto dentro, rellenar recorta los bordes para cubrir el cuadro, y estirar fuerza las dimensiones exactas. Descarga el resultado en el formato que elijas.' },
      { q: '¿Qué tamaño uso para Instagram, Facebook y YouTube?', a: 'Usa las plantillas incluidas: publicación de Instagram 1080 x 1080, historia de Instagram 1080 x 1920, publicación de Facebook 1200 x 630, banner de LinkedIn 1584 x 396, miniatura de YouTube 1280 x 720, publicación de X 1600 x 900, pin de Pinterest 1000 x 1500, y una foto de perfil cuadrada de 800 x 800.' },
      { q: 'Ajustar vs rellenar vs estirar: ¿cuál elijo?', a: 'Ajustar cuando toda la foto debe seguir visible (puede dejar espacio vacío en un lado del cuadro). Rellenar cuando el cuadro debe quedar completamente cubierto y perder algunos bordes está bien, como en banners y miniaturas. Estirar solo cuando la distorsión no importa, ya que cambia la proporción y puede hacer que personas y texto se vean aplastados o estirados.' },
      { q: '¿Puedo cambiar el tamaño de muchas imágenes a la vez?', a: 'Sí. Suelta un lote completo, fija un modo de cambio y un formato de salida, y descarga cada archivo redimensionado, o usa Descargar todas para tomar el conjunto de una vez. Cada archivo se procesa localmente en tu navegador.' },
      { q: '¿Cambiar el tamaño dejará mi foto borrosa?', a: 'Reducir casi nunca daña la calidad visible: la herramienta elimina píxeles de forma limpia. Agrandar es la dirección riesgosa, ya que los píxeles nuevos hay que inventarlos, por eso el agrandado está apagado por defecto. Para la versión pequeña más nítida, primero cambia el tamaño y luego ajusta la calidad si el archivo aún debe reducirse.' },
      { q: '¿Mis imágenes se suben a algún lado?', a: 'No. El cambio de tamaño corre en tu dispositivo con la API Canvas. Los archivos nunca salen de tu navegador, nunca se guardan en un servidor y nadie más los ve.' },
    ],
  },
];
