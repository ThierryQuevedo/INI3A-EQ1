'use client';

import TelaErro from '@/app/components/ui/TelaErro';

// ultimo recurso fora dos grupos
export default function Erro({ error, reset }) {
  return <TelaErro error={error} reset={reset} />;
}
