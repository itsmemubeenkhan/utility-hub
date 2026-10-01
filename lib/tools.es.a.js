/* Spanish (US) translations — batch A (entries 1-6).
   Schema mirrors lib/tools.js but uses calcKey instead of calculate,
   plus slug/enSlug for hreflang mapping. Do not edit by hand for
   numbers: key/type/default/min/max/step/option values mirror English. */
export const TOOLS_ES_A = [
  {
    slug: 'calculadora-de-hipoteca',
    enSlug: 'mortgage-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de hipoteca',
    tagline: 'Calcula tu pago mensual de hipoteca con impuestos, seguro y PMI.',
    category: 'Hipotecas',
    badge: 'H',
    calcKey: 'mortgage',
    inputs: [
      { key: 'homePrice', label: 'Precio de la vivienda ($)', type: 'number', default: 400000, min: 0, step: 1000 },
      { key: 'downPayment', label: 'Pago inicial ($)', type: 'number', default: 80000, min: 0, step: 1000 },
      { key: 'rate', label: 'Tasa de interés (%)', type: 'number', default: 6.5, min: 0, max: 20, step: 0.125 },
      { key: 'years', label: 'Plazo del préstamo (años)', type: 'number', default: 30, min: 1, max: 50, step: 1 },
      { key: 'tax', label: 'Impuestos a la propiedad ($/año)', type: 'number', default: 4800, min: 0, step: 100 },
      { key: 'insurance', label: 'Seguro de vivienda ($/año)', type: 'number', default: 1800, min: 0, step: 50 },
      { key: 'includePmi', label: 'Incluir estimación de PMI (pago inicial < 20%)', type: 'checkbox', default: true },
    ],
    metaTitle: 'Calculadora de hipoteca: pago mensual, impuestos y PMI',
    metaDescription:
      'Calculadora de hipoteca gratis: estima tu pago mensual con capital, intereses, impuestos, seguro y PMI. Mira el interés total y el calendario de pagos.',
    keywords: 'calculadora de hipoteca, pago mensual de hipoteca, calculadora de préstamo hipotecario, calculadora de PMI',
    explainer:
      'El pago de una hipoteca es más que capital e intereses. Los prestamistas anuncian la cifra de capital e intereses, pero tu pago real cada mes también cubre los impuestos a la propiedad y el seguro de vivienda, y si tu pago inicial es menor al 20%, el seguro hipotecario privado (PMI) hasta que acumules suficiente capital. Esta calculadora de hipoteca te muestra el panorama completo: ingresa el precio de la vivienda, el pago inicial, la tasa y el plazo, además de los impuestos y el seguro anuales, y desglosa tu pago en cada componente para que veas exactamente a dónde va tu dinero.\n\nEl motor de amortización usa la fórmula estándar del préstamo, recorre cada pago para sumar el interés total y dibuja tu saldo restante año por año. Dos números merecen atención especial: el interés total, que en un préstamo a 30 años puede casi igualar el precio de la casa, y el efecto de la tasa; incluso medio punto de diferencia cambia tu pago en decenas de miles a lo largo del préstamo. Usa los resultados para comparar ofertas de préstamos en igualdad de condiciones, decidir si un plazo de 15 años es viable o ver cómo un pago inicial mayor elimina el PMI y reduce los intereses. Son estimaciones para planificar, no una oferta de préstamo; los pagos reales dependen de las condiciones exactas de tu prestamista.',
    faqs: [
      { q: '¿Cómo se calcula el pago mensual de una hipoteca?', a: 'La parte de capital e intereses usa la fórmula de amortización: M = P × r(1+r)^n / ((1+r)^n − 1), donde P es el monto del préstamo, r la tasa mensual y n el número de pagos. Los impuestos, el seguro y el PMI se suman aparte.' },
      { q: '¿Qué es el PMI y cuándo lo pago?', a: 'El seguro hipotecario privado protege al prestamista cuando tu pago inicial es menor al 20%. Suele costar entre 0.5% y 1% del préstamo al año, se suma a tu pago mensual y desaparece cuando alcanzas alrededor del 20% de capital.' },
      { q: '¿Una hipoteca a 15 años ahorra dinero?', a: 'Sí, y mucho. Las tasas suelen ser más bajas y pagas intereses durante la mitad del tiempo, lo que a menudo reduce el interés total en un 60% o más. La contrapartida es un pago mensual mucho más alto.' },
      { q: '¿Debo incluir los impuestos a la propiedad y el seguro?', a: 'Sin duda. La mayoría de los prestamistas incluyen los impuestos y el seguro en tu pago mensual, así que excluirlos subestima lo que realmente pagarás cada mes, a veces en un 25% o más.' },
    ],
  },
  {
    slug: 'cuanta-casa-puedo-comprar',
    enSlug: 'home-affordability-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de capacidad de compra',
    tagline: 'Descubre cuánta casa puede sostener cómodamente tu ingreso.',
    category: 'Hipotecas',
    badge: 'C',
    calcKey: 'affordability',
    inputs: [
      { key: 'income', label: 'Ingreso anual del hogar ($)', type: 'number', default: 80000, min: 0, step: 1000 },
      { key: 'debtPayments', label: 'Pagos mensuales de deudas ($)', type: 'number', default: 500, min: 0, step: 25 },
      { key: 'rate', label: 'Tasa hipotecaria (%)', type: 'number', default: 6.5, min: 0, max: 20, step: 0.125 },
      { key: 'years', label: 'Plazo del préstamo (años)', type: 'number', default: 30, min: 1, max: 50, step: 1 },
      { key: 'downPct', label: 'Pago inicial (%)', type: 'number', default: 20, min: 0, max: 100, step: 1 },
    ],
    metaTitle: '¿Cuánta casa puedo comprar? Calculadora de capacidad',
    metaDescription:
      '¿Cuánta casa puedes comprar? Ingresa tu ingreso, tus deudas y la tasa para obtener un precio máximo realista con la regla 28/36 de los prestamistas.',
    keywords: 'cuánta casa puedo comprar, calculadora de capacidad de compra, precio de casa según ingreso',
    explainer:
      'Enamorarte de una casa que no puedes pagar con comodidad es uno de los errores más caros de las finanzas personales. Los prestamistas responden a "cuánto puedo pedir prestado" con la regla 28/36: no gastes más del 28% de tu ingreso mensual bruto en vivienda (relación inicial) ni más del 36% en todas tus deudas combinadas, incluida la vivienda (relación final). Esta calculadora aplica ambos límites, convierte el más estricto en un monto de préstamo con tu tasa y plazo, y lo suma a tu pago inicial para darte un precio máximo de vivienda.\n\nLa gráfica muestra cómo cambia la respuesta según el porcentaje de ingreso que uses, útil para decidir qué tan conservador quieres ser. Recuerda que la regla es un techo, no una meta: los impuestos, el seguro, el mantenimiento (calcula alrededor del 1% del valor de la vivienda al año) y las cuotas de la asociación de propietarios se suman a la hipoteca. En zonas caras, muchos compradores también prestan más atención a la relación final porque los préstamos estudiantiles o el pago del auto consumen el presupuesto rápido. Usa esta calculadora antes de ver anuncios, no después; mantiene tu búsqueda honesta y tus ofertas creíbles.',
    faqs: [
      { q: '¿Qué es la regla 28/36?', a: 'Una guía tradicional de préstamos: los costos de vivienda no deben superar el 28% del ingreso mensual bruto, y los pagos totales de deudas (vivienda más auto, préstamos estudiantiles y pagos mínimos de tarjetas) no deben superar el 36%.' },
      { q: '¿Esto incluye impuestos a la propiedad y seguro?', a: 'Las relaciones se aplican al costo total de la vivienda, que los prestamistas definen como PITI: capital, intereses, impuestos y seguro. Nuestra calculadora convierte el límite de pago en un precio; incluye los impuestos y el seguro dentro de ese pago.' },
      { q: '¿Puedo comprar más si no tengo otras deudas?', a: 'Sí. Sin otras deudas, la relación final es igual a la inicial, así que calificas para el presupuesto completo del 28% en vivienda. Las deudas existentes son lo que normalmente reduce el número.' },
      { q: '¿El precio máximo es el precio que debo pagar?', a: 'No. Es lo máximo que un prestamista probablemente aprobaría. La mayoría de los planificadores financieros sugieren quedarse entre un 10% y un 20% por debajo del máximo para dejar espacio al mantenimiento, el ahorro y los imprevistos.' },
    ],
  },
  {
    slug: 'calculadora-de-prestamos',
    enSlug: 'loan-payment-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de préstamos',
    tagline: 'Pago mensual, interés total y calendario de pagos para cualquier préstamo.',
    category: 'Préstamos',
    badge: 'P',
    calcKey: 'loanpayment',
    inputs: [
      { key: 'amount', label: 'Monto del préstamo ($)', type: 'number', default: 25000, min: 0, step: 500 },
      { key: 'rate', label: 'Tasa de interés anual (%)', type: 'number', default: 8, min: 0, max: 40, step: 0.125 },
      { key: 'years', label: 'Plazo (años)', type: 'number', default: 5, min: 0, max: 40, step: 1 },
      { key: 'months', label: 'Meses adicionales', type: 'number', default: 0, min: 0, max: 11, step: 1 },
    ],
    metaTitle: 'Calculadora de préstamos: pago mensual e interés total',
    metaDescription:
      'Calcula el pago mensual, el interés total y el calendario de pagos de cualquier préstamo: personal, estudiantil o comercial. Gratis e instantáneo.',
    keywords: 'calculadora de préstamos, calculadora de préstamo personal, calculadora de amortización de préstamos',
    explainer:
      'Todo préstamo se reduce a tres números: cuánto pides prestado, la tasa y cuánto tardas en pagarlo. Esta calculadora convierte esos tres datos en los dos números que importan para tu presupuesto: el pago mensual y el interés total que pagarás durante la vida del préstamo. Funciona para préstamos personales, estudiantiles, comerciales y cualquier otra deuda amortizable: cada pago se divide en intereses (calculados sobre el saldo restante) y capital, así que los primeros pagos son casi todo interés y los últimos casi todo capital.\n\nDos ideas suelen sorprender. Primera: alargar el plazo baja el pago, pero dispara el interés total; duplicar el plazo puede casi duplicar lo que pagas en intereses. Segunda: incluso pequeños pagos adicionales atacan el capital directamente y pueden recortar meses del calendario. La gráfica del saldo muestra la curva de pago para que veas exactamente cuándo el préstamo empieza a reducirse rápido. Usa la calculadora para comparar ofertas (una tasa más baja casi siempre gana a un plazo más largo), comprobar si un pago cabe en tu presupuesto antes de firmar y planear pagos adicionales que reduzcan los intereses.',
    faqs: [
      { q: '¿Cómo dividen los prestamistas mi pago entre intereses y capital?', a: 'Cada mes el prestamista cobra intereses sobre el saldo restante y el resto de tu pago fijo reduce el capital. Por eso los primeros pagos son sobre todo intereses y la proporción se inclina hacia el capital con el tiempo.' },
      { q: '¿Un plazo más largo es mejor?', a: 'Baja el pago mensual, pero aumenta mucho el interés total. Elige un plazo más largo solo si el pago del plazo más corto realmente no cabe en tu presupuesto.' },
      { q: '¿Los pagos adicionales realmente ayudan?', a: 'Sí. Los pagos adicionales van directo al capital, lo que reduce todos los cargos futuros de intereses. Incluso $50 adicionales al mes pueden recortar meses de un préstamo típico.' },
      { q: '¿Qué es un calendario de amortización?', a: 'Una tabla mes por mes que muestra el desglose de cada pago entre intereses y capital, y el saldo restante. Nuestra gráfica visualiza esa misma curva de pago.' },
    ],
  },
  {
    slug: 'calculadora-de-cuotas-mensuales',
    enSlug: 'emi-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de cuotas mensuales',
    tagline: 'Calcula tu cuota mensual fija y el costo total de intereses.',
    category: 'Préstamos',
    badge: 'M',
    calcKey: 'emi',
    inputs: [
      { key: 'amount', label: 'Monto del préstamo ($)', type: 'number', default: 25000, min: 0, step: 500 },
      { key: 'rate', label: 'Tasa de interés anual (%)', type: 'number', default: 7, min: 0, max: 40, step: 0.125 },
      { key: 'years', label: 'Plazo (años)', type: 'number', default: 5, min: 1, max: 40, step: 1 },
    ],
    metaTitle: 'Calculadora de cuotas mensuales (EMI): pago e intereses',
    metaDescription:
      'Calculadora de cuotas mensuales gratis: encuentra tu pago mensual fijo, el interés total y el desglose entre capital e intereses durante el plazo.',
    keywords: 'calculadora de cuotas mensuales, calculadora EMI, cuota mensual de préstamo',
    explainer:
      'La cuota mensual fija (EMI, por sus siglas en inglés) es la cantidad que pagas cada mes hasta saldar por completo un préstamo. Es la estructura de pago estándar para hipotecas, préstamos de auto y préstamos personales en EE. UU. y muchos otros países. La matemática es idéntica a la amortización de un préstamo: una fórmula convierte el monto, la tasa anual y el plazo en una sola cifra mensual fija, y cada cuota se divide entre los intereses sobre el saldo pendiente y la reducción del capital.\n\nEsta calculadora va más allá del número mensual. La gráfica acumulada muestra cuánto capital has pagado frente a cuántos intereses en cada año; el punto donde el capital por fin supera a los intereses es revelador en préstamos largos. El gráfico circular muestra el desglose total: en un préstamo a 30 años con tasas típicas, los intereses pueden superar la mitad de todo lo que pagas. Antes de comprometerte, compara un plazo más corto (cuota más alta, muchísimo menos interés) con uno más largo, y evalúa si un pago anticipado parcial al inicio del préstamo, cuando la porción de intereses es mayor, te conviene.',
    faqs: [
      { q: '¿Qué significa EMI?', a: 'Equated Monthly Installment (cuota mensual fija, en inglés): un pago mensual fijo que cubre tanto intereses como capital hasta saldar el préstamo.' },
      { q: '¿La cuota mensual es lo mismo que el pago de un préstamo?', a: 'Sí, matemáticamente. EMI es simplemente el término que se usa comúnmente para el pago mensual fijo de un préstamo amortizable.' },
      { q: '¿Por qué mi cuota es casi todo interés al principio?', a: 'Los intereses se calculan sobre el saldo pendiente, que es mayor al inicio. A medida que el capital se reduce, la porción de intereses de cada cuota baja y la de capital crece.' },
      { q: '¿Debo elegir un plazo más corto?', a: 'Si puedes pagar la cuota más alta, sí: pagas muchísimo menos interés en total y te liberas de la deuda antes.' },
    ],
  },
  {
    slug: 'calculadora-de-interes-compuesto',
    enSlug: 'compound-interest-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de interés compuesto',
    tagline: 'Mira crecer tu dinero: aportaciones más rendimientos compuestos.',
    category: 'Inversión',
    badge: 'I',
    calcKey: 'compound',
    inputs: [
      { key: 'principal', label: 'Inversión inicial ($)', type: 'number', default: 10000, min: 0, step: 500 },
      { key: 'monthlyAdd', label: 'Aportación mensual ($)', type: 'number', default: 500, min: 0, step: 25 },
      { key: 'rate', label: 'Rendimiento anual (%)', type: 'number', default: 8, min: 0, max: 30, step: 0.5 },
      { key: 'years', label: 'Años de crecimiento', type: 'number', default: 20, min: 1, max: 60, step: 1 },
      {
        key: 'freq', label: 'Frecuencia de capitalización', type: 'select', default: 'monthly',
        options: [
          { value: 'annually', label: 'Anual' },
          { value: 'semiannually', label: 'Semestral' },
          { value: 'quarterly', label: 'Trimestral' },
          { value: 'monthly', label: 'Mensual' },
          { value: 'daily', label: 'Diaria' },
        ],
      },
    ],
    metaTitle: 'Calculadora de interés compuesto: haz crecer tu dinero',
    metaDescription:
      'Mira cómo el interés compuesto hace crecer tus ahorros. Agrega aportaciones mensuales, ajusta el rendimiento y compara frecuencias de capitalización.',
    keywords: 'calculadora de interés compuesto, calculadora de crecimiento de inversión, calculadora de capitalización',
    explainer:
      'El interés compuesto es el interés que genera más interés, y es la fuerza más poderosa de la inversión a largo plazo. En cada período, tu saldo crece según la tasa de rendimiento, y el crecimiento del período siguiente se calcula sobre ese saldo mayor. Suma aportaciones regulares y el efecto se vuelve dramático: en 20 o 30 años, el crecimiento de la inversión puede superar por mucho todo lo que realmente aportaste. Esta calculadora modela exactamente eso: define un monto inicial, una aportación mensual, un rendimiento anual estimado y la frecuencia de capitalización.\n\nJuega con las dos palancas que más importan: el tiempo y las aportaciones. Empezar diez años antes suele ganarle a obtener un mayor rendimiento, porque la capitalización necesita tiempo para hacer su trabajo pesado; la curva de crecimiento se mantiene plana por años y luego se inclina bruscamente hacia arriba. Las aportaciones mensuales importan más de lo que la mayoría cree; son el combustible que quema el motor del interés compuesto. La frecuencia (mensual frente a diaria) apenas cambia los resultados; a los bancos les encanta anunciar la capitalización diaria, pero la tasa de rendimiento y tu hábito de ahorro deciden el 99% del resultado. Trata la tasa como un promedio a largo plazo, no como una promesa: los mercados fluctúan y esta calculadora muestra el camino matemático suave, no el real lleno de baches.',
    faqs: [
      { q: '¿Qué es el interés compuesto en palabras sencillas?', a: 'Ganas rendimientos no solo sobre tu dinero original, sino también sobre todos los rendimientos ya ganados. Con el tiempo, el crecimiento se acelera porque las ganancias de cada año se convierten en parte de la base del año siguiente.' },
      { q: '¿La frecuencia de capitalización importa mucho?', a: 'Apenas. La diferencia entre capitalización mensual y diaria es mínima comparada con la que marcan tu tasa de rendimiento, el monto de tus aportaciones y el tiempo invertido.' },
      { q: '¿Qué tasa de rendimiento debo suponer?', a: 'Para inversión a largo plazo en el mercado de valores de EE. UU., el rango histórico es de 7% a 10% nominal (antes de la inflación). Usa de 6% a 7% para un plan conservador y recuerda restar la inflación para el poder adquisitivo real.' },
      { q: '¿Es mejor invertir una suma única o mensualmente?', a: 'Ambas funcionan. Una suma única invertida antes tiene más tiempo de capitalización; las aportaciones mensuales crean el hábito y suavizan el momento del mercado. Nuestra calculadora muestra cualquiera de los dos caminos.' },
    ],
  },
  {
    slug: 'calculadora-de-metas-de-ahorro',
    enSlug: 'savings-goal-calculator',
    lastReviewed: '2026-10-01',
    name: 'Calculadora de metas de ahorro',
    tagline: 'Cuánto ahorrar cada mes para alcanzar cualquier meta a tiempo.',
    category: 'Ahorro',
    badge: 'A',
    calcKey: 'savingsgoal',
    inputs: [
      { key: 'goal', label: 'Meta de ahorro ($)', type: 'number', default: 50000, min: 0, step: 1000 },
      { key: 'starting', label: 'Ya ahorrado ($)', type: 'number', default: 5000, min: 0, step: 500 },
      { key: 'rate', label: 'Interés anual (%)', type: 'number', default: 5, min: 0, max: 20, step: 0.25 },
      { key: 'years', label: 'Años para ahorrar', type: 'number', default: 5, min: 1, max: 50, step: 1 },
    ],
    metaTitle: 'Calculadora de metas de ahorro: depósito mensual necesario',
    metaDescription:
      '¿Cuánto debes ahorrar cada mes para lograr tu meta? Ingresa el objetivo, el plazo y la tasa de interés para conocer tu depósito mensual.',
    keywords: 'calculadora de metas de ahorro, cuánto ahorrar por mes, calculadora de plan de ahorro',
    explainer:
      'Las grandes metas (el pago inicial de una casa, una boda, un fondo para un año sabático) se sienten abstractas hasta que las conviertes en un número mensual. Eso es lo que hace una calculadora de metas de ahorro: trabaja hacia atrás desde tu monto objetivo y tu fecha límite para decirte exactamente cuánto apartar cada mes, contando los intereses que tus ahorros generan en el camino. Como tus depósitos también se capitalizan, el monto mensual requerido siempre es menor que simplemente dividir la meta entre los meses; cuanto más largo el plazo y mejor la tasa, mayor el descuento.\n\nUsa los datos para poner a prueba tu plan. Extiende la fecha límite dos años y mira cómo cae el número mensual; sube la tasa (por ejemplo, usando una cuenta de ahorros de alto rendimiento en vez de una cuenta de cheques) y verás el mismo efecto. Si la cifra mensual supera lo que puedes pagar, tienes tres opciones honestas: extender el plazo, darle más prioridad a la meta recortando en otro lado o reducir la meta. La curva proyectada muestra tu saldo creciendo año con año, lo cual motiva, y confirma que el tramo final, cuando la capitalización pega más fuerte, hace una parte sorprendente del trabajo.',
    faqs: [
      { q: '¿Cómo calcula la calculadora mi depósito mensual?', a: 'Resuelve la fórmula del valor futuro de una anualidad al revés: con tu meta, monto inicial, tasa y meses, encuentra el depósito que crece hasta exactamente tu objetivo.' },
      { q: '¿El interés realmente baja mi ahorro mensual?', a: 'Sí. Las ganancias sobre tu saldo creciente hacen parte del trabajo, así que tanto las tasas más altas como los plazos más largos reducen el depósito requerido.' },
      { q: '¿Qué hago si no puedo pagar el monto mensual?', a: 'Extiende el plazo, consigue una mejor tasa con una mejor cuenta, reduce la meta o empieza con un depósito inicial mayor; la calculadora muestra cada alternativa al instante.' },
      { q: '¿Debo usar una cuenta de ahorros de alto rendimiento?', a: 'Para metas de menos de 3 a 5 años, sí: mantienes tu dinero seguro y asegurado por la FDIC mientras ganas mucho más que en una cuenta de cheques. Para horizontes más largos, invertir puede superar las tasas de ahorro.' },
    ],
  },
];
