'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, FileText, QrCode } from 'lucide-react';
import { consultarPagamentoAction, iniciarPagamentoAction } from '@/app/actions/pagamentos.actions';
import BoletoAberto from '@/app/components/features/pagamentos/BoletoAberto';
import FormularioCartao from '@/app/components/features/pagamentos/FormularioCartao';
import PixAberto from '@/app/components/features/pagamentos/PixAberto';
import ResultadoPagamento from '@/app/components/features/pagamentos/ResultadoPagamento';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import FormField from '@/app/components/ui/FormField';
import { Input } from '@/app/components/ui/input';
import PageContainer from '@/app/components/ui/PageContainer';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { documentoValido, formatarDocumento } from '@/lib/documentoFiscal';
import { formatarTelefone } from '@/lib/formatarTelefone';
import { formatarQuando } from '@/lib/formatoData';
import { cn } from '@/lib/utils';
import { DIAS_MINIMOS_PARA_BOLETO } from '@/lib/statusPagamento';

const INTERVALO_PIX_MS = 5000;
const INTERVALO_OUTROS_MS = 20000;
const STATUS_ENCERRADOS = ['pago', 'reembolsando', 'reembolsado', 'reembolso_falhou', 'em_disputa'];
const AVISO_COBRANCA_ENCERRADA = {
  expirado: 'O prazo da cobrança acabou. Gere outra se ainda quiser pagar.',
  falhou: 'O pagamento foi recusado. Tente de novo ou use outra forma de pagamento.',
  cancelado: 'A cobrança anterior foi cancelada. Gere outra se ainda quiser pagar.',
};

function OpcaoMetodo({ valor, selecionado, onSelecionar, Icon, titulo, descricao, desativado }) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 min-h-toque transition duracao-rapida',
        desativado ? 'border-border opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
        selecionado ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      <input
        type="radio"
        name="metodo"
        value={valor}
        checked={selecionado}
        disabled={desativado}
        onChange={() => onSelecionar(valor)}
        className="mt-1 size-4 accent-primary"
      />
      <Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-body font-semibold text-foreground">{titulo}</span>
        <span className="block text-body-sm text-muted-foreground">{descricao}</span>
      </span>
    </label>
  );
}

/** Tela sem cobrança possível: o agendamento ainda não foi confirmado, ou já foi encerrado. */
function PagamentoIndisponivel({ status }) {
  const texto =
    status === 'pendente'
      ? 'O pagamento libera assim que o profissional confirmar o horário. Avisamos você aqui no app e por e-mail.'
      : 'Este agendamento já foi encerrado, então não há pagamento a fazer pelo app.';

  return (
    <>
      <p className="mt-4 text-body text-foreground">{texto}</p>
      <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
        <Link href="/agendamentos">Ver meus agendamentos</Link>
      </Button>
    </>
  );
}

