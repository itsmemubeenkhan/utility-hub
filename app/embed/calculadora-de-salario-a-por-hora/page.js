import { notFound } from 'next/navigation';
import { getToolEs } from '@/lib/tools.es';
import EmbedCalculator from '@/components/EmbedCalculator';

export const metadata = {
  title: 'Calculadora de salario a por hora | The Utility Hub',
  description:
    'Calculadora de salario a por hora integrable y gratuita: convierte salario anual a tarifa por hora al instante.',
  robots: { index: false, follow: true },
};

/* Versión integrable de la Calculadora de salario a por hora para sitios
   de terceros. Reutiliza la definición exacta de la herramienta (campos +
   calcKey) de lib/tools.es. */
export default function EmbedSalarioPorHoraPage() {
  const tool = getToolEs('calculadora-de-salario-a-por-hora');
  if (!tool) notFound();
  return (
    <EmbedCalculator
      tool={tool}
      lang="es"
      canonical="https://www.theutilityhub.online/es/tools/calculadora-de-salario-a-por-hora"
    />
  );
}
