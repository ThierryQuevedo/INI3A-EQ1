// uma funcao por evento que grava e envia email sem lancar
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { agendamentos, notificacoes, servicos, usuarios } from '@/db/schema';
import { enviarEmail } from './email.js';
import { verificarPodeAvaliar } from './avaliacoes.js';
import {
  emailAgendamentoCancelado,
  emailAgendamentoConfirmado,
  emailAgendamentoSolicitadoCliente,
  emailNovaAvaliacao,
  emailNovaMensagem,
  emailNovoAgendamentoPrestador,
  emailPagamentoConfirmadoCliente,
  emailPagamentoConfirmadoPrestador,
  emailPagamentoReembolsado,
  emailServicoConcluido,
} from './emails/templates.js';

// usuarios entra duas vezes no join
const prestadorUsuarios = alias(usuarios, 'prestador_usuarios');

// dados dos dois lados do agendamento
async function dadosDoAgendamento(agendamentoId) {
  const [info] = await db
    .select({
      agendamentoId: agendamentos.id,
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

// grava antes de enviar para registrar falha
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

// engole erro pois email nunca derruba a acao
async function comProtecao(nome, executar) {
  try {
    await executar();
  } catch (error) {
    console.error(`[notificacoes] falha em ${nome}:`, error);
  }
}

// avisa o prestador e manda comprovante
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

// avisa o cliente
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

// avisa o outro lado
export async function notificarAgendamentoCancelado(agendamentoId, { canceladoPorId, motivo }) {
  await comProtecao('notificarAgendamentoCancelado', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    const canceladoPeloCliente = canceladoPorId === dados.clienteId;

    await registrarEEnviar({
      usuarioId: canceladoPeloCliente ? dados.prestadorId : dados.clienteId,
      emailDestino: canceladoPeloCliente ? dados.prestadorEmail : dados.clienteEmail,
      tipo: 'agendamento_cancelado',
      template: emailAgendamentoCancelado({ ...dados, canceladoPeloCliente, motivo }),
    });
  });
}

// avisa o outro lado da conversa
export async function notificarNovaMensagem(agendamentoId, { remetenteId, texto }) {
  await comProtecao('notificarNovaMensagem', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    const enviadaPeloCliente = remetenteId === dados.clienteId;

    await registrarEEnviar({
      usuarioId: enviadaPeloCliente ? dados.prestadorId : dados.clienteId,
      emailDestino: enviadaPeloCliente ? dados.prestadorEmail : dados.clienteEmail,
      tipo: 'mensagem_recebida',
      template: emailNovaMensagem({
        agendamentoId,
        destinatarioNome: enviadaPeloCliente ? dados.prestadorNome : dados.clienteNome,
        remetenteNome: enviadaPeloCliente ? dados.clienteNome : dados.prestadorNome,
        servicoNome: dados.servicoNome,
        texto,
      }),
    });
  });
}

// convida o cliente a avaliar
export async function notificarServicoConcluido(agendamentoId) {
  await comProtecao('notificarServicoConcluido', async () => {
    const { pode, motivo } = await verificarPodeAvaliar(agendamentoId);
    if (!pode) {
      console.info(`[notificacoes] convite de avaliação do agendamento ${agendamentoId} não enviado (${motivo}).`);
      return;
    }

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

// comprovante e aviso
export async function notificarPagamentoConfirmado(agendamentoId) {
  await comProtecao('notificarPagamentoConfirmado', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await Promise.all([
      registrarEEnviar({
        usuarioId: dados.clienteId,
        emailDestino: dados.clienteEmail,
        tipo: 'pagamento_confirmado',
        template: emailPagamentoConfirmadoCliente(dados),
      }),
      registrarEEnviar({
        usuarioId: dados.prestadorId,
        emailDestino: dados.prestadorEmail,
        tipo: 'pagamento_recebido',
        template: emailPagamentoConfirmadoPrestador(dados),
      }),
    ]);
  });
}

// avisa o cliente
export async function notificarPagamentoReembolsado(agendamentoId) {
  await comProtecao('notificarPagamentoReembolsado', async () => {
    const dados = await dadosDoAgendamento(agendamentoId);
    if (!dados) return;

    await registrarEEnviar({
      usuarioId: dados.clienteId,
      emailDestino: dados.clienteEmail,
      tipo: 'pagamento_reembolsado',
      template: emailPagamentoReembolsado(dados),
    });
  });
}

// avisa o prestador
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
