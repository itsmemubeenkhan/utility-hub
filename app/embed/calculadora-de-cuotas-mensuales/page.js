import { notFound } from 'next/navigation';
import { getToolEs } from '@/lib/tools.es';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Calculadora de cuotas mensuales | The Utility Hub',
  description:
    'Calculadora de cuotas mensuales integrable y gratuita: cuota fija mensual y costo total de intereses, calculados en segundos.',
  robots: { index: false, follow: true },
};

/* Versión integrable de la Calculadora de cuotas mensuales para sitios de
   terceros. Reutiliza la definición exacta de la herramienta (campos +
   calcKey) de lib/tools.es. */
export default function EmbedCuotasMensualesPage() {
  const tool = getToolEs('calculadora-de-cuotas-mensuales');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="es"
      canonical="https://www.theutilityhub.online/es/tools/calculadora-de-cuotas-mensuales"
    />
  );
}
