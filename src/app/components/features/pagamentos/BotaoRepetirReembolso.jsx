'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tentarReembolsoAction } from '@/app/actions/pagamentos.actions';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/ToastProvider';

export default function BotaoRepetirReembolso({ agendamentoId, className }) {
  const router = useRouter();
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function repetir() {
    setEnviando(true);
    try {
      const resultado = await tentarReembolsoAction(agendamentoId);
      if (resultado?.erro) toast.error(resultado.erro);
      else toast.success('Reembolso feito.');
    } catch {
      toast.error('Não foi possível tentar agora. Tente de novo em instantes.');
    } finally {
      setEnviando(false);
      router.refresh();
    }
  }

  return (
    <Button type="button" size="compacto" variant="outline" className={className} disabled={enviando} onClick={repetir}>
      {enviando ? 'Tentando…' : 'Tentar reembolso de novo'}
    </Button>
  );
}
