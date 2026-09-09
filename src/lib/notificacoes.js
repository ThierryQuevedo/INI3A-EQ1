// Sistema de notificações do Marca Aí.
//
// Cada evento da aplicação tem uma função `notificar*` aqui. Elas recebem só o
// id do agendamento, resolvem por conta própria quem é o cliente e quem é o
// prestador, registram a notificação na tabela `notificacoes` e disparam o
// e-mail.
//
// Nenhuma função exportada lança exceção: uma falha de SMTP ou de rede é
// registrada no console (e na coluna `erro`) e nada mais. Quem chama nunca deve
// quebrar por causa de um e-mail.
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { agendamentos, notificacoes, servicos, usuarios } from '@/db/schema';
import { enviarEmail } from './email.js';
import {
  emailAgendamentoCancelado,
  emailAgendamentoConfirmado,
  emailAgendamentoSolicitadoCliente,
  emailNovaAvaliacao,
  emailNovoAgendamentoPrestador,
  emailServicoConcluido,
} from './emails/templates.js';

// `usuarios` entra duas vezes no join (cliente e prestador), então o segundo
// lado precisa de um alias.
const prestadorUsuarios = alias(usuarios, 'prestador_usuarios');

/**
 * Resolve um agendamento para os dois lados envolvidos.
 *
 * `servicos.prestadorId` aponta para `prestadores.usuarioId`, que é o próprio
 * `usuarios.id` — por isso dá para ligar direto em `usuarios` sem passar pela
 * tabela `prestadores`.
 */
async function dadosDoAgendamento(agendamentoId) {
  const [info] = await db
    .select({
      clienteId: usuarios.id,
      clienteNome: usuarios.nome,
      clienteEmail: usuarios.email,
      prestadorId: prestadorUsuarios.id,
      prestadorNome: prestadorUsuarios.nome,
      prestadorEmail: prestadorUsuarios.email,
      servicoNome: servicos.nome,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .innerJoin(prestadorUsuarios, eq(servicos.prestadorId, prestadorUsuarios.id))
    .where(eq(agendamentos.id, Number(agendamentoId)))
    .limit(1);

  return info ?? null;
}

/**
 * Grava a notificação e envia o e-mail.
 *
 * A linha é criada antes do envio para que uma falha de SMTP também fique
 * registrada, com `enviado: false` e o motivo em `erro`.
 */
async function registrarEEnviar({ usuarioId, emailDestino, tipo, template }) {
  const [registro] = await db
    .insert(notificacoes)
    .values({
      usuarioId,
      tipo,
      titulo: template.titulo,
      mensagem: template.mensagem,
      link: template.link,
      emailDestino,
      enviado: false,
    })
    .returning({ id: notificacoes.id });

  const resultado = await enviarEmail({
    to: emailDestino,
    subject: template.assunto,
    html: template.html,
  });

  await db
    .update(notificacoes)
    .set({
      enviado: resultado.enviado === true,
      erro: resultado.enviado
        ? null
        : String(resultado.erro?.message ?? resultado.erro ?? 'SMTP não configurado.'),
    })
    .where(eq(notificacoes.id, registro.id));

  return resultado;
}

/** Roda o notificador engolindo qualquer erro — e-mail nunca derruba a ação. */
async function comProtecao(nome, executar) {
  try {
    await executar();
  } catch (error) {
    console.error(`[notificacoes] falha em ${nome}:`, error);
  }
}

/** Cliente acabou de agendar: avisa o prestador e manda o comprovante ao cliente. */
export async function notificarNovoAgendamento(agendamentoId) {
  await comProtecao('notificarNovoAgendamento', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await Promise.all([
      registrarEEnviar({
        usuarioId: dados.prestadorId,
        emailDestino: dados.prestadorEmail,
        tipo: 'agendamento_criado',
        template: emailNovoAgendamentoPrestador(dados),
      }),
      registrarEEnviar({
        usuarioId: dados.clienteId,
        emailDestino: dados.clienteEmail,
        tipo: 'agendamento_solicitado',
        template: emailAgendamentoSolicitadoCliente(dados),
      }),
    ]);
  });
}

/** Prestador confirmou o agendamento: avisa o cliente. */
export async function notificarAgendamentoConfirmado(agendamentoId) {
  await comProtecao('notificarAgendamentoConfirmado', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await registrarEEnviar({
      usuarioId: dados.clienteId,
      emailDestino: dados.clienteEmail,
      tipo: 'agendamento_confirmado',
      template: emailAgendamentoConfirmado(dados),
    });
  });
}

/** Agendamento cancelado: avisa o cliente. */
export async function notificarAgendamentoCancelado(agendamentoId) {
  await comProtecao('notificarAgendamentoCancelado', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await registrarEEnviar({
      usuarioId: dados.clienteId,
      emailDestino: dados.clienteEmail,
      tipo: 'agendamento_cancelado',
      template: emailAgendamentoCancelado(dados),
    });
  });
}

/** Serviço concluído: convida o cliente a avaliar. */
export async function notificarServicoConcluido(agendamentoId) {
  await comProtecao('notificarServicoConcluido', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await registrarEEnviar({
      usuarioId: dados.clienteId,
      emailDestino: dados.clienteEmail,
      tipo: 'servico_concluido',
      template: emailServicoConcluido(dados),
    });
  });
}

/** Cliente avaliou o serviço: avisa o prestador. Vale para avaliação nova ou editada. */
export async function notificarNovaAvaliacao(agendamentoId, { nota, comentario }) {
  await comProtecao('notificarNovaAvaliacao', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await registrarEEnviar({
      usuarioId: dados.prestadorId,
      emailDestino: dados.prestadorEmail,
      tipo: 'avaliacao_recebida',
      template: emailNovaAvaliacao({ ...dados, nota, comentario }),
    });
  });
}
