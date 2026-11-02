/* Spanish (US) translations - batch T (cron expression builder).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. */
export const TOOLS_ES_T = [
  {
    slug: 'generador-de-expresiones-cron',
    enSlug: 'cron-expression-builder',
    lastReviewed: '2026-11-02',
    name: 'Generador de Expresiones Cron',
    tagline: 'Crea un horario cron de 5 campos sin memorizar la sintaxis: controles por campo, explicacion en lenguaje claro, proximas 5 ejecuciones y una linea de crontab copiable, todo en tu navegador.',
    category: 'Herramientas para Desarrolladores',
    badge: 'Cr',
    calcKey: 'cronStats',
    customComponent: 'cron-builder',
    inputs: [],
    metaTitle: 'Generador de Expresiones Cron Online Gratis: Crea y Explica Horarios Crontab',
    metaDescription:
      'Generador de expresiones cron gratis en linea: crea un horario crontab de 5 campos con controles por campo o pega uno para explicarlo en lenguaje claro, previsualiza las proximas 5 ejecuciones y copia una linea de crontab lista para pegar. Corre 100% en tu navegador, nada se sube, sin registro.',
    keywords: 'generador de expresiones cron, generador cron, creador de crontab, cron expression builder, generador de horarios cron, probar expresion cron, cron job generator',
    explainer:
      'Una expresion cron son cinco campos que le dicen a un programador cuando ejecutar un trabajo: minuto, hora, dia del mes, mes y dia de la semana, en ese orden. El ejemplo clasico, 0 9 * * 1-5, significa en el minuto 0, a la hora 9, cada dia del mes, cada mes, de lunes a viernes: dias de semana a las 9 AM. Los simbolos son todo el lenguaje: * significa cada valor, */15 significa cada 15 valores, 9-17 significa un rango, y 0,30 significa una lista. Los nombres de mes y dia de semana tambien funcionan, asi que 0 0 * * mon es el mismo horario que 0 0 * * 1.\n\nEjemplo concreto: una copia de seguridad nocturna a las 2:30 AM es 30 2 * * *, cinco campos y un comando despues en una linea real de crontab. Un informe cada 15 minutos en horario de oficina entre semana es */15 9-17 * * 1-5. Carga cualquiera de los ajustes predefinidos en el constructor y la pagina te lo explica en lenguaje claro con las proximas cinco ejecuciones, para confirmar el horario antes de que toque produccion. Una trampa clasica: cuando el dia del mes y el dia de la semana estan restringidos a la vez, cron ejecuta el trabajo si coincide CUALQUIERA de los dos, no ambos, asi que 0 0 1 * 0 se dispara el dia 1 del mes Y cada domingo. Otra: una expresion puede tener sintaxis perfecta y aun asi no ejecutarse nunca, como el 31 de febrero, por eso la vista previa busca hacia adelante y te avisa cuando no encuentra ejecuciones.\n\nTres cosas hacen este constructor mas seguro que adivinar la sintaxis de memoria. Primero, cada campo se valida mientras escribes, con valores fuera de rango rechazados en palabras claras en lugar de fallar en silencio a las 2 AM. Segundo, la vista previa de proximas ejecuciones se calcula con las mismas reglas que usa un demonio cron real, incluida la regla O entre dia del mes y dia de la semana, asi que lo que ves es lo que el programador hara. Tercero, todo corre localmente en tu navegador, asi que los horarios de trabajos internos nunca salen de tu maquina. Una advertencia honesta: una expresion cron no lleva zona horaria, asi que la vista previa muestra la zona horaria de tu navegador mientras tu servidor puede correr en UTC; revisa la zona horaria del servidor antes de desplegar, o un trabajo de las 9 AM se vuelve un trabajo de las 2 PM. Combina este constructor con el Convertidor de Timestamp Unix y el Formateador JSON del mismo grupo para desarrolladores.',
    faqs: [
      { q: '¿Como creo una expresion cron?', a: 'Elige un modo para cada uno de los cinco campos: cada valor, cada N valores, valores especificos o un rango. La expresion se actualiza al cambiar los controles, o pega una expresion existente y el constructor sincroniza sus controles con ella. Empieza desde un ajuste como Dias de semana a las 9:00 AM y ajusta un campo a la vez.' },
      { q: '¿Que significan los cinco campos de cron?', a: 'En orden: minuto (0-59), hora (0-23), dia del mes (1-31), mes (1-12), dia de la semana (0-6 donde 0 es domingo, y 7 tambien significa domingo). Asi, 30 2 * * * corre a las 2:30 AM todos los dias, y 0 0 1 * * corre a medianoche el dia 1 de cada mes.' },
      { q: '¿Que significan *, /, - y las comas en cron?', a: '* significa cada valor de ese campo. */15 significa cada 15 valores, desde el minimo del campo. 9-17 significa cada valor del 9 al 17 inclusive. Las comas listan valores especificos, como 0,30 para los minutos 0 y 30. Se combinan, asi que 0,30 9-17 * * 1-5 corre a las :00 y :30 en horario de oficina entre semana.' },
      { q: '¿Cron corre cuando el dia del mes y el dia de la semana estan puestos a la vez?', a: 'Si, cuando coincide cualquiera de los dos. Esta es la regla O clasica de cron y la sorpresa mas comun: 0 0 1 * 0 corre el dia 1 del mes y cada domingo. Si quieres solo el dia 1, deja el dia de la semana como *; si quieres solo los domingos, deja el dia del mes como *.' },
      { q: '¿Por que mi expresion cron valida nunca corre?', a: 'La causa habitual es una fecha que no existe, como el 31 de febrero o el 31 de abril: la sintaxis es legal pero ningun dia del calendario coincide. La vista previa de esta pagina busca unos cinco anos hacia adelante y te avisa cuando no encuentra ejecuciones, asi que los horarios imposibles se detectan antes de desplegar.' },
      { q: '¿Mi horario se sube o se guarda?', a: 'No. Construir, explicar y previsualizar corren localmente en tu navegador sin viaje al servidor, sin cuenta y sin almacenamiento. Cerrar la pagina descarta todo lo que escribiste.' },
    ],
  },
];
