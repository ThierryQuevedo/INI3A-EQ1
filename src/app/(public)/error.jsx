'use client';

import TelaErro from '@/app/components/ui/TelaErro';

// A-09: erro nas páginas públicas (home, login, cadastro…), com o header mantido.
export default function ErroPublico({ error, reset }) {
  return <TelaErro error={error} reset={reset} />;
}
