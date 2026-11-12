'use server';

import { eq, or, and, avg, count, countDistinct, desc, isNotNull, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  usuarios,
  prestadores,
  servicos,
  categorias,
  agendamentos,
  avaliacoes,
} from '@/db/schema';
import { comEstatisticas } from '@/lib/avaliacoes';
import { getSession } from '@/app/actions/auth.actions';
import { imagemPublica } from '@/lib/imagemPublica';
import { podeVerContato } from '@/lib/contato';

// incluirdesativados so para o proprio prestador
export async function buscarPerfilPrestador(
  identificador: string | number,
  { incluirDesativados = false } = {}
) {
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
      criadoEm: usuarios.criadoEm,
      biografia: prestadores.biografia,
      raioAtendimentoKm: prestadores.raioAtendimentoKm,
      latitude: prestadores.latitude,
      longitude: prestadores.longitude,
      enderecoTexto: prestadores.enderecoTexto,
    })
    .from(usuarios)
    .innerJoin(prestadores, eq(prestadores.usuarioId, usuarios.id))
    .where(condicao)
    .limit(1);

  if (!dadosUsuario) return null;

  const prestadorId = dadosUsuario.id;

  // Server action também é endpoint público: quem vê os desativados e o
  // telefone é decidido pela sessão, não pelo parâmetro recebido.
  const visitante = await getSession();
  if (visitante?.id !== prestadorId) incluirDesativados = false;
  if (!(await podeVerContato(visitante?.id, prestadorId))) {
    dadosUsuario.telefone = null;
  }


  const servicosDoPrestador = await db
    .select({
      id: servicos.id,
      nome: servicos.nome,
      slug: servicos.slug,
      preco: servicos.preco,
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      duracaoEstimada: servicos.duracaoEstimada,
      categoriaNome: categorias.nome,
      desativadoEm: servicos.desativadoEm,
    })
    .from(servicos)
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        incluirDesativados ? undefined : isNull(servicos.desativadoEm)
      )
    );

  const [estatAvaliacoes] = await db
    .select({
      media: avg(avaliacoes.notaParaPrestador),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        isNotNull(avaliacoes.notaParaPrestador)
      )
    );


  const [estatClientes] = await db
    .select({
      totalClientes: countDistinct(agendamentos.clienteId),
      totalAtendimentos: count(agendamentos.id),
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(eq(servicos.prestadorId, prestadorId), eq(agendamentos.status, 'concluido'))
    );


  const ultimasAvaliacoes = await db
    .select({
      id: avaliacoes.id,
      nota: avaliacoes.notaParaPrestador,
      comentario: avaliacoes.comentarioPrestador,
      dataHora: agendamentos.dataHora,
      clienteNome: usuarios.nome,
      clienteImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
      servicoNome: servicos.nome,
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        isNotNull(avaliacoes.notaParaPrestador)
      )
    )
    .orderBy(desc(agendamentos.dataHora))
    .limit(10);

  return {
    usuario: dadosUsuario,
    servicos: await comEstatisticas(servicosDoPrestador),
    avaliacaoMedia: estatAvaliacoes?.media ? Number(estatAvaliacoes.media) : 0,
    totalAvaliacoes: estatAvaliacoes?.total ?? 0,
    totalClientesAtendidos: estatClientes?.totalClientes ?? 0,
    totalAtendimentos: estatClientes?.totalAtendimentos ?? 0,
    avaliacoes: ultimasAvaliacoes,
  };
}

export async function atualizarLocalizacaoPrestador(dados: {
  latitude?: number | null;
  longitude?: number | null;
  enderecoTexto?: string | null;
}) {
  const usuario = await getSession();
  if (!usuario || usuario.tipo !== 'prestador') {
    return { erro: 'Não autorizado.' };
  }

  const atualizacao: Record<string, number | string | null | undefined> = {};
  const coordenada = (valor, limite) => {
    if (valor == null) return null;
    const n = Number(valor);
    return Number.isFinite(n) && Math.abs(n) <= limite ? n : undefined;
  };
  if ('latitude' in dados) atualizacao.latitude = coordenada(dados.latitude, 90);
  if ('longitude' in dados) atualizacao.longitude = coordenada(dados.longitude, 180);
  if (Object.values(atualizacao).some((v) => v === undefined)) {
    return { erro: 'Localização inválida.' };
  }
  if ('enderecoTexto' in dados) atualizacao.enderecoTexto = String(dados.enderecoTexto ?? '').trim().slice(0, 200) || null;

  if (Object.keys(atualizacao).length === 0) {
    return { erro: null, sucesso: true };
  }

  await db
    .update(prestadores)
    .set(atualizacao)
    .where(eq(prestadores.usuarioId, usuario.id));

  revalidatePath('/configuracoes');
  if (usuario.slug) revalidatePath(`/prestador/${usuario.slug}`);
  revalidatePath(`/prestador/${usuario.id}`);

  return { erro: null, sucesso: true };
}

export async function atualizarEnderecoTextoAction(estadoAnterior: unknown, formData: FormData) {
  const enderecoTexto = formData.get('enderecoTexto');
  return atualizarLocalizacaoPrestador({ enderecoTexto: enderecoTexto ? String(enderecoTexto) : null });
}
export async function tornarPrestadorAction() {
  const usuario = await getSession();
  if (!usuario) {
    return { erro: 'Não autenticado.' };
  }
  if (usuario.tipo === 'prestador') {
    return { erro: null, sucesso: true };
  }

  try {
    await db.update(usuarios).set({ tipo: 'prestador' }).where(eq(usuarios.id, usuario.id));
    await db.insert(prestadores).values({ usuarioId: usuario.id }).onConflictDoNothing();
  } catch (error) {
    console.error('Erro ao virar prestador:', error);
    return { erro: 'Não foi possível concluir a mudança. Tente novamente.' };
  }

  revalidatePath('/', 'layout');
  return { erro: null, sucesso: true };
}
