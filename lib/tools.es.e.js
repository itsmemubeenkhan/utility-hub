/* Spanish (US) translations - batch E (QR tools).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. Entries carry customComponent
   so the tool page renders the rich QR-tool UI. */
export const TOOLS_ES_E = [
  {
    slug: 'generador-de-codigos-qr',
    enSlug: 'qr-code-generator',
    lastReviewed: '2026-10-18',
    name: 'Generador de códigos QR',
    tagline: 'Crea códigos QR gratis para enlaces, textos e información de contacto - descarga en PNG o SVG, sin registro.',
    category: 'Herramientas QR',
    badge: 'QR',
    calcKey: 'qrCodeStats',
    customComponent: 'qr-code-generator',
    inputs: [
      { key: 'text', label: 'Texto o enlace para codificar', type: 'textarea', default: '', rows: 3, placeholder: 'https://ejemplo.com - o cualquier texto' },
      { key: 'ecc', label: 'Corrección de errores', type: 'select', default: 'M', options: [
        { value: 'L', label: 'Baja (7%)' },
        { value: 'M', label: 'Media (15%)' },
        { value: 'Q', label: 'Alta (25%)' },
        { value: 'H', label: 'Máxima (30%)' },
      ] },
      { key: 'size', label: 'Tamaño de descarga', type: 'select', default: 512, options: [
        { value: 256, label: '256 x 256 px' },
        { value: 512, label: '512 x 512 px' },
        { value: 1024, label: '1024 x 1024 px' },
      ] },
    ],
    metaTitle: 'Generador de Códigos QR Gratis 2026: Crea QR para Enlaces y Texto [Sin Registro]',
    metaDescription:
      'Generador de códigos QR gratis - convierte cualquier enlace o texto en un QR escaneable. Colores personalizados, niveles de corrección de errores, descarga en PNG y SVG. Sin registro, 100% en tu navegador.',
    keywords: 'generador de codigos qr, generador qr gratis, crear codigo qr gratis, qr para enlace, codigo qr sin registro, generador qr personalizado',
    explainer:
      'Un generador de códigos QR convierte cualquier texto o enlace en un cuadrado que la cámara de tu teléfono lee en una fracción de segundo. Escribe o pega en el cuadro de arriba y el código se genera al instante: todos los teléfonos de la última década lo escanean con la cámara normal, sin apps especiales. El uso más común son los enlaces - menús, portafolios, páginas de eventos - pero un QR guarda cualquier texto corto: un cupón de descuento, la URL de una app o una tarjeta de contacto completa.\n\nDos controles separan un buen generador de un juguete. La corrección de errores decide cuánto del código puede dañarse o taparse y seguir funcionando: Media (15%) es el valor diario recomendado, mientras que Alta y Máxima resisten el desgaste impreso, las pegatinas e incluso un pequeño logo al centro. El tamaño de descarga importa para imprimir: 256 px bastan en pantalla, 512 px sirven para volantes y 1024 px se ven nítidos en carteles. La descarga SVG es vectorial, así que escala a cualquier tamaño sin perder nitidez - la opción correcta para imprenta profesional.\n\nTodo ocurre localmente en tu navegador: la imagen QR se calcula en tu dispositivo, nada de lo que codificas se envía a un servidor, y no hay cuenta, marca de agua ni límite de escaneos. Eso también significa que el código nunca caduca ni llama a un servicio de rastreo, a diferencia de algunos generadores "gratis" que pasan los escaneos por sus servidores. Para compartir WiFi, el Generador QR de WiFi crea el formato especial WIFI: e incluso imprime un cartel listo para colgar.',
    faqs: [
      { q: '¿Cómo creo un código QR para un enlace?', a: 'Pega la URL completa (empezando con https://) en el generador de arriba. El QR aparece al instante - descárgalo en PNG o SVG y ponlo en tu volante, menú o empaque.' },
      { q: '¿Los códigos QR gratis caducan?', a: 'Los QR creados aquí no caducan nunca. El patrón codifica tu texto o enlace directamente, sin servidor de rastreo en el medio, así que funciona mientras el enlace funcione.' },
      { q: '¿Qué nivel de corrección de errores elijo?', a: 'Media (15%) para uso diario. Elige Alta (25%) o Máxima (30%) si el código se imprimirá pequeño, estará a la intemperie o llevará un logo al centro - niveles más altos resisten más daño pero guardan menos datos.' },
      { q: '¿Descargo PNG o SVG?', a: 'PNG para pantallas, documentos y redes sociales. SVG para imprenta profesional - es vectorial y se mantiene perfectamente nítido a tamaño cartel.' },
      { q: '¿Puedo poner mi logo en el QR?', a: 'Sí, con una condición: pon un logo pequeño al centro y usa corrección Alta o Máxima para que siga escaneando. Que no cubra más del ~20% del código y prueba el escaneo antes de imprimir.' },
      { q: '¿Mis datos se suben a algún servidor?', a: 'No. El código QR se genera por completo en tu navegador con JavaScript. Lo que codificas nunca sale de tu dispositivo.' },
    ],
  },
  {
    slug: 'generador-qr-wifi',
    enSlug: 'wifi-qr-generator',
    lastReviewed: '2026-10-18',
    name: 'Generador QR de WiFi',
    tagline: 'Comparte tu WiFi con un código QR escaneable - los invitados se conectan sin escribir la contraseña. Imprime un cartel.',
    category: 'Herramientas QR',
    badge: 'Wi',
    calcKey: 'wifiQrStats',
    customComponent: 'qr-wifi-generator',
    inputs: [
      { key: 'ssid', label: 'Nombre de la red WiFi (SSID)', type: 'textarea', default: '', rows: 1, placeholder: 'MiWiFiCasa' },
      { key: 'password', label: 'Contraseña del WiFi', type: 'textarea', default: '', rows: 1, placeholder: 'Tu contraseña del WiFi' },
      { key: 'encryption', label: 'Tipo de seguridad', type: 'select', default: 'WPA', options: [
        { value: 'WPA', label: 'WPA / WPA2 (lo más común)' },
        { value: 'WEP', label: 'WEP (routers viejos)' },
        { value: 'nopass', label: 'Red abierta (sin contraseña)' },
      ] },
      { key: 'hidden', label: 'Red oculta (el SSID no se transmite)', type: 'checkbox', default: false },
    ],
    metaTitle: 'Generador QR de WiFi 2026: Comparte WiFi Sin la Contraseña [Gratis]',
    metaDescription:
      'Generador de código QR para WiFi gratis - los invitados escanean y se unen a tu WiFi al instante, sin escribir contraseñas largas. Funciona con WPA/WPA2, WEP y redes abiertas. Imprime un cartel.',
    keywords: 'generador qr wifi, codigo qr para wifi, qr wifi invitados, compartir wifi qr, cartel qr wifi airbnb, como hacer qr para wifi',
    explainer:
      'Leer una contraseña de 24 caracteres del reverso del router no es hospitalidad. Un QR de WiFi mete el nombre de tu red, la contraseña y el tipo de seguridad en un cuadrado escaneable: el invitado apunta la cámara de su teléfono y se conecta al instante, sin escribir, sin confundir caracteres, sin el clásico "¿eso es un cero o una O?". Los cafés los imprimen en las mesas, los anfitriones de Airbnb los enmarcan junto a la puerta, las oficinas los pegan en las salas de reuniones.\n\nEl generador crea el formato estándar WIFI: que todos los teléfonos entienden - nombre de red (SSID), contraseña y tipo de seguridad (WPA/WPA2 para casi todos los routers modernos, WEP para los viejos, o abierta para redes sin contraseña). Marca "red oculta" si tu router no transmite su nombre y el código lleva esa indicación también. El botón de imprimir cartel genera un letrero limpio y grande con el nombre de tu red y un código de alta resolución, listo para colgar.\n\nUna nota de seguridad: quien escanee el código obtiene tu contraseña en texto plano en su dispositivo, así que trata un QR de WiFi impreso como una llave de repuesto. Para invitados, lo más inteligente en muchos routers es una red de invitados separada - comparte esa por QR y mantén tu red principal privada. Como cada herramienta de este sitio, el código se genera por completo en tu navegador; tu contraseña del WiFi nunca se sube ni se guarda en ningún lado.',
    faqs: [
      { q: '¿Cómo se conectan los invitados con un QR de WiFi?', a: 'Abren la cámara del teléfono y la apuntan al código. Tanto iPhone como Android reconocen los QR de WiFi de forma nativa y muestran "Unirse a la red" - sin apps.' },
      { q: '¿Qué tipo de seguridad elijo?', a: 'WPA / WPA2 cubre prácticamente todos los routers caseros de los últimos 15 años. Elige WEP solo para equipos muy viejos, o "Red abierta" si tu WiFi de verdad no tiene contraseña.' },
      { q: '¿Funciona con redes ocultas?', a: 'Sí - marca "Red oculta" y el código incluye la indicación que los teléfonos necesitan para unirse a un SSID que no se transmite.' },
      { q: '¿Es seguro compartir el WiFi por QR?', a: 'Cómodo sí, pero quien lo escanee aprende tu contraseña. Para visitas, mejor comparte la red de invitados del router en vez de la principal - la mayoría de los routers la ofrecen en pocos clics.' },
      { q: '¿Puedo imprimir el QR para mi café o Airbnb?', a: 'Sí - usa el botón "Imprimir cartel para invitados" para un letrero listo para colgar, o descarga el PNG/SVG para ponerlo en tus menús o libro de bienvenida.' },
      { q: '¿Mi contraseña del WiFi se sube a un servidor?', a: 'No. El código QR se genera localmente en tu navegador; el nombre de tu red y tu contraseña nunca salen de tu dispositivo.' },
    ],
  },
];
