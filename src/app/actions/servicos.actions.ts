'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, categorias, prestadores } from '@/db/schema';
import { getSession } from './auth.actions';
import { gerarSlug } from '@/lib/slug';

export async function buscarServico(id: number) {
  const [servico] = await db
    .select()
    .from(servicos)
    .where(eq(servicos.id, Number(id)))
    .limit(1);

  return servico ?? null;
}

export async function buscarServicoPorSlug(slug: string) {
  const [servico] = await db
    .select()
    .from(servicos)
    .where(eq(servicos.slug, slug))
    .limit(1);

  return servico ?? null;
}

export async function listarServicos() {
  return await db.select().from(servicos);
}

export async function listarCategorias() {
  return await db.select().from(categorias);
}

export async function listarServicosPorPrestador(prestadorId: number) {
  return await db
    .select()
    .from(servicos)
    .where(eq(servicos.prestadorId, Number(prestadorId)));
}

export async function cadastrarServico(formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    throw new Error('Usuário não autenticado.');
  }

  const prestadorId = Number(usuario.id);

  const [prestadorExiste] = await db
    .select()
    .from(prestadores)
    .where(eq(prestadores.usuarioId, prestadorId))
    .limit(1);

  if (!prestadorExiste) {
    await db.insert(prestadores).values({
      usuarioId: prestadorId,
      documento: formData.get('documento')?.toString() || null,
      biografia: formData.get('biografia')?.toString() || null,
      raioAtendimentoKm: formData.get('raioAtendimentoKm')
        ? Number(formData.get('raioAtendimentoKm'))
        : null,
    });
  }

  const nome = formData.get('nome');
  const categoriaIdRaw = formData.get('categoriaId');
  const novaCategoriaNome = formData.get('novaCategoria');
  const preco = formData.get('preco');
  const duracaoEstimada = formData.get('duracaoEstimada');
  const descricao = formData.get('descricao');

  if (!nome || !preco || !duracaoEstimada || !categoriaIdRaw) {
    throw new Error('Campos obrigatórios ausentes no formulário.');
  }

  let categoriaIdFinal: number;

  if (categoriaIdRaw === 'outro') {
    if (!novaCategoriaNome || novaCategoriaNome.toString().trim() === '') {
      throw new Error('O nome da nova categoria não foi informado.');
    }

    const [novaCat] = await db
      .insert(categorias)
      .values({ nome: novaCategoriaNome.toString() })
      .returning({ id: categorias.id });

    categoriaIdFinal = novaCat.id;
  } else {
    categoriaIdFinal = Number(categoriaIdRaw);
  }

  await db.insert(servicos).values({
    prestadorId,
    categoriaId: categoriaIdFinal,
    nome: nome.toString(),
    slug: gerarSlug(nome.toString()),
    descricao: descricao ? descricao.toString() : null,
    preco: preco.toString(),
    duracaoEstimada: parseInt(duracaoEstimada.toString(), 10),
  });

  revalidatePath('/dashboard');
  revalidatePath('/servicos');

  redirect('/dashboard');
}
