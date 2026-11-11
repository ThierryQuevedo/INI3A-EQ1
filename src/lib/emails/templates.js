import { layoutEmail, escapar } from './layout.js';
import { FUSO } from '../formatoData.js';

// Precisa acompanhar o `basePath` de next.config.mjs.
const BASE_PATH = '/26-marcaai';

/** Monta uma URL absoluta para uma rota interna, já com o basePath. */
export function linkApp(rota) {
  const base = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const raiz = base.endsWith(BASE_PATH) ? base : `${base}${BASE_PATH}`;
  return `${raiz}${rota}`;
}

/** "segunda-feira, 15 de setembro de 2026 às 14:30", sempre no horário de Brasília (o servidor pode estar em UTC). */
export function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR', {
    timeZone: FUSO,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function estrelas(nota) {
  const n = Number(nota) || 0;
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
}

// Cada template devolve o mesmo formato:
//   assunto  → linha de assunto do e-mail
//   titulo   → título curto, guardado em `notificacoes.titulo`
//   mensagem → versão em texto puro, guardada em `notificacoes.mensagem`
//   link     → para onde a notificação leva
//   html     → corpo do e-mail

export function emailNovoAgendamentoPrestador({ prestadorNome, clienteNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/dashboard');

  return {
    assunto: `Novo agendamento de ${clienteNome}`,
    titulo: 'Novo agendamento',
    mensagem: `${clienteNome} agendou "${servicoNome}" para ${quando}. Confirme ou cancele pelo painel.`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${prestadorNome}!`,
      paragrafos: [
        `Você recebeu um novo agendamento de <strong>${escapar(clienteNome)}</strong>. Ele está aguardando a sua confirmação.`,
      ],
      destaque: {
        rotulo: 'Detalhes do agendamento',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Cliente', escapar(clienteNome)],
          ['Quando', escapar(quando)],
        ],
      },
      cta: { texto: 'Ver no painel', href: link },
    }),
  };
}

export function emailAgendamentoSolicitadoCliente({ clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/agendamentos');

  return {
    assunto: `Agendamento solicitado: ${servicoNome}`,
    titulo: 'Agendamento solicitado',
    mensagem: `Seu pedido de "${servicoNome}" com ${prestadorNome} para ${quando} foi enviado e aguarda confirmação.`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${clienteNome}!`,
      paragrafos: [
        `Recebemos seu pedido de agendamento. Assim que <strong>${escapar(prestadorNome)}</strong> confirmar, avisamos você por e-mail.`,
      ],
      destaque: {
        rotulo: 'Detalhes do agendamento',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Profissional', escapar(prestadorNome)],
          ['Quando', escapar(quando)],
          ['Status', 'Aguardando confirmação'],
        ],
      },
      cta: { texto: 'Ver meus agendamentos', href: link },
    }),
  };
}

export function emailAgendamentoConfirmado({ agendamentoId, clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp(`/agendamentos/${agendamentoId}/pagamento/`);

  return {
    assunto: `Agendamento confirmado: ${servicoNome}`,
    titulo: 'Agendamento confirmado',
    mensagem: `${prestadorNome} confirmou seu agendamento de "${servicoNome}" para ${quando}. Você já pode pagar pelo app.`,
    link,
    html: layoutEmail({
      saudacao: `Boa notícia, ${clienteNome}!`,
      paragrafos: [
        `<strong>${escapar(prestadorNome)}</strong> confirmou o seu agendamento. Você já pode pagar pelo app com PIX, cartão ou boleto.`,
      ],
      destaque: {
        rotulo: 'Detalhes do agendamento',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Profissional', escapar(prestadorNome)],
          ['Quando', escapar(quando)],
          ['Status', 'Confirmado'],
        ],
      },
      cta: { texto: 'Pagar agora', href: link },
    }),
  };
}

export function emailPagamentoConfirmadoCliente({ agendamentoId, clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp(`/agendamentos/${agendamentoId}/pagamento/`);

  return {
    assunto: `Pagamento confirmado: ${servicoNome}`,
    titulo: 'Pagamento confirmado',
    mensagem: `Recebemos o pagamento de "${servicoNome}" com ${prestadorNome}, marcado para ${quando}.`,
    link,
    html: layoutEmail({
      saudacao: `Tudo certo, ${clienteNome}!`,
      paragrafos: ['Recebemos o seu pagamento. O comprovante fica disponível no app.'],
      destaque: {
        rotulo: 'Detalhes do pagamento',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Profissional', escapar(prestadorNome)],
          ['Quando', escapar(quando)],
          ['Status', 'Pago'],
        ],
      },
      cta: { texto: 'Ver pagamento', href: link },
    }),
  };
}

export function emailPagamentoConfirmadoPrestador({ prestadorNome, clienteNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/agendamentos');

  return {
    assunto: `Pagamento recebido de ${clienteNome}`,
    titulo: 'Pagamento recebido',
    mensagem: `${clienteNome} pagou "${servicoNome}", marcado para ${quando}.`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${prestadorNome}!`,
      paragrafos: [`<strong>${escapar(clienteNome)}</strong> pagou o agendamento pelo app.`],
      destaque: {
        rotulo: 'Detalhes do agendamento',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Cliente', escapar(clienteNome)],
          ['Quando', escapar(quando)],
          ['Pagamento', 'Pago'],
        ],
      },
      cta: { texto: 'Ver agenda', href: link },
    }),
  };
}

export function emailPagamentoReembolsado({ clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/agendamentos');

  return {
    assunto: `Reembolso feito: ${servicoNome}`,
    titulo: 'Reembolso feito',
    mensagem: `O pagamento de "${servicoNome}" com ${prestadorNome}, marcado para ${quando}, foi devolvido.`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${clienteNome}!`,
      paragrafos: [
        'Devolvemos o valor total do seu pagamento pela mesma forma usada. No cartão, a devolução pode levar algumas faturas para aparecer.',
      ],
      destaque: {
        rotulo: 'Detalhes do reembolso',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Profissional', escapar(prestadorNome)],
          ['Quando', escapar(quando)],
          ['Status', 'Reembolsado'],
        ],
      },
      cta: { texto: 'Ver meus agendamentos', href: link },
    }),
  };
}

