'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Clock3, CalendarPlus, Download, Share2, LifeBuoy } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { STATUS_AGENDAMENTO } from '@/lib/statusAgendamento';
import { formatarDiaExtenso, formatarHora, formatarHoraFalada, partesNoFuso } from '@/lib/formatoData';

function formatarDataICS(data) {
  return data.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function gerarLinkGoogleAgenda({ titulo, inicio, fim, detalhes }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${formatarDataICS(inicio)}/${formatarDataICS(fim)}`,
    details: detalhes || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarIcsDataUri({ titulo, inicio, fim, detalhes }) {
  const conteudo = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Marca Ai//Agendamento//PT-BR',
    'BEGIN:VEVENT',
    `UID:${inicio.getTime()}@marcaai`,
    `DTSTAMP:${formatarDataICS(new Date())}`,
    `DTSTART:${formatarDataICS(inicio)}`,
    `DTEND:${formatarDataICS(fim)}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${detalhes || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(conteudo)}`;
}

const classeAcaoSecundaria =
  'w-full inline-flex items-center justify-center gap-2 min-h-toque px-4 py-2 rounded-lg border border-input bg-card text-body-sm font-semibold text-foreground hover:bg-muted active:scale-[0.97] transition duracao-rapida cursor-pointer';

// pedido nasce pendente entao mostra pedido enviado
export default function PedidoEnviado({ servico, agendamento }) {
  const refTitulo = useRef(null);

  useEffect(() => {
    refTitulo.current?.focus();
  }, []);

  const inicio = new Date(agendamento.dataHora);
  const fim = new Date(inicio.getTime() + Number(servico.duracaoEstimada || 30) * 60000);
  const { dia, hora } = partesNoFuso(inicio);
  const diaTexto = formatarDiaExtenso(dia, { relativo: true });
  const horaTexto = formatarHora(hora);
  const status = STATUS_AGENDAMENTO.pendente;
  const IconStatus = status.Icon;

  const evento = {
    titulo: `${servico.nome} com ${servico.prestadorNome}`,
    inicio,
    fim,
    detalhes: 'Pedido feito pelo Marca Aí. Aguardando confirmação do profissional.',
  };

  const textoCompartilhar =
    `Pedi ${servico.nome} com ${servico.prestadorNome} para ${diaTexto.charAt(0).toLowerCase()}${diaTexto.slice(1)}, às ${horaTexto}, pelo Marca Aí. Estou aguardando a confirmação.`;

  async function compartilhar() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: textoCompartilhar });
        return;
      } catch (erro) {
        if (erro?.name === 'AbortError') return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(textoCompartilhar)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="min-h-[70dvh] flex items-start sm:items-center justify-center px-4 py-10">
      <section aria-labelledby="titulo-pedido-enviado" className="w-full max-w-md bg-card border border-border rounded-xl shadow-elevated p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="surgir size-16 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center">
            <Clock3 size={30} aria-hidden="true" />
          </span>
          <h1
            ref={refTitulo}
            id="titulo-pedido-enviado"
            tabIndex={-1}
            className="text-h4 font-bold text-foreground focus:outline-none"
          >
            Pedido enviado
          </h1>
          <p className="text-body text-foreground">
            <span className="font-semibold">{servico.nome}</span> com {servico.prestadorNome}
            <br />
            <span>{diaTexto}</span>, às{' '}
            <time dateTime={inicio.toISOString()} className="font-semibold tabular-nums whitespace-nowrap">
              <span aria-hidden="true">{horaTexto}</span>
              <span className="sr-only">{formatarHoraFalada(hora)}</span>
            </time>
          </p>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-caption font-semibold ${status.badge}`}>
            <IconStatus size={14} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        <h2 className="mt-6 font-sans text-body font-semibold text-foreground tracking-normal">O que acontece agora</h2>
        <ol className="mt-3 space-y-3 text-body-sm text-foreground">
          {[
            `${servico.prestadorNome} recebeu o seu pedido.`,
            'Quando confirmar, você recebe um aviso aqui no app e no seu e-mail, e já pode pagar por PIX, cartão ou boleto.',
            'Se não puder atender, o pedido é cancelado e você também é avisado. Aí é só escolher outro horário.',
          ].map((texto, i) => (
            <li key={i} className="flex gap-3">
              <span className="size-6 shrink-0 rounded-full bg-muted text-foreground inline-flex items-center justify-center text-caption font-bold tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <span>{texto}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button asChild size="lg" className="w-full">
            <Link href={`/agendamentos#pedido-${agendamento.id}`}>Ver meus agendamentos</Link>
          </Button>
          <a href={gerarLinkGoogleAgenda(evento)} target="_blank" rel="noopener noreferrer" className={classeAcaoSecundaria}>
            <CalendarPlus size={18} aria-hidden="true" />
            Adicionar ao Google Agenda
          </a>
          <a
            href={gerarIcsDataUri(evento)}
            download={`pedido-${servico.nome.replace(/\s+/g, '-').toLowerCase()}.ics`}
            className={classeAcaoSecundaria}
          >
            <Download size={18} aria-hidden="true" />
            Baixar para a agenda do celular (.ics)
          </a>
          <button type="button" onClick={compartilhar} className={classeAcaoSecundaria}>
            <Share2 size={18} aria-hidden="true" />
            Enviar pelo WhatsApp
          </button>
        </div>

        <p className="mt-5 text-center">
          <Link
            href="/suporte"
            className="inline-flex items-center gap-1.5 min-h-toque px-2 rounded-lg text-body-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            <LifeBuoy size={16} aria-hidden="true" />
            Precisa de ajuda?
          </Link>
        </p>
      </section>
    </div>
  );
}