export default function PagamentoCliente({
  agendamento,
  pagamento: pagamentoInicial,
  pagador,
  boletoDisponivel,
  chavePublicaCartao,
}) {
  const router = useRouter();
  const [pagamento, setPagamento] = useState(pagamentoInicial);
  const [trocando, setTrocando] = useState(false);
  const [metodo, setMetodo] = useState('pix');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState(formatarTelefone(pagador.telefone));
  const [erroDocumento, setErroDocumento] = useState(null);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);

  const statusAtual = pagamento?.status ?? null;
  const metodoAtual = pagamento?.metodo ?? null;
  const emAberto = statusAtual === 'pendente' || statusAtual === 'criando';

  // Consulta periódica enquanto a cobrança está aberta. Em produção o webhook
  // costuma chegar antes; no localhost, é por aqui que o pagamento aparece.
  useEffect(() => {
    if (!emAberto) return undefined;

    const intervalo = metodoAtual === 'pix' ? INTERVALO_PIX_MS : INTERVALO_OUTROS_MS;
    const relogio = setInterval(async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const resposta = await consultarPagamentoAction(agendamento.id);
        if (resposta?.erro) return;

        const novo = resposta.pagamento;
        const encerrouSemPagar = !novo || Boolean(AVISO_COBRANCA_ENCERRADA[novo.status]);
        setPagamento(encerrouSemPagar ? null : novo);
        if (encerrouSemPagar) {
          setTrocando(false);
          setAviso(AVISO_COBRANCA_ENCERRADA[novo?.status] ?? AVISO_COBRANCA_ENCERRADA.cancelado);
          router.refresh();
        }
      } catch {
        // Sem conexão: a próxima rodada tenta de novo.
      }
    }, intervalo);

    return () => clearInterval(relogio);
  }, [emAberto, metodoAtual, agendamento.id, router]);

  function validarDocumento() {
    if (documentoValido(documento)) {
      setErroDocumento(null);
      return true;
    }
    setErroDocumento('Informe um CPF ou CNPJ válido.');
    return false;
  }

  /** Falha na rede não é recusa: para o cartão, a tela manda não repetir na hora. */
  async function iniciar(token) {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErro(null);
    setAviso(null);

    try {
      const resultado = await iniciarPagamentoAction({
        agendamentoId: agendamento.id,
        metodo,
        pagador: metodo === 'pix' ? undefined : { documento, celular },
        token,
      });

      if (resultado?.codigo === 'sessao') {
        router.push(`/api/auth/entrar/?proximo=${encodeURIComponent(`/agendamentos/${agendamento.id}/pagamento/`)}`);
        return;
      }
      if (resultado?.sucesso) {
        setPagamento(resultado.pagamento);
        setTrocando(false);
        window.scrollTo({ top: 0 });
        return;
      }
      setErro(resultado?.erro ?? 'Não foi possível iniciar o pagamento. Tente de novo.');
    } catch {
      setErro(
        metodo === 'cartao'
          ? 'Não conseguimos falar com o servidor. Não pague de novo agora: confira esta tela em alguns minutos.'
          : 'Não conseguimos falar com o servidor. Confira a internet e tente de novo.'
      );
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  const valorTexto = formatarPreco(agendamento.valorCentavos / 100);
  const encerrado = STATUS_ENCERRADOS.includes(statusAtual);
  const podePagar = agendamento.status === 'confirmado';
  const valorMinimoOk = agendamento.valorCentavos >= 100;

  const mostrarPix = !trocando && statusAtual === 'pendente' && metodoAtual === 'pix' && podePagar;
  const mostrarBoleto = !trocando && statusAtual === 'pendente' && metodoAtual === 'boleto' && podePagar;
  const cartaoEmAnalise = emAberto && (metodoAtual === 'cartao' || statusAtual === 'criando');

  let conteudo;
  if (encerrado) {
    conteudo = <ResultadoPagamento pagamento={pagamento} agendamentoId={agendamento.id} />;
  } else if (!podePagar) {
    conteudo = <PagamentoIndisponivel status={agendamento.status} />;
  } else if (!valorMinimoOk) {
    conteudo = (
      <p className="mt-4 text-body text-foreground">
        Este serviço não pode ser pago pelo app: o valor mínimo é R$ 1,00. Combine o pagamento com o profissional.
      </p>
    );
  } else if (mostrarPix) {
    conteudo = (
      <PixAberto
        pagamento={pagamento}
        agendamentoId={agendamento.id}
        onTrocarMetodo={() => setTrocando(true)}
      />
    );
  } else if (mostrarBoleto) {
    conteudo = <BoletoAberto pagamento={pagamento} onTrocarMetodo={() => setTrocando(true)} />;
  } else if (cartaoEmAnalise) {
    conteudo = (
      <p role="status" className="mt-4 rounded-lg border border-border bg-muted p-4 text-body text-foreground">
        Estamos aguardando a resposta da operadora. Não é preciso pagar de novo: esta tela atualiza sozinha.
      </p>
    );
  } else {
    conteudo = (
      <>
        {aviso && (
          <p role="status" className="mt-4 rounded-lg border border-border bg-muted px-3 py-2 text-body-sm text-foreground">
            {aviso}
          </p>
        )}
        {trocando && (
          <p className="mt-4 text-body-sm text-muted-foreground">
            A cobrança anterior será cancelada quando você gerar a nova.
          </p>
        )}

        <fieldset className="mt-5">
          <legend className="text-body font-semibold text-foreground">Como você quer pagar?</legend>
          <div className="mt-3 grid gap-2.5">
            <OpcaoMetodo
              valor="pix"
              selecionado={metodo === 'pix'}
              onSelecionar={setMetodo}
              Icon={QrCode}
              titulo="PIX"
              descricao="Confirmação na hora, pelo app do seu banco."
            />
            {chavePublicaCartao && (
              <OpcaoMetodo
                valor="cartao"
                selecionado={metodo === 'cartao'}
                onSelecionar={setMetodo}
                Icon={CreditCard}
                titulo="Cartão de crédito"
                descricao="À vista, com os dados protegidos pela AbacatePay."
              />
            )}
            <OpcaoMetodo
              valor="boleto"
              selecionado={metodo === 'boleto'}
              onSelecionar={setMetodo}
              Icon={FileText}
              titulo="Boleto"
              desativado={!boletoDisponivel}
              descricao={
                boletoDisponivel
                  ? 'Vence em 3 dias. A confirmação pode levar até 3 dias úteis.'
                  : `Disponível só para horários a ${DIAS_MINIMOS_PARA_BOLETO} dias ou mais, por causa do prazo de compensação.`
              }
            />
          </div>
        </fieldset>

        {metodo !== 'pix' && (
          <div className="mt-5 grid gap-4">
            <FormField
              id="pagador-documento"
              label="CPF ou CNPJ do pagador"
              required
              error={erroDocumento}
              hint="Exigido pela AbacatePay. Não fica guardado no Marca Aí."
            >
              <Input
                id="pagador-documento"
                inputMode="numeric"
                autoComplete="off"
                value={documento}
                onChange={(e) => {
                  setDocumento(formatarDocumento(e.target.value));
                  setErroDocumento(null);
                }}
                onBlur={() => documento && validarDocumento()}
                aria-invalid={Boolean(erroDocumento)}
                aria-describedby={erroDocumento ? 'pagador-documento-erro' : 'pagador-documento-dica'}
              />
            </FormField>

            {metodo === 'cartao' && (
              <FormField id="pagador-celular" label="Celular com DDD" required>
                <Input
                  id="pagador-celular"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={celular}
                  onChange={(e) => setCelular(formatarTelefone(e.target.value))}
                />
              </FormField>
            )}
          </div>
        )}

        {metodo === 'cartao' && chavePublicaCartao && (
          <FormularioCartao
            chavePublica={chavePublicaCartao}
            valorCentavos={agendamento.valorCentavos}
            valorTexto={valorTexto}
            pagador={{ nome: pagador.nome, email: pagador.email, documento, celular }}
            enviando={enviando}
            validarPagador={validarDocumento}
            onToken={iniciar}
            onErro={setErro}
          />
        )}

        <div role="alert">
          {erro && (
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm text-foreground">
              {erro}
            </p>
          )}
        </div>

        {metodo !== 'cartao' && (
          <Button
            type="button"
            size="lg"
            className="mt-5 w-full"
            disabled={enviando}
            aria-busy={enviando || undefined}
            onClick={() => {
              if (metodo === 'boleto' && !validarDocumento()) return;
              iniciar();
            }}
          >
            {enviando ? 'Gerando…' : metodo === 'pix' ? 'Gerar QR Code do PIX' : 'Gerar boleto'}
          </Button>
        )}

        {trocando && (
          <Button type="button" variant="ghost" size="lg" className="mt-2 w-full" onClick={() => setTrocando(false)}>
            Voltar para a cobrança aberta
          </Button>
        )}
      </>
    );
  }

  return (
    <PageContainer size="sm" className="pt-4 pb-10 sm:pt-6 md:pb-16">
      <BotaoVoltar fallbackHref="/agendamentos" className="mb-2" />

      <h1 className="text-h4 font-bold text-foreground">Pagamento</h1>

      <Card padding="default" className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-body font-semibold text-foreground break-words">{agendamento.servicoNome}</p>
            <p className="text-body-sm text-muted-foreground">{formatarQuando(agendamento.dataHora)}</p>
          </div>
          <p className="shrink-0 text-h6 font-bold text-foreground tabular-nums">{valorTexto}</p>
        </div>

        {conteudo}
      </Card>
    </PageContainer>
  );
}
