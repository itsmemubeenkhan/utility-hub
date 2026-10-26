import { notFound } from 'next/navigation';
import { getToolEs } from '@/lib/tools.es';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Calculadora de préstamos | The Utility Hub',
  description:
    'Calculadora de préstamos integrable y gratuita: pago mensual, interés total y calendario de pagos, calculados en segundos.',
  robots: { index: false, follow: true },
};

/* Versión integrable de la Calculadora de préstamos para sitios de
   terceros. Reutiliza la definición exacta de la herramienta (campos +
   calcKey) de lib/tools.es. */
export default function EmbedPrestamosPage() {
  const tool = getToolEs('calculadora-de-prestamos');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="es"
      canonical="https://www.theutilityhub.online/es/tools/calculadora-de-prestamos"
    />
  );
}
