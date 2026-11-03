'use client';

import TelaErro from '@/app/components/ui/TelaErro';

// A-09: erro numa página logada. Fica dentro do layout do grupo, então o
// header continua na tela e a pessoa não se sente "expulsa" do app.
export default function ErroApp({ error, reset }) {
  return <TelaErro error={error} reset={reset} hrefAlternativo="/servicos" rotuloAlternativo="Ver serviços" />;
}
