'use client';

import TelaErro from '@/app/components/ui/TelaErro';

// A-09: falha ao abrir os horários (banco fora, conexão caiu no meio).
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