export function emailAgendamentoCancelado({ clienteNome, prestadorNome, servicoNome, dataHora, canceladoPeloCliente, motivo }) {
  const quando = formatarDataHora(dataHora);
  const destinatarioNome = canceladoPeloCliente ? prestadorNome : clienteNome;
  const quemCancelou = canceladoPeloCliente ? clienteNome : prestadorNome;
  const link = linkApp(canceladoPeloCliente ? '/agendamentos' : '/servicos');
  const complementoMotivo = motivo ? ` Motivo: "${motivo}"` : '';

  const itens = [
    ['Serviço', escapar(servicoNome)],
    [canceladoPeloCliente ? 'Cliente' : 'Profissional', escapar(quemCancelou)],
    ['Quando', escapar(quando)],
  ];
  if (motivo) itens.push(['Motivo', `“${escapar(motivo)}”`]);

  return {
    assunto: `Agendamento cancelado: ${servicoNome}`,
    titulo: 'Agendamento cancelado',
    mensagem: `${quemCancelou} cancelou o agendamento de "${servicoNome}" de ${quando}.${complementoMotivo}`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${destinatarioNome}.`,
      paragrafos: [
        `<strong>${escapar(quemCancelou)}</strong> cancelou o agendamento.`,
        canceladoPeloCliente
          ? 'O horário voltou a ficar livre na sua agenda.'
          : 'Você pode escolher um novo horário ou procurar outro profissional no catálogo.',
      ],
      destaque: { rotulo: 'Agendamento cancelado', itens },
      cta: canceladoPeloCliente
        ? { texto: 'Ver minha agenda', href: link }
        : { texto: 'Buscar serviços', href: link },
    }),
  };
}

export function emailCodigoExclusaoServico({ usuarioNome, servicoNome, codigo }) {
  return {
    assunto: `${codigo} é o seu código para excluir um serviço`,
    html: layoutEmail({
      saudacao: `Olá, ${usuarioNome}.`,
      paragrafos: [
        `Recebemos um pedido para excluir o serviço <strong>${escapar(servicoNome)}</strong>. Para confirmar, use o código abaixo. Ele vale por 10 minutos.`,
        'Se não foi você, não informe este código a ninguém e troque a sua senha.',
      ],
      destaque: {
        rotulo: 'Código de confirmação',
        itens: [['Código', `<span style="font-size: 22px; font-weight: 700; letter-spacing: 0.12em;">${escapar(codigo)}</span>`]],
      },
    }),
  };
}

export function emailNovaMensagem({ agendamentoId, destinatarioNome, remetenteNome, servicoNome, texto }) {
  const link = linkApp(`/mensagens/${agendamentoId}/`);
  const previa = texto.length > 140 ? `${texto.slice(0, 140)}…` : texto;

  return {
    assunto: `Nova mensagem de ${remetenteNome}`,
    titulo: 'Nova mensagem',
    mensagem: `${remetenteNome}: "${previa}"`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${destinatarioNome}!`,
      paragrafos: [
        `<strong>${escapar(remetenteNome)}</strong> enviou uma mensagem sobre <strong>${escapar(servicoNome)}</strong>:`,
        `“${escapar(previa)}”`,
      ],
      cta: { texto: 'Responder', href: link },
    }),
  };
}

export function emailServicoConcluido({ agendamentoId, clienteNome, prestadorNome, servicoNome }) {
  const link = linkApp(`/avaliar/${agendamentoId}/`);

  return {
    assunto: `Seu serviço "${servicoNome}" foi concluído`,
    titulo: 'Serviço concluído',
    mensagem: `Seu serviço "${servicoNome}" com ${prestadorNome} foi marcado como concluído. Que tal avaliar?`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${clienteNome}!`,
      paragrafos: [
        `Seu serviço <strong>${escapar(servicoNome)}</strong> com <strong>${escapar(prestadorNome)}</strong> foi marcado como concluído.`,
        'Conta pra gente como foi a sua experiência? Sua avaliação ajuda outros clientes e o profissional a melhorar cada vez mais.',
      ],
      cta: { texto: 'Avaliar serviço', href: link },
    }),
  };
}

export function emailNovaAvaliacao({ prestadorNome, clienteNome, servicoNome, nota, comentario }) {
  const link = linkApp('/dashboard');
  const itens = [
    ['Serviço', escapar(servicoNome)],
    ['Cliente', escapar(clienteNome)],
    ['Nota', `${escapar(estrelas(nota))} (${escapar(nota)} de 5)`],
  ];

  if (comentario) {
    itens.push(['Comentário', `“${escapar(comentario)}”`]);
  }

  return {
    assunto: `Você recebeu uma avaliação de ${nota} estrela${Number(nota) === 1 ? '' : 's'}`,
    titulo: 'Nova avaliação',
    mensagem: `${clienteNome} avaliou "${servicoNome}" com ${nota} de 5${comentario ? `: "${comentario}"` : '.'}`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${prestadorNome}!`,
      paragrafos: [
        `<strong>${escapar(clienteNome)}</strong> avaliou o serviço que você prestou.`,
      ],
      destaque: { rotulo: 'Avaliação recebida', itens },
      cta: { texto: 'Ver no painel', href: link },
    }),
  };
}
