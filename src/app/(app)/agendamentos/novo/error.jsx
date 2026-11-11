'use client';

import TelaErro from '@/app/components/ui/TelaErro';

export default function ErroAgendar({ error, reset }) {
  return (
    <TelaErro
      error={error}
      reset={reset}
      titulo="Não conseguimos abrir os horários"
      hrefAlternativo="/servicos"
      rotuloAlternativo="Voltar aos serviços"
    />
  );
}
