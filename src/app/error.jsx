'use client';

import TelaErro from '@/app/components/ui/TelaErro';

// A-09: último recurso para erros fora dos grupos (app) e (public).
export default function Erro({ error, reset }) {
  return <TelaErro error={error} reset={reset} />;
}
