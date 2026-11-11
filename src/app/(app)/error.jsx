'use client';

import TelaErro from '@/app/components/ui/TelaErro';

export default function ErroApp({ error, reset }) {
  return <TelaErro error={error} reset={reset} hrefAlternativo="/servicos" rotuloAlternativo="Ver serviços" />;
}
