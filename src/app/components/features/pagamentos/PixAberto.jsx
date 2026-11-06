'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { simularPagamentoAction } from '@/app/actions/pagamentos.actions';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/ToastProvider';
import { formatarHora } from '@/lib/formatoData';

/** PIX aberto: QR Code, copia e cola e, só em cobrança de teste, o botão de simular. */
export default function PixAberto({ pagamento, agendamentoId, onTrocarMetodo }) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  const [simulando, setSimulando] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pagamento.pixCopiaECola);
      setCopiado(true);
      toast.success('Código PIX copiado.');
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      toast.error('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  }

  async function simular() {
    setSimulando(true);
    try {
      const resultado = await simularPagamentoAction(agendamentoId);
      if (resultado?.erro) toast.error(resultado.erro);
      else toast.success('Pagamento simulado. A tela atualiza em alguns segundos.');
    } catch {
      toast.error('A simulação não funcionou agora. Tente de novo.');
    } finally {
      setSimulando(false);
    }
  }

  return (
    <div className="mt-5">
      <p role="status" className="text-body font-semibold text-foreground">
        Aguardando o pagamento
      </p>
      <ol className="mt-2 list-decimal pl-5 text-body-sm text-muted-foreground space-y-1">
        <li>Abra o app do seu banco e escolha pagar com PIX.</li>
        <li>Leia o QR Code ou cole o código abaixo.</li>
        <li>Esta tela atualiza sozinha quando o pagamento for confirmado.</li>
      </ol>

      {pagamento.pixQrCode && (
        // Imagem em base64 vinda da cobrança: o next/image não agrega nada aqui.
        // O fundo branco mantém o QR Code legível também no tema escuro.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pagamento.pixQrCode}
          alt="QR Code do PIX"
          width={224}
          height={224}
          className="mx-auto mt-4 size-56 rounded-lg border border-border bg-white p-2"
        />
      )}

      <label htmlFor="pix-copia-e-cola" className="mt-4 block text-body-sm font-medium text-muted-foreground">
        Código copia e cola
      </label>
      <textarea
        id="pix-copia-e-cola"
        readOnly
        rows={3}
        value={pagamento.pixCopiaECola ?? ''}
        onFocus={(e) => e.target.select()}
        className="mt-1.5 w-full resize-none break-all rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <Button type="button" size="lg" className="mt-3 w-full" onClick={copiar}>
        {copiado ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
        {copiado ? 'Copiado' : 'Copiar código PIX'}
      </Button>

      {pagamento.expiraEm && (
        <p className="mt-3 text-center text-body-sm text-muted-foreground">
          Válido até as <span className="tabular-nums">{formatarHora(new Date(pagamento.expiraEm))}</span>.
        </p>
      )}

      {pagamento.modoTeste && (
        <div className="mt-4 rounded-lg border border-dashed border-border p-3">
          <p className="text-body-sm text-muted-foreground">Cobrança de teste: nenhum dinheiro real é movimentado.</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" disabled={simulando} onClick={simular}>
            {simulando ? 'Simulando…' : 'Simular pagamento'}
          </Button>
        </div>
      )}

      <Button type="button" variant="ghost" size="lg" className="mt-2 w-full" onClick={onTrocarMetodo}>
        Pagar de outra forma
      </Button>
    </div>
  );
}
