'use client';

import TelaErro from '@/app/components/ui/TelaErro';

export default function ErroPublico({ error, reset }) {
  return <TelaErro error={error} reset={reset} />;
}
