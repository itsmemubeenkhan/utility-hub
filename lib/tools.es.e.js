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
  {
    slug: 'generador-de-recibo-de-pago',
    enSlug: 'pay-stub-generator',
    lastReviewed: '2026-10-18',
    name: 'Generador de recibos de pago',
    tagline: 'Crea un recibo de pago imprimible gratis con tus horas, tarifa y deducciones - con cálculo automático de FICA y columnas del año.',
    category: 'Impuestos',
    badge: 'Pago',
    calcKey: 'payStubStats',
    customComponent: 'pay-stub-generator',
    inputs: [],
    metaTitle: 'Generador de Recibos de Pago Gratis 2026: Crea tu Recibo de Nómina [Sin Registro]',
    metaDescription:
      'Generador de recibos de pago gratis - crea un recibo de nómina imprimible con tu tarifa, horas, horas extra y deducciones. Seguro Social y Medicare automáticos, columnas del año, sin registro, 100% en tu navegador.',
    keywords: 'generador de recibos de pago, generar recibo de pago, recibo de nómina gratis, crear recibo de sueldo, plantilla de recibo de pago, pay stub generator',
    explainer:
      'Un generador de recibos de pago convierte tus datos de pago en el formato clásico de un recibo de nómina: ingresos de un lado, deducciones del otro, pago neto al final. Ingresa tu empleador y el período de pago, luego tus ingresos - tarifa por hora por horas (más horas extra al 1.5x o tu propio multiplicador), un salario por período, bonos, comisiones - y el recibo se arma línea por línea. Las deducciones reciben el mismo trato: impuesto federal y estatal, Seguro Social al 6.2% estándar y Medicare al 1.45% (ambos calculados automáticamente del bruto, o ingresa tus propias cifras), jubilación, seguro médico y lo que sea.\n\nLas dos columnas cuentan la historia real de un pago. El pago bruto es todo lo que ganaste en el período; las deducciones totales es todo lo retenido o aportado; el pago neto es lo que realmente llega a tu cuenta. El generador también muestra la tasa efectiva de deducción - la parte del bruto que nunca te llega - que es el número que importa al comparar ofertas de trabajo o negociar aumentos. Agrega los acumulados del año (bruto y deducciones) y el recibo lleva columnas de año, igual que los recibos de tu empleador. El botón Imprimir recibo produce un formato limpio de una página, y Copiar resumen pone los tres números clave en tu portapapeles para hojas de cálculo o trámites.\n\nUna nota honesta: esta es una herramienta de registros personales y estimaciones, no un documento legal de nómina. Los recibos reales vienen del sistema de nómina de tu empleador con las tablas fiscales exactas, y los bancos verifican ingresos por su cuenta - nunca uses un recibo generado para falsear ingresos, eso es fraude. Como cada herramienta de este sitio, todo corre localmente en tu navegador: tu nombre, tus cifras de pago y tus deducciones nunca salen de tu dispositivo.',
    faqs: [
      { q: '¿Cómo creo un recibo de pago para mi sueldo?', a: 'Completa tu empleador, el período de pago y tus ingresos (tarifa por hora y horas, o salario por período, más horas extra, bonos o comisiones), luego tus deducciones. La vista previa se actualiza al instante - usa Imprimir recibo para una copia limpia de una página.' },
      { q: '¿Calcula el Seguro Social y Medicare automáticamente?', a: 'Sí - Seguro Social al 6.2% y Medicare al 1.45% del pago bruto se calculan solos. Desmarca la opción automática si tu caso difiere (por ejemplo, ya superaste el tope anual del Seguro Social) e ingresa las cifras manualmente.' },
      { q: '¿Cómo se manejan las horas extra?', a: 'Ingresa las horas extra y el multiplicador - 1.5x es el estándar federal para trabajadores por hora no exentos. El generador multiplica tu tarifa por las horas y el multiplicador, y muestra la línea de horas extra por separado.' },
      { q: '¿Puedo agregar los acumulados del año?', a: 'Sí - ingresa tu bruto acumulado y tus deducciones acumuladas de tu último recibo y la vista previa lleva columnas de año, igual que los recibos de tu empleador.' },
      { q: '¿Es un recibo legal para préstamos o rentas?', a: 'No. Es para registros personales y estimaciones. Los bancos y arrendadores verifican ingresos por su cuenta (nómina, impuestos, estados de cuenta). Nunca uses un recibo generado para falsear ingresos - eso es fraude.' },
      { q: '¿Mis datos de pago se suben a algún servidor?', a: 'No. El recibo se genera por completo en tu navegador con JavaScript. Tu nombre, tus cifras de pago y tus deducciones nunca salen de tu dispositivo.' },
    ],
  },
  {
    slug: 'generador-de-contrasenas-aleatorias',
    enSlug: 'password-generator',
    lastReviewed: '2026-10-18',
    name: 'Generador de Contraseñas Aleatorias',
    tagline: 'Genera contraseñas aleatorias fuertes y frases de paso memorables - seguro, 100% en tu navegador.',
    category: 'Herramientas de Seguridad',
    badge: 'Cl',
    calcKey: 'passwordStats',
    customComponent: 'password-generator',
    inputs: [],
    metaTitle: 'Generador de Contraseñas Aleatorias 2026: Claves Seguras Gratis [Sin Registro]',
    metaDescription:
      'Generador de contraseñas aleatorias gratis - claves seguras con crypto.getRandomValues y modo de frase de paso. Sin registro, sin rastreo, 100% en tu navegador.',
    keywords: 'generador de contraseñas aleatorias, crear contraseña segura online, generador de claves seguras sin registro, generador de contraseñas seguras, crear clave segura',
    explainer:
      'El cerebro humano es pésimo generando aleatoriedad, y los atacantes lo saben. Elegimos nombres de mascotas, cumpleaños y secuencias de teclado como qwerty123, agregamos un signo de exclamación y lo llamamos seguro. Las herramientas para romper contraseñas prueban exactamente esos patrones primero: por eso una contraseña ingeniosa como "Sol2024!" cae en segundos, mientras que una contraseña realmente aleatoria de 20 caracteres tardaría más que la edad del universo en adivinarse. La aleatoriedad lo es todo: cada carácter extra multiplica el trabajo de adivinanza, y con 20 caracteres de mayúsculas, minúsculas, números y símbolos obtienes unos 129 bits de entropía. El problema solía ser memorizarla, pero no necesitas memorizar contraseñas aleatorias. Ese es el trabajo de tu gestor de contraseñas.\n\nLa entropía es la forma honesta de comparar la fortaleza, y es más simple de lo que suena: cada bit duplica el número de intentos que necesita un atacante. Una contraseña aleatoria de 12 caracteres tiene unos 78 bits, una de 16 unos 104, y una de 20 unos 129. Las frases de paso juegan el mismo juego con palabras: cuatro palabras aleatorias de una lista de 900 dan unos 39 bits, suficientes contra ataques de adivinanza en línea, mientras que seis a ocho palabras llegan a 59-78 bits para las cuentas importantes. El medidor de fortaleza muestra este número en vivo mientras cambias opciones. Cualquiera de los dos estilos supera a cualquier contraseña inventada por un humano, porque los humanos repiten patrones y los sorteos aleatorios no.\n\nLa configuración práctica es aburrida a propósito: un gestor de contraseñas (hay buenos gratis) con una contraseña aleatoria única para cada sitio, más verificación en dos pasos en las cuentas clave: correo, banco y todo lo ligado a dinero. La reutilización es el verdadero peligro: una contraseña filtrada de un foro jamás debería abrir tu correo. En cuanto a este generador, todo ocurre localmente en tu navegador con crypto.getRandomValues, la misma fuente aleatoria criptográficamente segura que usan los navegadores. Tus contraseñas nunca se envían a un servidor, nunca se registran ni se almacenan. Puedes desconectarte de internet y seguir generando. Copia el resultado en tu gestor y cierra la pestaña.',
    faqs: [
      { q: '¿Qué tan aleatorias son las contraseñas?', a: 'Se generan con crypto.getRandomValues, el generador criptográficamente seguro del navegador, no el predecible Math.random(). Cada carácter se elige de forma independiente, con la entropía completa que muestra el medidor. Sin semilla adivinable, sin patrones.' },
      { q: '¿Contraseña o frase de paso?', a: 'Para la mayoría de cuentas, una contraseña aleatoria de 20 caracteres es lo más fuerte y vive en tu gestor de todos modos. Las frases de paso (4 a 8 palabras aleatorias) son mejores cuando un humano debe escribirla o recordarla, como el WiFi que compartes con visitas o tu contraseña maestra. Ambas superan a cualquier contraseña inventada.' },
      { q: '¿Qué tan larga debe ser mi contraseña?', a: 'Al menos 16 caracteres para cuentas importantes, 20 o más para correo, banco y tu acceso maestro. Debajo de 12 caracteres, hasta las aleatorias se vuelven adivinables para atacantes con recursos. La longitud importa más que los símbolos exóticos.' },
      { q: '¿Es seguro generar contraseñas en un sitio web?', a: 'En este sí, porque la generación ocurre por completo en tu navegador: la contraseña nunca viaja por la red ni se almacena. Desconfía de generadores que piden cuenta o muestran anuncios junto a tu contraseña nueva. Si eres muy cauteloso, desconéctate de internet y genera sin conexión.' },
      { q: '¿Puedo usarlas para WiFi, banco y correo?', a: 'Sí. Copia la contraseña en la página de tu router para el WiFi (el modo de frase es más amable cuando las visitas deben escribirla) y usa contraseñas largas y aleatorias para banco y correo. Guárdalas en un gestor: una contraseña fuerte que no puedes recuperar es una cuenta bloqueada.' },
      { q: '¿Almacenan o ven las contraseñas que genero?', a: 'No. No hay cuenta, ni base de datos, ni registro ligado a tus contraseñas. El código corre localmente y al cerrar la pestaña la contraseña solo existe donde la pegaste.' },
    ],
  },
];
