 'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, categorias, prestadores } from '@/db/schema';
import { getSession } from './auth.actions';
import { gerarSlug } from '@/lib/slug';
import { imagemPublica } from '@/lib/imagemPublica';

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
  // Chamada por componente cliente (disponibilidades): a foto vai como
  // endereço curto, não como base64 (ver lib/imagemPublica.js).
  return await db
    .select({
      ...getTableColumns(servicos),
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
    })
    .from(servicos)
    .where(eq(servicos.prestadorId, Number(prestadorId)));
}

// Assinatura do useActionState: devolve { erro } em vez de lançar, para o
// formulário mostrar a mensagem sem perder o que a pessoa digitou.
export async function cadastrarServico(_estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  const prestadorId = Number(usuario.id);

  const nome = formData.get('nome')?.toString().trim() || '';
  const categoriaIdRaw = formData.get('categoriaId')?.toString() || '';
  const novaCategoriaNome = formData.get('novaCategoria')?.toString().trim() || '';
  const preco = formData.get('preco')?.toString() || '';
  const duracaoRaw = formData.get('duracaoEstimada')?.toString() || '';
  const descricao = formData.get('descricao')?.toString().trim() || '';

  // Valida tudo antes de gravar qualquer coisa.
  if (!nome) return { erro: 'Informe o nome do serviço.', campo: 'nome' };
  if (!categoriaIdRaw) return { erro: 'Selecione uma categoria para continuar.', campo: 'categoriaId' };
  if (categoriaIdRaw === 'outro' && !novaCategoriaNome) {
    return { erro: 'Informe o nome da nova categoria.', campo: 'novaCategoria' };
  }

  const precoNum = Number(preco);
  if (!preco || isNaN(precoNum) || precoNum <= 0 || precoNum > 999999.99) {
    return { erro: 'O preço deve ficar entre R$ 0,01 e R$ 999.999,99.', campo: 'preco' };
  }

  const duracaoEstimada = Number(duracaoRaw);
  if (!Number.isInteger(duracaoEstimada) || duracaoEstimada < 1 || duracaoEstimada > 1440) {
    return { erro: 'A duração deve ser um número inteiro de minutos, entre 1 e 1440.', campo: 'duracaoEstimada' };
  }

  const urlImagemRaw = formData.get('urlImagem');
  const urlImagem = urlImagemRaw && urlImagemRaw.toString().trim() !== '' ? urlImagemRaw.toString().trim() : null;

  try {
    const [prestadorExiste] = await db
      .select({ usuarioId: prestadores.usuarioId })
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

    let categoriaIdFinal: number;
    if (categoriaIdRaw === 'outro') {
      const [novaCat] = await db
        .insert(categorias)
        .values({ nome: novaCategoriaNome })
        .returning({ id: categorias.id });
      categoriaIdFinal = novaCat.id;
    } else {
      categoriaIdFinal = Number(categoriaIdRaw);
    }

    await db.insert(servicos).values({
      prestadorId,
      categoriaId: categoriaIdFinal,
      nome,
      slug: gerarSlug(nome),
      descricao: descricao || null,
      urlImagem,
      preco: precoNum.toFixed(2),
      duracaoEstimada,
    });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return { erro: 'Não foi possível salvar o serviço agora. Seus dados continuam aqui — tente de novo em instantes.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/servicos');

  // Fora do try: redirect() funciona lançando um sinal interno do Next.
  redirect('/dashboard');
}
