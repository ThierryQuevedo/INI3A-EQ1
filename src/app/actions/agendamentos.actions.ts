'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, gte, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { agendamentos, servicos, usuarios, avaliacoes } from '@/db/schema';
import { getSession } from './auth.actions';
import { enviarEmail, emailServicoConcluidoHtml } from '@/lib/email';

const prestadorUsuarios = alias(usuarios, 'prestador_usuarios');

export async function criarAgendamento({
  clienteId,
  servicoId,
  dataHora,
}: {
  clienteId: number;
  servicoId: number;
  dataHora: string;
}) {
  const [novo] = await db
    .insert(agendamentos)
    .values({
      clienteId,
      servicoId,
      dataHora: new Date(dataHora),
      status: 'pendente',
    })
    .returning();

  return novo;
}

export async function confirmarAgendamentoAction({
  servicoId,
  dataHora,
}: {
  servicoId: number;
  dataHora: string;
}) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Não autenticado.' };

  const [novo] = await db
    .insert(agendamentos)
    .values({
      clienteId: usuario.id,
      servicoId,
      dataHora: new Date(dataHora),
      status: 'pendente',
    })
    .returning();

  revalidatePath('/agendamentos');
  return novo;
}

export async function atualizarStatusAgendamento(id: number, status: string) {
  await db.update(agendamentos).set({ status }).where(eq(agendamentos.id, id));

  if (status === 'concluido') {
    await notificarClienteServicoConcluido(id).catch((error) => {
      console.error('Erro ao notificar cliente sobre conclusão do serviço:', error);
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/agendamentos');
}

async function notificarClienteServicoConcluido(agendamentoId: number) {
  const [info] = await db
    .select({
      clienteNome: usuarios.nome,
      clienteEmail: usuarios.email,
      servicoNome: servicos.nome,
      prestadorNome: prestadorUsuarios.nome,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .innerJoin(prestadorUsuarios, eq(servicos.prestadorId, prestadorUsuarios.id))
    .where(eq(agendamentos.id, agendamentoId))
    .limit(1);

  if (!info) return;

  const linkAvaliacao = `${process.env.SITE_URL || 'http://localhost:3000'}/agendamentos`;

  await enviarEmail({
    to: info.clienteEmail,
    subject: `Seu serviço "${info.servicoNome}" foi concluído`,
    html: emailServicoConcluidoHtml({
      clienteNome: info.clienteNome,
      servicoNome: info.servicoNome,
      prestadorNome: info.prestadorNome,
      linkAvaliacao,
    }),
  });
}

export async function listarAgendamentos() {
  return await db.select().from(agendamentos);
}

export async function listarMeusAgendamentos() {
  const usuario = await getSession();
  if (!usuario) return [];

  if (usuario.tipo === 'prestador') {
    return await db
      .select({
        id: agendamentos.id,
        dataHora: agendamentos.dataHora,
        status: agendamentos.status,
        servicoNome: servicos.nome,
        clienteNome: usuarios.nome,
        clienteTelefone: usuarios.telefone,
      })
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(eq(servicos.prestadorId, usuario.id))
      .orderBy(asc(agendamentos.dataHora));
  }

  return await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      servicoPreco: servicos.preco,
      prestadorNome: usuarios.nome,
      avaliacaoNota: avaliacoes.notaParaPrestador,
      avaliacaoComentario: avaliacoes.comentarioPrestador,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(avaliacoes, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(eq(agendamentos.clienteId, usuario.id))
    .orderBy(asc(agendamentos.dataHora));
}

export async function listarAgendamentosPorPrestador(prestadorId: number) {
  return await db
    .select({
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoId: agendamentos.servicoId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, Number(prestadorId)),
        gte(agendamentos.dataHora, new Date())
      )
    );
}

export async function buscarAgendamento(id: number) {
  const [agendamento] = await db
    .select()
    .from(agendamentos)
    .where(eq(agendamentos.id, Number(id)))
    .limit(1);

  return agendamento ?? null;
}

export async function atualizarAgendamento(
  id: number,
  { status, dataHora }: { status?: string; dataHora?: string }
) {
  const [atualizado] = await db
    .update(agendamentos)
    .set({
      ...(status && { status }),
      ...(dataHora && { dataHora: new Date(dataHora) }),
    })
    .where(eq(agendamentos.id, Number(id)))
    .returning();

  return atualizado ?? null;
}

export async function deletarAgendamento(id: number) {
  const [deletado] = await db
    .delete(agendamentos)
    .where(eq(agendamentos.id, Number(id)))
    .returning();

  return deletado ?? null;
}
