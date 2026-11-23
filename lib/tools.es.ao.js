/* Spanish (US) translations - batch AO (Binary to Text Converter).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_AO = [
  {
    slug: 'convertidor-de-binario-a-texto',
    enSlug: 'binary-to-text-converter',
    lastReviewed: '2026-11-23',
    name: 'Convertidor de Binario a Texto',
    tagline: 'Convierte binario a texto y texto a binario en línea gratis: pega ceros y unos o escribe cualquier texto y obtén el resultado en vivo, con detección automática de dirección, UTF-8 o ASCII de 7 bits, una tabla de bytes en binario, hex y decimal, posiciones exactas de errores, copiar y descarga .txt. 100% en tu navegador, sin registro.',
    category: 'Herramientas de Desarrollo',
    badge: '01',
    calcKey: 'binaryStats',
    customComponent: 'binary-convert',
    inputs: [],
    metaTitle: 'Convertidor de Binario a Texto Gratis en Línea [Sin Registro]',
    metaDescription:
      'Convertidor de binario a texto gratis: convierte binario a texto y texto a binario en línea con soporte UTF-8, detección automática de dirección, modo ASCII de 7 bits, una tabla de bytes en binario, hex y decimal, posiciones exactas de errores, copiar y descarga. 100% en tu navegador, sin registro.',
    keywords: 'convertidor de binario a texto, convertidor de texto a binario, traductor binario, decodificador binario, binario a texto online, texto a binario online, convertir binario a español, ascii a binario, binario a ascii',
    explainer:
      'Las computadoras guardan cada letra como un número, y el binario es ese número escrito con solo dos dígitos, 0 y 1. Este conversor traduce en ambos sentidos: escribe texto normal y lee su binario, o pega binario y lee el texto de vuelta, con la dirección detectada automáticamente según lo que escribas. Escribe "Hola" y obtienes 01001000 01101111 01101100 01100001, un grupo de 8 bits por byte; pega esos grupos de vuelta y "Hola" regresa. Todo corre en tu navegador, así que nada de lo que escribes se sube ni se guarda.\n\nLa codificación es UTF-8, que es el detalle que separa un conversor correcto de uno roto. Los conversores de solo ASCII tratan cada carácter como un byte, así que una letra acentuada como é o un emoji se convierte en basura sin avisar. UTF-8 les da a esos caracteres los dos, tres o cuatro bytes que realmente necesitan, así café, naïve y una mano saludando sobreviven el viaje de ida y vuelta tal cual. Un modo ASCII de 7 bits está para la forma clásica de los libros de texto, y rechaza los caracteres no ASCII con un error nombrado en vez de deformarlos. Se aceptan binario con espacios, con comas, continuo y con prefijos 0b, y un dígito extraño o un grupo final corto se reporta en su posición exacta en vez de adivinarse.\n\nLa tabla de bytes bajo el conversor muestra cómo se guarda cada carácter: su punto de código Unicode más cada byte en binario, hex y decimal, así un problema de tarea o una sesión de depuración se revisa carácter por carácter. Usa el Codificador Base64 cuando los datos deban viajar dentro de texto, el Codificador de URL cuando pertenezcan a un enlace, y el Convertidor de Hex a RGB cuando los bytes sean un color.',
    faqs: [
      { q: '¿Cómo convierto binario a texto?', a: 'Pega el código binario en el cuadro de entrada, con grupos separados por espacios, comas o nada, y el texto aparece en vivo mientras escribes. Cada grupo debe tener 8 bits para el modo UTF-8 o 7 bits para el modo ASCII. Los prefijos 0b están bien, y la dirección se detecta automáticamente, así nunca tienes que elegir un modo primero.' },
      { q: '¿Cómo convierto texto a binario?', a: 'Escribe o pega texto normal y el binario aparece en vivo, un grupo de 8 bits por byte UTF-8, separados por espacios. Elige comas o sin separador si necesitas otro formato, y cambia al modo ASCII de 7 bits para la forma clásica de los libros de texto. Copia el resultado o descárgalo como archivo .txt.' },
      { q: '¿Por qué mi texto con acentos o emoji necesita UTF-8?', a: 'ASCII cubre solo los primeros 128 caracteres, así que un conversor de solo ASCII no tiene forma de escribir é o un emoji y suele convertirlos en signos de interrogación. UTF-8 escribe esos caracteres con dos a cuatro bytes cada uno, que es como se guardan en todas partes, así se decodifican de vuelta exactamente como los escribiste. Este conversor usa UTF-8 por defecto.' },
      { q: '¿Cuál es la diferencia entre binario de 8 bits y de 7 bits?', a: 'Los grupos de 8 bits son bytes, la unidad que las computadoras realmente guardan, y cubren cada carácter a través de UTF-8. Los grupos de 7 bits son la forma ASCII más antigua, un grupo por carácter, y solo funcionan para los 128 caracteres ASCII. Usa 8 bits a menos que un libro de texto o una tarea pida 7 bits específicamente.' },
      { q: '¿Qué significa "grupo incompleto"?', a: 'Significa que el último grupo de bits es más corto de lo que el modo necesita, por ejemplo 7 bits en modo de 8 bits. Cuenta los bits del grupo final: un cero inicial que falta es la causa habitual, así 1001000 en modo de 8 bits debe ser 01001000. El mensaje de error indica la posición exacta para que lo corrijas en segundos.' },
      { q: '¿Mi texto se sube a algún servidor?', a: 'No. La codificación y decodificación corren localmente en tu navegador con TextEncoder y TextDecoder integrados. Nada de lo que escribes se sube, se guarda ni lo ve nadie más, lo que hace la herramienta segura para binario copiado de registros o capturas de paquetes.' },
    ],
  },
];
