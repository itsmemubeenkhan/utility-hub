/* Spanish (US) translations - batch Q (jwt decoder).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_Q = [
  {
    slug: 'decodificador-jwt',
    enSlug: 'jwt-decoder',
    lastReviewed: '2026-10-30',
    name: 'Decodificador JWT',
    tagline: 'Decodifica un JSON Web Token en tu navegador: lee su header y payload, ve cada claim con fechas legibles de expiración y emisión, y detecta riesgos de alg none y tokens expirados antes de que lleguen a producción.',
    category: 'Herramientas para Desarrolladores',
    badge: 'U1',
    calcKey: 'jwtStats',
    customComponent: 'jwt-decoder',
    inputs: [],
    metaTitle: 'Decodificador JWT Online Gratis: Decodifica Header, Payload y Expiración',
    metaDescription:
      'Decodificador JWT gratis en línea: pega un token para decodificar su header y payload, leer cada claim, revisar su expiración y detectar riesgos de alg none. Corre 100% en tu navegador, nada se sube, sin registro.',
    keywords: 'decodificador jwt, decodificar jwt, decodificador de token jwt, jwt decoder online, leer payload jwt, verificar expiración jwt, decodificar token jwt gratis',
    explainer:
      'Un JSON Web Token, o JWT, es un token compacto con tres partes Base64URL separadas por puntos: header.payload.signature. El header nombra el algoritmo de firma y el tipo de token, el payload lleva los claims (para quién es el token, cuándo se emitió, cuándo expira), y la firma prueba que las dos primeras partes no fueron alteradas. Decodificar no es desencriptar: Base64URL solo cambia cómo se ven los bytes, así que cualquiera que tenga un token puede leer su header y payload. Por eso existe esta herramienta, para mostrarte qué contiene realmente un token antes de confiar en él.\n\nEjemplo concreto: carga el token de ejemplo y el header decodifica a {"alg":"HS256","typ":"JWT"}, es decir HMAC con SHA-256, mientras el payload decodifica a {"sub":"1234567890","name":"John Doe","iat":1516239022}. El claim iat es un timestamp Unix, así que la herramienta lo muestra como 18 de enero de 2018, 01:30:22 UTC, la misma conversión que hace el Convertidor de Timestamp Unix. Cada claim de tiempo del payload (exp, iat, nbf, auth_time) recibe la misma representación legible, y el banner de estado responde la pregunta que los desarrolladores realmente hacen: ¿este token expiró, aún no es válido, o sigue vigente?\n\nTres cosas hacen este decodificador más seguro que pegar tokens en un sitio cualquiera. Primero, todo corre localmente en tu navegador: el token nunca se sube, guarda ni registra, así que un token filtrado no puede filtrarse más a través de esta página. Segundo, el panel de advertencias marca los casos peligrosos a simple vista: alg "none" significa que el token no está firmado y nunca se debe confiar en él, y un claim exp ausente significa que el token nunca expira por sí solo. Tercero, la firma se muestra pero con la etiqueta honesta de solo lectura: verificar una firma necesita el secreto o la llave pública del servidor, y cualquier herramienta que afirme verificar sin uno está adivinando. Para una verificación real, mantén el secreto en el servidor, donde pertenece.',
    faqs: [
      { q: '¿Cómo decodifico un token JWT?', a: 'Pega el token completo (header.payload.signature) en la herramienta y pulsa Decodificar. El header y el payload se muestran como JSON con formato, cada claim aparece en una tabla, y los claims de tiempo como exp e iat se muestran como fechas legibles.' },
      { q: '¿Un JWT está encriptado?', a: 'No. Un JWT estándar está firmado, no encriptado. La codificación Base64URL solo cambia cómo se ven los bytes, así que cualquiera que tenga el token puede decodificar y leer su header y payload. Nunca pongas secretos, contraseñas ni datos personales sensibles en los claims de un JWT.' },
      { q: '¿Esta herramienta verifica la firma?', a: 'No, y es deliberado. Verificar una firma necesita el secreto del servidor (para HMAC) o la llave pública (para RSA/ECDSA), y esos deben quedarse en el servidor. Esta herramienta decodifica y muestra el token para que lo inspecciones; el segmento de firma se muestra solo como referencia.' },
      { q: '¿Qué significa alg none?', a: 'Significa que el token no está firmado: ninguna firma lo protege. Algunos servidores han aceptado históricamente tokens alg none por error, lo que permite falsificar un token. Si ves alg none en un token que tu app aceptó, trátalo como un error de seguridad, no como una curiosidad.' },
      { q: '¿Cómo sé si un JWT expiró?', a: 'Lee el claim exp: es un timestamp Unix del momento en que el token deja de ser válido. Esta herramienta compara exp con la hora actual y etiqueta el token como Válido, Expirado o Aún no válido (cuando nbf está en el futuro), con la expiración mostrada como fecha legible.' },
      { q: '¿Es seguro pegar un token de producción aquí?', a: 'La decodificación corre por completo en tu navegador, así que el token nunca se sube ni se registra en esta página. Aun así, un token de producción en vivo es una credencial: prefiere un token de prueba y sigue tu propia política de seguridad antes de pegar cualquier token en cualquier sitio web.' },
    ],
  },
];
