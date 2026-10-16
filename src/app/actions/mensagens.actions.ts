'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, ne, asc, gt, isNull, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { agendamentos, servicos, usuarios, mensagens } from '@/db/schema';
import { getSession } from './auth.actions';

const STATUS_ENCERRADO = ['concluido', 'cancelado'];

// `usuarios` entra duas vezes no join (cliente e prestador), então o segundo
// lado precisa de um alias — mesmo padrão usado em src/lib/notificacoes.js.
const prestadorUsuarios = alias(usuarios, 'prestador_usuarios_mensagens');

/**
 * Resolve um agendamento para o usuário logado: confirma que ele é o cliente
 * ou o prestador envolvido e devolve os dados do outro lado da conversa.
 * Retorna `null` quando o agendamento não existe ou o usuário não participa dele.
 */
async function obterContextoAgendamento(agendamentoId: number, usuarioId: number) {
  const [linha] = await db
    .select({
      agendamentoId: agendamentos.id,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      clienteId: usuarios.id,
      clienteNome: usuarios.nome,
      clienteImagem: usuarios.urlImagem,
      prestadorId: prestadorUsuarios.id,
      prestadorNome: prestadorUsuarios.nome,
      prestadorImagem: prestadorUsuarios.urlImagem,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .innerJoin(prestadorUsuarios, eq(servicos.prestadorId, prestadorUsuarios.id))
    .where(eq(agendamentos.id, Number(agendamentoId)))
    .limit(1);

  if (!linha) return null;

  const souCliente = linha.clienteId === usuarioId;
  const souPrestador = linha.prestadorId === usuarioId;
  if (!souCliente && !souPrestador) return null;

  const outroUsuario = souCliente
    ? { id: linha.prestadorId, nome: linha.prestadorNome, urlImagem: linha.prestadorImagem }
    : { id: linha.clienteId, nome: linha.clienteNome, urlImagem: linha.clienteImagem };

  return {
    agendamentoId: linha.agendamentoId,
    status: linha.status,
    servicoNome: linha.servicoNome,
    outroUsuario,
    podeEnviar: !STATUS_ENCERRADO.includes(linha.status),
  };
}

/** Lista as conversas do usuário logado (uma por agendamento), com prévia e não lidas. */
export async function listarConversas() {
  const usuario = await getSession();
  if (!usuario) return [];

  const filtro =
    usuario.tipo === 'prestador'
      ? eq(servicos.prestadorId, usuario.id)
      : eq(agendamentos.clienteId, usuario.id);

  const linhas = await db
    .select({
      agendamentoId: agendamentos.id,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      clienteId: usuarios.id,
      clienteNome: usuarios.nome,
      clienteImagem: usuarios.urlImagem,
      prestadorId: prestadorUsuarios.id,
      prestadorNome: prestadorUsuarios.nome,
      prestadorImagem: prestadorUsuarios.urlImagem,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .innerJoin(prestadorUsuarios, eq(servicos.prestadorId, prestadorUsuarios.id))
    .where(filtro);

  if (linhas.length === 0) return [];

  const agendamentoIds = linhas.map((l) => l.agendamentoId);

  const todasMensagens = await db
    .select()
    .from(mensagens)
    .where(inArray(mensagens.agendamentoId, agendamentoIds))
    .orderBy(asc(mensagens.criadoEm));

  const mensagensPorAgendamento = new Map<number, typeof todasMensagens>();
  for (const m of todasMensagens) {
    const lista = mensagensPorAgendamento.get(m.agendamentoId) ?? [];
    lista.push(m);
    mensagensPorAgendamento.set(m.agendamentoId, lista);
  }

  const conversas = linhas.map((linha) => {
    const msgs = mensagensPorAgendamento.get(linha.agendamentoId) ?? [];
    const ultima = msgs[msgs.length - 1] ?? null;
    const naoLidas = msgs.filter((m) => m.remetenteId !== usuario.id && !m.lidaEm).length;
    const outroUsuario =
      usuario.tipo === 'prestador'
        ? { id: linha.clienteId, nome: linha.clienteNome, urlImagem: linha.clienteImagem }
        : { id: linha.prestadorId, nome: linha.prestadorNome, urlImagem: linha.prestadorImagem };

    return {
      agendamentoId: linha.agendamentoId,
      status: linha.status,
      servicoNome: linha.servicoNome,
      outroUsuario,
      ultimaMensagem: ultima
        ? { texto: ultima.texto, criadoEm: ultima.criadoEm, deMim: ultima.remetenteId === usuario.id }
        : null,
      naoLidas,
    };
  });

  conversas.sort((a, b) => {
    const dataA = a.ultimaMensagem?.criadoEm ?? 0;
    const dataB = b.ultimaMensagem?.criadoEm ?? 0;
    return new Date(dataB).getTime() - new Date(dataA).getTime();
  });

  return conversas;
}

/** Mensagens de uma conversa (ordenadas do mais antigo pro mais novo). `apósId` busca só as novas. */
export async function listarMensagens(agendamentoId: number, apósId?: number) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Não autenticado.' };

  const contexto = await obterContextoAgendamento(Number(agendamentoId), usuario.id);
  if (!contexto) return { erro: 'Conversa não encontrada.' };

  const condicoes = [eq(mensagens.agendamentoId, Number(agendamentoId))];
  if (apósId) condicoes.push(gt(mensagens.id, Number(apósId)));

  const lista = await db
    .select()
    .from(mensagens)
    .where(and(...condicoes))
    .orderBy(asc(mensagens.criadoEm));

  return {
    erro: null,
    mensagens: lista,
    outroUsuario: contexto.outroUsuario,
    status: contexto.status,
    servicoNome: contexto.servicoNome,
    podeEnviar: contexto.podeEnviar,
  };
}

/** Envia uma mensagem nova, se a conversa ainda estiver aberta. */
export async function enviarMensagem({ agendamentoId, texto }: { agendamentoId: number; texto: string }) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Não autenticado.' };

  const contexto = await obterContextoAgendamento(Number(agendamentoId), usuario.id);
  if (!contexto) return { erro: 'Conversa não encontrada.' };
  if (!contexto.podeEnviar) return { erro: 'Esta conversa está encerrada.' };

  const textoLimpo = String(texto ?? '').trim();
  if (!textoLimpo) return { erro: 'Escreva uma mensagem.' };

  const [nova] = await db
    .insert(mensagens)
    .values({
      agendamentoId: Number(agendamentoId),
      remetenteId: usuario.id,
      texto: textoLimpo,
    })
    .returning();

  revalidatePath('/mensagens');
  revalidatePath(`/mensagens/${agendamentoId}`);

  return { erro: null, mensagem: nova };
}

/** Marca como lidas todas as mensagens do outro lado numa conversa. */
export async function marcarComoLidas(agendamentoId: number) {
  const usuario = await getSession();
  if (!usuario) return;

  const contexto = await obterContextoAgendamento(Number(agendamentoId), usuario.id);
  if (!contexto) return;

  await db
    .update(mensagens)
    .set({ lidaEm: new Date() })
    .where(
      and(
        eq(mensagens.agendamentoId, Number(agendamentoId)),
        ne(mensagens.remetenteId, usuario.id),
        isNull(mensagens.lidaEm)
      )
    );

  revalidatePath('/mensagens');
}

/** Total de mensagens não lidas do usuário logado, somando todas as conversas — usado no badge. */
export async function contarNaoLidas() {
  const usuario = await getSession();
  if (!usuario) return 0;

  const filtro =
    usuario.tipo === 'prestador'
      ? eq(servicos.prestadorId, usuario.id)
      : eq(agendamentos.clienteId, usuario.id);

  const [resultado] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(mensagens)
    .innerJoin(agendamentos, eq(mensagens.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(and(filtro, ne(mensagens.remetenteId, usuario.id), isNull(mensagens.lidaEm)));

  return resultado?.total ?? 0;
}
