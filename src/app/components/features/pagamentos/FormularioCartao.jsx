'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const ID_ALVO = 'abacatepay-cartao';

const MENSAGENS_ERRO = {
  CARD_INCOMPLETE: 'Preencha todos os dados do cartão.',
  CARD_INVALID: 'Confira os dados do cartão.',
  THREE_DS_FAILED: 'A autenticação do cartão não foi concluída. Tente de novo.',
  PAYER_INVALID: 'Confira o CPF ou CNPJ informado.',
  NETWORK: 'Falha de conexão. Confira a internet e tente de novo.',
};
const MENSAGEM_PADRAO = 'Não foi possível processar o pagamento com este cartão. Confira os dados ou use outra forma de pagamento.';

/**
 * Número e CVV ficam no iframe seguro do abacatepay.js e nunca passam pelo Marca Aí.
 * O token é de uso único e vale 60 segundos: por isso é gerado só no clique em
 * pagar, e cada nova tentativa gera outro.
 */
export default function FormularioCartao({
  chavePublica,
  valorCentavos,
  valorTexto,
  pagador,
  enviando,
  validarPagador,
  onToken,
  onErro,
}) {
  const checkoutRef = useRef(null);
  const [scriptPronto, setScriptPronto] = useState(false);
  const [podeTokenizar, setPodeTokenizar] = useState(false);
  const [tokenizando, setTokenizando] = useState(false);
  const [falhaCarga, setFalhaCarga] = useState(false);

  useEffect(() => {
    if (!scriptPronto || !window.AbacatePay) return undefined;

    let ativo = true;
    let checkout;

    async function montar() {
      try {
        checkout = window.AbacatePay.create({
          publicKey: chavePublica,
          amount: valorCentavos,
          locale: 'pt',
          onCardChange: ({ canTokenize }) => {
            if (ativo) setPodeTokenizar(Boolean(canTokenize));
          },
        });
        checkoutRef.current = checkout;
        await checkout.mount(`#${ID_ALVO}`);
      } catch {
        if (ativo) setFalhaCarga(true);
      }
    }
    montar();

    return () => {
      ativo = false;
      checkoutRef.current = null;
      checkout?.destroy?.();
    };
  }, [scriptPronto, chavePublica, valorCentavos]);

  async function pagar() {
    const checkout = checkoutRef.current;
    if (!checkout || tokenizando || enviando) return;
    if (!validarPagador()) return;

    onErro(null);
    setTokenizando(true);
    try {
      const { token } = await checkout.tokenize({
        name: pagador.nome,
        email: pagador.email,
        taxId: pagador.documento,
        cellphone: pagador.celular,
      });
      await onToken(token);
    } catch (erro) {
      onErro(MENSAGENS_ERRO[erro?.code] ?? MENSAGEM_PADRAO);
    } finally {
      setTokenizando(false);
    }
  }

  const ocupado = tokenizando || enviando;

  return (
    <div className="mt-5">
      <Script
        src="https://abacatepay.com/abacatepay.js"
        strategy="afterInteractive"
        onReady={() => setScriptPronto(true)}
        onError={() => setFalhaCarga(true)}
      />

      {falhaCarga ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm text-foreground">
          O formulário do cartão não carregou. Desative bloqueadores de anúncio ou use PIX.
        </p>
      ) : (
        <div id={ID_ALVO} className="min-h-40" />
      )}

      <p className="mt-3 flex items-start gap-2 text-body-sm text-muted-foreground">
        <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Os dados do cartão vão direto para a AbacatePay. O Marca Aí não vê nem guarda esses dados.
      </p>

      <Button
        type="button"
        size="lg"
        className="mt-4 w-full"
        disabled={!podeTokenizar || ocupado || falhaCarga}
        aria-busy={ocupado || undefined}
        onClick={pagar}
      >
        {ocupado ? 'Processando…' : `Pagar ${valorTexto}`}
      </Button>
    </div>
  );
}
