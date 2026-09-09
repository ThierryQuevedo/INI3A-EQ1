import { layoutEmail, escapar } from './layout.js';

// Precisa acompanhar o `basePath` de next.config.mjs.
const BASE_PATH = '/26-marcaai';

/** Monta uma URL absoluta para uma rota interna, já com o basePath. */
export function linkApp(rota) {
  const base = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const raiz = base.endsWith(BASE_PATH) ? base : `${base}${BASE_PATH}`;
  return `${raiz}${rota}`;
}

/** "segunda-feira, 15 de setembro de 2026 às 14:30" */
export function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR', {
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

export function emailAgendamentoConfirmado({ clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/agendamentos');

  return {
    assunto: `Agendamento confirmado: ${servicoNome}`,
    titulo: 'Agendamento confirmado',
    mensagem: `${prestadorNome} confirmou seu agendamento de "${servicoNome}" para ${quando}.`,
    link,
    html: layoutEmail({
      saudacao: `Boa notícia, ${clienteNome}!`,
      paragrafos: [
        `<strong>${escapar(prestadorNome)}</strong> confirmou o seu agendamento. É só comparecer no horário combinado.`,
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
      cta: { texto: 'Ver meus agendamentos', href: link },
    }),
  };
}

export function emailAgendamentoCancelado({ clienteNome, prestadorNome, servicoNome, dataHora }) {
  const quando = formatarDataHora(dataHora);
  const link = linkApp('/servicos');

  return {
    assunto: `Agendamento cancelado: ${servicoNome}`,
    titulo: 'Agendamento cancelado',
    mensagem: `Seu agendamento de "${servicoNome}" com ${prestadorNome} para ${quando} foi cancelado.`,
    link,
    html: layoutEmail({
      saudacao: `Olá, ${clienteNome}.`,
      paragrafos: [
        `Infelizmente o seu agendamento com <strong>${escapar(prestadorNome)}</strong> foi cancelado.`,
        'Você pode escolher um novo horário ou procurar outro profissional no catálogo.',
      ],
      destaque: {
        rotulo: 'Agendamento cancelado',
        itens: [
          ['Serviço', escapar(servicoNome)],
          ['Profissional', escapar(prestadorNome)],
          ['Quando', escapar(quando)],
        ],
      },
      cta: { texto: 'Buscar serviços', href: link },
    }),
  };
}

export function emailServicoConcluido({ clienteNome, prestadorNome, servicoNome }) {
  const link = linkApp('/agendamentos');

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
