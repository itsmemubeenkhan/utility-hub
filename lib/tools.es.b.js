/* Spanish (batch B) tool definitions for UtilityHub.
   Entries 7-12 of lib/tools.js, translated to neutral US Spanish.
   calcKey maps to the calculation function in lib/calculations.js.
   Do not edit: key, type, default, min, max, step, option `value` fields. */

export const TOOLS_ES_B = [
  {
    slug: 'calculadora-para-pagar-deudas',
    enSlug: 'debt-payoff-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora para pagar deudas',
    tagline: 'Tu fecha para quedar libre de deudas, el interés total y el plan de pago más rápido.',
    category: 'Deudas',
    badge: 'D',
    calcKey: 'debtpayoff',
    inputs: [
      { key: 'balance', label: 'Saldo total de la deuda ($)', type: 'number', default: 15000, min: 0, step: 500 },
      { key: 'rate', label: 'Tasa de interés anual (APR) (%)', type: 'number', default: 18, min: 0, max: 40, step: 0.5 },
      { key: 'payment', label: 'Pago mensual ($)', type: 'number', default: 400, min: 0, step: 25 },
    ],
    metaTitle: 'Calculadora para pagar deudas: fecha y costo de intereses',
    metaDescription:
      '¿Cuándo quedarás libre de deudas? Ingresa tu saldo, APR y pago mensual para ver tu fecha de pago y el interés total. Calculadora gratuita.',
    keywords: 'calculadora para pagar deudas, cuándo quedaré libre de deudas, plan para pagar deudas',
    explainer:
      'Los pagos mínimos están diseñados para mantenerte endeudado, no para sacarte de la deuda: con un APR alto, pueden estirar el pago por más de una década mientras pagas en intereses varias veces lo que pediste prestado. Esta calculadora para pagar deudas lo aclara todo: ingresa tu saldo, tu APR promedio y el monto mensual que realmente puedes pagar, y simula el pago mes a mes para darte una fecha para quedar libre de deudas, el interés total que pagarás y una gráfica del saldo año por año.\n\nLa idea más importante es el umbral del pago: tu pago debe superar el interés mensual o el saldo nunca se reduce, y la calculadora te avisa claramente si estás por debajo. Por encima de esa línea, cada dólar extra tiene un efecto enorme porque va directo al capital y elimina intereses futuros. Prueba aumentar tu pago en $50 o $100 y mira cómo se acortan los años. Si tienes varias deudas, pasa cada una por la calculadora por separado y ataca primero la del APR más alto (método avalancha) para pagar más rápido en términos matemáticos, o la del saldo más pequeño primero (método bola de nieve) si los logros rápidos te mantienen motivado.',
    faqs: [
      { q: '¿Por qué mi saldo apenas baja con los pagos mínimos?', a: 'La mayor parte del pago mínimo cubre el interés del mes y deja poco para el capital. Con un APR de 18–24%, los pagos mínimos pueden tardar más de 10 años en liquidar un saldo.' },
      { q: '¿Qué pasa si mi pago es menor que el interés mensual?', a: 'El saldo crece en lugar de reducirse (amortización negativa). Debes pagar más que el interés mensual para avanzar.' },
      { q: '¿Bola de nieve o avalancha, cuál es mejor?', a: 'La avalancha (primero el APR más alto) cuesta menos en intereses. La bola de nieve (primero el saldo más pequeño) da victorias psicológicas más rápidas. Ambas superan por años a los pagos mínimos.' },
      { q: '¿Debería consolidar mi deuda primero?', a: 'Si puedes conseguir un préstamo de consolidación con tasa más baja o una transferencia de saldo al 0% y no volverás a endeudar las tarjetas, la consolidación puede reducir mucho el interés total.' },
    ],
  },
  {
    slug: 'calculadora-de-refinanciamiento',
    enSlug: 'refinance-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de refinanciamiento',
    tagline: '¿Conviene refinanciar? Compara pagos, ahorros y punto de equilibrio.',
    category: 'Hipotecas',
    badge: 'R',
    calcKey: 'refinance',
    inputs: [
      { key: 'balance', label: 'Saldo restante del préstamo ($)', type: 'number', default: 350000, min: 0, step: 1000 },
      { key: 'oldRate', label: 'Tasa de interés actual (%)', type: 'number', default: 7.25, min: 0, max: 20, step: 0.125 },
      { key: 'remainingYears', label: 'Años restantes del préstamo actual', type: 'number', default: 25, min: 1, max: 50, step: 1 },
      { key: 'newRate', label: 'Nueva tasa de interés (%)', type: 'number', default: 6, min: 0, max: 20, step: 0.125 },
      { key: 'newTermYears', label: 'Nuevo plazo del préstamo (años)', type: 'number', default: 30, min: 1, max: 50, step: 1 },
      { key: 'closingCost', label: 'Costos de cierre ($)', type: 'number', default: 6000, min: 0, step: 250 },
    ],
    metaTitle: 'Calculadora de refinanciamiento: ahorro y punto de equilibrio',
    metaDescription:
      '¿Deberías refinanciar? Compara tu hipoteca actual con las nuevas condiciones: ahorro mensual, interés total y el punto de equilibrio de los costos de cierre.',
    keywords: 'calculadora de refinanciamiento, calculadora de refinanciamiento hipotecario, punto de equilibrio refinanciamiento',
    explainer:
      'Refinanciar es cambiar tu hipoteca actual por una nueva, normalmente para conseguir una tasa más baja, pero a veces para acortar el plazo o usar el capital acumulado. La oferta siempre destaca el pago mensual más bajo; la trampa son los costos de cierre, normalmente del 2 al 5% del préstamo, que pagas por adelantado. Esta calculadora de refinanciamiento hace la comparación completa: calcula tu pago actual, el nuevo pago, el ahorro mensual y, lo más importante, el punto de equilibrio, es decir, cuántos meses de ahorro necesitas para recuperar los costos de cierre.\n\nEl punto de equilibrio es toda la decisión. Si vendes o te mudas antes de alcanzarlo, refinanciar te hace perder dinero aunque la tasa sea más baja. También cuidado con la trampa del plazo: refinanciar un préstamo con 25 años restantes en uno nuevo de 30 años baja el pago, pero puede aumentar el interés total aunque la tasa sea menor; la calculadora muestra el interés total de ambos préstamos para que lo veas. Una buena regla: refinancia cuando la tasa baje lo suficiente para que el punto de equilibrio quede bien dentro del tiempo que planeas quedarte, y considera un plazo nuevo más corto si el pago aún cabe en tu presupuesto.',
    faqs: [
      { q: '¿Qué es el punto de equilibrio?', a: 'Los costos de cierre divididos entre el ahorro mensual: los meses que tarda el refinanciamiento en pagarse solo. Debes mantener el préstamo más allá del punto de equilibrio para salir ganando.' },
      { q: '¿Cuánto deben bajar las tasas para refinanciar?', a: 'La vieja regla del 1% ya no aplica. Haz los números: con costos de cierre bajos, hasta una baja de 0.5% puede funcionar si te quedas suficiente tiempo; con costos altos, puede que necesites 1% o más.' },
      { q: '¿Refinanciar reinicia el plazo de mi préstamo?', a: 'A menudo sí: un nuevo préstamo a 30 años reinicia el reloj. Puedes elegir un plazo de 15 o 20 años para no pagar intereses durante años extra.' },
      { q: '¿Cuáles son los costos de cierre típicos?', a: 'Normalmente del 2 al 5% del monto del préstamo: cargos de apertura, tasación, seguro de título y prepagos. Algunos prestamistas ofrecen refinanciamientos "sin costos de cierre" que incluyen los costos en una tasa un poco más alta.' },
    ],
  },
  {
    slug: 'calculadora-de-prestamo-para-auto',
    enSlug: 'auto-loan-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de préstamo para auto',
    tagline: 'Pago mensual del auto con pago inicial, valor de intercambio y plazo.',
    category: 'Préstamos',
    badge: 'A',
    calcKey: 'autoloan',
    inputs: [
      { key: 'price', label: 'Precio del vehículo ($)', type: 'number', default: 35000, min: 0, step: 500 },
      { key: 'downPayment', label: 'Pago inicial ($)', type: 'number', default: 5000, min: 0, step: 500 },
      { key: 'tradeIn', label: 'Valor de intercambio ($)', type: 'number', default: 3000, min: 0, step: 500 },
      { key: 'rate', label: 'APR (%)', type: 'number', default: 7, min: 0, max: 30, step: 0.25 },
      { key: 'months', label: 'Plazo del préstamo (meses)', type: 'number', default: 60, min: 6, max: 120, step: 6 },
    ],
    metaTitle: 'Calculadora de préstamo para auto: estima tu pago mensual',
    metaDescription:
      'Estima tu pago mensual del auto con pago inicial, valor de intercambio, APR y plazo. Mira el interés total y el costo real del vehículo.',
    keywords: 'calculadora de préstamo para auto, calculadora de pago de auto, calculadora de crédito automotriz',
    explainer:
      'A los concesionarios les encanta hablar del pago mensual porque oculta el precio total: un plazo más largo hace que cualquier auto parezca accesible mientras suma silenciosamente miles en intereses. Esta calculadora de préstamo para auto invierte eso: ingresa el precio del vehículo, el pago inicial, el valor de intercambio, el APR y el plazo, y te muestra el pago mensual real, el monto que realmente estás financiando, el interés total y el costo total real del auto.\n\nTres números deciden si un trato es bueno. Primero, el monto del préstamo: cada dólar de pago inicial o intercambio es un dólar por el que nunca pagas intereses. Segundo, el APR: el financiamiento del concesionario suele tener recargo, así que compáralo con tu banco o cooperativa de crédito antes de firmar. Tercero, el plazo: los préstamos a 84 meses mantienen el pago bajo pero te dejan debiendo más de lo que vale el auto por años (capital negativo) y pagas mucho más en intereses. La gráfica del saldo muestra la curva de pago: si se mantiene alta por años, el plazo es demasiado largo. Negocia primero el precio, después el financiamiento, y nunca dejes que el pago mensual sea el único número en la conversación.',
    faqs: [
      { q: '¿Cuánto auto puedo pagar?', a: 'Una guía común: costos totales del auto por debajo del 15% de tu ingreso neto, con al menos 20% de pago inicial y un plazo de 48 meses o menos. Usa la calculadora para probar pagos contra tu presupuesto.' },
      { q: '¿Es malo un plazo más largo para el auto?', a: 'Baja el pago pero sube el interés total y te mantiene "bajo el agua" (debiendo más del valor del auto) por más tiempo. 60 meses es el punto ideal para la mayoría; evita los 84 meses si puedes.' },
      { q: '¿Debería dar pago inicial por un auto?', a: 'Sí. Un buen pago inicial reduce el monto financiado, baja tu pago y el interés, y te protege del capital negativo mientras el auto se deprecia.' },
      { q: '¿Financiamiento del concesionario o préstamo del banco?', a: 'Consigue primero una preaprobación de tu banco o cooperativa de crédito, y luego deja que el concesionario intente superarla. Llegar con una tasa en mano elimina su mayor fuente de ganancia.' },
    ],
  },
  {
    slug: 'calculadora-de-salario',
    enSlug: 'salary-paycheck-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de salario',
    tagline: 'Tu salario neto en EE. UU. después de impuestos federales, FICA y estatales.',
    category: 'Impuestos',
    badge: 'S',
    calcKey: 'paycheck',
    inputs: [
      { key: 'salary', label: 'Salario anual ($)', type: 'number', default: 80000, min: 0, step: 1000 },
      {
        key: 'frequency', label: 'Frecuencia de pago', type: 'select', default: 'biweekly',
        options: [
          { value: 'weekly', label: 'Semanal' },
          { value: 'biweekly', label: 'Quincenal' },
          { value: 'semimonthly', label: 'Bimensual' },
          { value: 'monthly', label: 'Mensual' },
        ],
      },
      { key: 'stateRate', label: 'Tasa de impuesto estatal, estimación fija (%)', type: 'number', default: 5, min: 0, max: 15, step: 0.5 },
    ],
    metaTitle: 'Calculadora de salario: tu pago neto después de impuestos',
    metaDescription:
      '¿Cuánto de tu salario recibes realmente? Estima el impuesto federal, FICA e impuesto estatal por cheque de pago. Calculadora gratuita.',
    keywords: 'calculadora de salario, calculadora de pago neto, calculadora de sueldo después de impuestos, calculadora de impuestos EE. UU.',
    explainer:
      'Tu salario no es tu cheque de pago. Entre el impuesto federal sobre la renta, el Seguro Social y Medicare (FICA) y los impuestos estatales, una parte importante de cada dólar nunca llega a tu cuenta bancaria, y la diferencia sorprende a casi todos la primera vez que la ven desglosada. Esta calculadora de salario estima tu salario neto en EE. UU.: ingresa tu salario anual, la frecuencia de pago y una tasa estatal fija, y recorre los tramos del impuesto federal, aplica FICA y muestra el bruto vs. neto por cheque más tu tasa efectiva de impuestos.\n\nVale la pena entender algunas cosas en los resultados. El impuesto federal es marginal: solo los dólares dentro de cada tramo se gravan a la tasa de ese tramo, así que "subir de tramo" nunca te hace perder dinero en total. FICA es fijo (6.2% de Seguro Social hasta el tope salarial, 1.45% de Medicare sobre todo) y tu empleador aporta lo mismo por su cuenta. La línea estatal es una estimación fija aproximada porque los impuestos estatales reales van de cero (Texas, Florida) a más del 10% (California), con sus propios tramos y deducciones. Tómalo como una estimación para planificar: la retención real depende de tu formulario W-4, tus contribuciones pre-impuestos al 401(k) y HSA, y los impuestos locales.',
    faqs: [
      { q: '¿Por qué mi cheque es menor que el salario dividido entre los períodos de pago?', a: 'Primero se retienen el impuesto federal, FICA (Seguro Social + Medicare) y los impuestos estatales/locales. Las deducciones pre-impuestos como el 401(k) y las primas de salud lo reducen aún más.' },
      { q: '¿Qué es un tramo impositivo marginal?', a: 'El ingreso se grava por capas: el primer tramo al 10%, el siguiente al 12%, y así. Solo el ingreso dentro de un tramo se grava a esa tasa; ganar más nunca reduce tu salario neto.' },
      { q: '¿Qué es FICA?', a: 'El impuesto de la Ley Federal de Contribuciones al Seguro: 6.2% para el Seguro Social (hasta un tope salarial anual) más 1.45% para Medicare sobre todas las ganancias. Tu empleador paga una cantidad igual.' },
      { q: '¿Qué tan precisa es esta estimación?', a: 'Es una buena estimación para planificar usando los tramos federales para declarante soltero y una tasa estatal fija. La retención real varía según tu W-4, tu estado civil tributario, las deducciones pre-impuestos y el código fiscal real de tu estado.' },
    ],
  },
  {
    slug: 'calculadora-para-pagar-tarjeta-de-credito',
    enSlug: 'credit-card-payoff-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora para pagar tarjeta de crédito',
    tagline: 'Qué tan rápido puedes liquidar tu tarjeta de crédito y cuánto te cuesta.',
    category: 'Deudas',
    badge: 'T',
    calcKey: 'creditcard',
    inputs: [
      { key: 'balance', label: 'Saldo de la tarjeta ($)', type: 'number', default: 8000, min: 0, step: 250 },
      { key: 'rate', label: 'APR (%)', type: 'number', default: 24, min: 0, max: 40, step: 0.5 },
      { key: 'payment', label: 'Pago mensual ($)', type: 'number', default: 250, min: 0, step: 25 },
    ],
    metaTitle: 'Calculadora para pagar tarjeta de crédito: fecha e interés',
    metaDescription:
      '¿Cuánto tardarás en pagar tu tarjeta de crédito? Ingresa saldo, APR y pago mensual para ver tu fecha de pago y el interés total. Calculadora gratuita.',
    keywords: 'calculadora para pagar tarjeta de crédito, calculadora para liquidar tarjeta de crédito, calculadora de deuda de tarjeta de crédito',
    explainer:
      'La deuda de tarjeta de crédito con un APR de 20–30% es la deuda común más cara en EE. UU., y los pagos mínimos están diseñados para maximizar lo que el emisor gana contigo. Esta calculadora para pagar tarjeta de crédito muestra la alternativa: ingresa tu saldo, tu APR y el pago mensual al que puedes comprometerte, y simula el pago mes a mes, dándote una fecha para quedar libre de deudas, el interés total pagado y una gráfica del saldo que hace visible tu progreso.\n\nLas matemáticas son implacables y motivadoras por igual. Con un APR de 24%, un saldo de $8,000 pagado a $250 al mes tarda más de cuatro años y cuesta casi $4,000 en intereses; sube el pago a $400 y terminas en unos dos años, ahorrando aproximadamente la mitad del interés. Ese es el poder de pagar más del mínimo cuando la tasa es alta: cada dólar extra evita intereses futuros que se acumularían en tu contra. La calculadora también te avisa si tu pago ni siquiera cubre el interés mensual, la trampa que mantiene los saldos creciendo para siempre. Úsala para fijar un pago de liquidación fijo, automatízalo y deja de agregar nuevos cargos mientras atacas el saldo.',
    faqs: [
      { q: '¿Cuánto tardaré en pagar mi tarjeta de crédito?', a: 'Depende del saldo, el APR y el pago. Con tasas típicas, los pagos mínimos tardan 7–15 años; un pago fijo agresivo puede liquidar el mismo saldo en 1–3 años.' },
      { q: '¿Cuánto interés pagaré?', a: 'Ingresa tus números arriba: con un APR de 24%, el interés suele sumar entre 30 y 50% del saldo original pagando mínimos, pero baja rápido cuando aumentas el pago.' },
      { q: '¿Debería hacer una transferencia de saldo?', a: 'Una transferencia con APR introductorio de 0% puede ahorrarte cientos si liquidas el saldo antes de que termine la promoción y evitas la trampa del cargo por transferencia. No la uses como excusa para gastar más.' },
      { q: '¿Es mejor ahorrar o pagar la deuda de la tarjeta?', a: 'Casi siempre paga primero la tarjeta: un rendimiento garantizado de 24% al evitar intereses supera a cualquier cuenta de ahorros o rendimiento típico de inversión.' },
    ],
  },
  {
    slug: 'calculadora-de-ahorro-para-jubilacion',
    enSlug: 'retirement-savings-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de ahorro para jubilación',
    tagline: 'Proyecta el crecimiento de tu 401(k) con aportes y aporte del empleador.',
    category: 'Inversión',
    badge: 'J',
    calcKey: 'retirement',
    inputs: [
      { key: 'current', label: 'Ahorros actuales ($)', type: 'number', default: 25000, min: 0, step: 1000 },
      { key: 'monthly', label: 'Tu aporte mensual ($)', type: 'number', default: 800, min: 0, step: 25 },
      { key: 'rate', label: 'Rendimiento anual esperado (%)', type: 'number', default: 8, min: 0, max: 20, step: 0.5 },
      { key: 'years', label: 'Años hasta la jubilación', type: 'number', default: 30, min: 1, max: 60, step: 1 },
      { key: 'salary', label: 'Salario anual, para el cálculo del aporte ($)', type: 'number', default: 100000, min: 0, step: 1000 },
      { key: 'match', label: 'Aporte del empleador (%)', type: 'number', default: 50, min: 0, max: 200, step: 5 },
      { key: 'matchCapPct', label: 'El aporte aplica hasta (% del salario)', type: 'number', default: 6, min: 0, max: 20, step: 0.5 },
    ],
    metaTitle: 'Calculadora de jubilación: proyección de crecimiento del 401(k)',
    metaDescription:
      'Proyecta tus ahorros para la jubilación con aportes mensuales, aporte del empleador al 401(k) e interés compuesto. Mira aportes vs. crecimiento.',
    keywords: 'calculadora de jubilación, calculadora 401k, calculadora de ahorro para jubilación',
    explainer:
      'La jubilación parece lejana hasta que ves los números: pequeños aportes mensuales, compuestos durante décadas, suelen crecer hasta siete cifras. Esta calculadora de ahorro para jubilación proyecta tu fondo con tus ahorros actuales, tu aporte mensual, el rendimiento esperado y los años hasta la jubilación, e incluye la parte que demasiada gente deja sobre la mesa: el aporte del empleador al 401(k). Ingresa tu salario, la fórmula de aporte de tu empleador (por ejemplo, 50% de tus aportes hasta el 6% del salario) y la calculadora suma ese dinero gratis a cada mes de la proyección.\n\nLa gráfica apilada cuenta la verdadera historia: al principio, tus aportes son la mayor parte del saldo; después, el crecimiento de la inversión toma el control y supera por mucho lo que aportaste. Ese punto de inflexión es por lo que empezar temprano supera a aportar más tarde: una persona de 25 años que aporta modestamente suele terminar por delante de una de 40 que aporta agresivamente. El aporte del empleador merece atención especial: no aportar lo suficiente para capturar todo el aporte es un recorte salarial instantáneo, que a menudo vale miles por año. Toma el rendimiento como un promedio de largo plazo (7–8% nominal es un supuesto común para portafolios con muchas acciones), recuerda que la inflación erosionará el poder adquisitivo y revisa el plan cada año a medida que cambien tu salario y tus metas.',
    faqs: [
      { q: '¿Cómo funciona el aporte del empleador al 401(k)?', a: 'Una fórmula común: tu empleador agrega 50% de lo que aportas, hasta el 6% de tu salario. Aporta al menos lo suficiente para obtener todo el aporte: es un rendimiento instantáneo de 50–100%.' },
      { q: '¿Cuánto debería ahorrar para la jubilación?', a: 'Una regla muy usada: ahorra 15% de tu ingreso bruto (incluyendo el aporte del empleador) desde tus 20s. Fidelity sugiere tener 10 veces tu salario final ahorrado a los 67 años.' },
      { q: '¿Qué rendimiento debería suponer?', a: 'Para un portafolio con muchas acciones, un rendimiento nominal anual de 7–8% es un supuesto común de largo plazo. Usa cifras más bajas cuando se acerque la jubilación y cambies hacia bonos.' },
      { q: '¿Importa la inflación?', a: 'Sí: con una inflación de 3%, los precios se duplican aproximadamente cada 24 años. Resta la inflación esperada de tu rendimiento nominal para pensar en dólares de hoy.' },
    ],
  },
];
