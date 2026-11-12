'use server';

import { eq, or, and, avg, count, desc, isNotNull, isNull, gte } from 'drizzle-orm';
import { db } from '@/db';
import {
  usuarios,
  servicos,
  categorias,
  agendamentos,
  avaliacoes,
} from '@/db/schema';
import { imagemPublica } from '@/lib/imagemPublica';
import { getSession } from './auth.actions';
import { podeVerContato } from '@/lib/contato';

export async function buscarPerfilCliente(identificador) {
  if (!identificador) return null;

  const isNumero = !isNaN(Number(identificador)) && Number(identificador) > 0;
  const condicao = isNumero
    ? or(eq(usuarios.id, Number(identificador)), eq(usuarios.slug, String(identificador)))
    : eq(usuarios.slug, String(identificador));

  const [dadosUsuario] = await db
    .select({
      id: usuarios.id,
      slug: usuarios.slug,
      nome: usuarios.nome,
      telefone: usuarios.telefone,
      urlImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
      urlBanner: imagemPublica(usuarios.urlBanner, 'banner', usuarios.id),
      tipo: usuarios.tipo,
      criadoEm: usuarios.criadoEm,
    })
    .from(usuarios)
    .where(condicao)
    .limit(1);

  if (!dadosUsuario) return null;

  // E-mail nunca sai daqui; telefone só para quem já tem agendamento com a pessoa.
  const visitante = await getSession();
  if (!(await podeVerContato(visitante?.id, dadosUsuario.id))) {
    dadosUsuario.telefone = null;
  }

  const clienteId = dadosUsuario.id;

  // avaliacoes recebidas dos prestadores
  const [estatAvaliacoes] = await db
    .select({
      media: avg(avaliacoes.notaParaCliente),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(
      and(
        eq(agendamentos.clienteId, clienteId),
        isNotNull(avaliacoes.notaParaCliente)
      )
    );

  const [estatAgendamentos] = await db
    .select({
      total: count(agendamentos.id),
    })
    .from(agendamentos)
    .where(eq(agendamentos.clienteId, clienteId));

  const [estatConcluidos] = await db
    .select({
      totalConcluidos: count(agendamentos.id),
    })
    .from(agendamentos)
    .where(
      and(
        eq(agendamentos.clienteId, clienteId),
        eq(agendamentos.status, 'concluido')
      )
    );

  const ultimasAvaliacoes = await db
    .select({
      id: avaliacoes.id,
      nota: avaliacoes.notaParaCliente,
      comentario: avaliacoes.comentarioCliente,
      dataHora: agendamentos.dataHora,
      prestadorNome: usuarios.nome,
      prestadorImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
      prestadorSlug: usuarios.slug,
      servicoNome: servicos.nome,
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .where(
      and(
        eq(agendamentos.clienteId, clienteId),
        isNotNull(avaliacoes.notaParaCliente)
      )
    )
    .orderBy(desc(agendamentos.dataHora))
    .limit(10);

  return {
    usuario: dadosUsuario,
    totalAgendamentos: estatAgendamentos?.total ?? 0,
    totalConcluidos: estatConcluidos?.totalConcluidos ?? 0,
    avaliacaoMedia: estatAvaliacoes?.media ? Number(estatAvaliacoes.media) : 0,
    totalAvaliacoesRecebidas: estatAvaliacoes?.total ?? 0,
    avaliacoes: ultimasAvaliacoes,
  };
}

// cliente vem da sessao nunca de parametro
export async function buscarDashboardCliente() {
  const usuario = await getSession();
  if (!usuario) return null;

  const id = usuario.id;
  const agora = new Date();

  const proximos = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoId: servicos.id,
      servicoNome: servicos.nome,
      servicoSlug: servicos.slug,
      servicoPreco: servicos.preco,
      servicoDuracao: servicos.duracaoEstimada,
      servicoImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      prestadorNome: usuarios.nome,
      prestadorSlug: usuarios.slug,
      prestadorTelefone: usuarios.telefone,
      prestadorImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .where(
      and(
        eq(agendamentos.clienteId, id),
        gte(agendamentos.dataHora, agora),
        or(eq(agendamentos.status, 'pendente'), eq(agendamentos.status, 'confirmado'))
      )
    )
    .orderBy(agendamentos.dataHora);

  const historico = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoId: servicos.id,
      servicoNome: servicos.nome,
      servicoSlug: servicos.slug,
      servicoPreco: servicos.preco,
      servicoDuracao: servicos.duracaoEstimada,
      servicoImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      prestadorNome: usuarios.nome,
      prestadorSlug: usuarios.slug,
      prestadorTelefone: usuarios.telefone,
      prestadorImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
      servicoDesativadoEm: servicos.desativadoEm,
      avaliacaoNota: avaliacoes.notaParaPrestador,
      avaliacaoComentario: avaliacoes.comentarioPrestador,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(avaliacoes, eq(agendamentos.id, avaliacoes.agendamentoId))
    .where(eq(agendamentos.clienteId, id))
    .orderBy(desc(agendamentos.dataHora))
    .limit(10);

  // concluidos ainda sem avaliacao
  const avaliacoesPendentes = await db
    .select({
      agendamentoId: agendamentos.id,
      dataHora: agendamentos.dataHora,
      servicoNome: servicos.nome,
      servicoSlug: servicos.slug,
      prestadorNome: usuarios.nome,
      prestadorSlug: usuarios.slug,
      prestadorImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(avaliacoes, eq(agendamentos.id, avaliacoes.agendamentoId))
    .where(
      and(
        eq(agendamentos.clienteId, id),
        eq(agendamentos.status, 'concluido'),
        or(isNull(avaliacoes.id), isNull(avaliacoes.notaParaPrestador))
      )
    )
    .orderBy(desc(agendamentos.dataHora))
    .limit(5);

  const [reputacao] = await db
    .select({
      media: avg(avaliacoes.notaParaCliente),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(
      and(
        eq(agendamentos.clienteId, id),
        isNotNull(avaliacoes.notaParaCliente)
      )
    );

  const [totalAgendamentos] = await db
    .select({ total: count(agendamentos.id) })
    .from(agendamentos)
    .where(eq(agendamentos.clienteId, id));

  const [totalConcluidos] = await db
    .select({ total: count(agendamentos.id) })
    .from(agendamentos)
    .where(and(eq(agendamentos.clienteId, id), eq(agendamentos.status, 'concluido')));

  return {
    proximos,
    historico,
    avaliacoesPendentes,
    reputacao: {
      media: reputacao?.media ? Number(reputacao.media) : 0,
      total: reputacao?.total ?? 0,
    },
    metricas: {
      total: totalAgendamentos?.total ?? 0,
      concluidos: totalConcluidos?.total ?? 0,
      ativos: proximos.length,
    },
  };
}
