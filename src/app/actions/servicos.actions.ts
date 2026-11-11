 'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, categorias, prestadores } from '@/db/schema';
import { getSession } from './auth.actions';
import { gerarSlug } from '@/lib/slug';
import { imagemPublica } from '@/lib/imagemPublica';
import { CATEGORIAS_PADRAO } from '@/lib/categorias';
import { CAMINHO_BASE } from '@/lib/caminhoBase';
import { servicoTemAgendamentos } from '@/lib/servicos';
import { conferirCodigo, criarCodigo, descartarCodigo } from '@/lib/codigoVerificacao';
import { enviarEmail } from '@/lib/email';
import { emailCodigoExclusaoServico } from '@/lib/emails/templates';

const ERRO_SERVICO_COM_AGENDAMENTOS = 'Este serviço já tem agendamentos e não pode ser excluído.';

// so o dono e servico com agendamento nao e excluido
async function validarExclusaoDeServico(servicoId) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Sua sessão expirou. Entre de novo para continuar.' };

  const [servico] = await db
    .select({ id: servicos.id, nome: servicos.nome, prestadorId: servicos.prestadorId })
    .from(servicos)
    .where(eq(servicos.id, Number(servicoId)))
    .limit(1);

  if (!servico || servico.prestadorId !== usuario.id) {
    return { erro: 'Você não pode excluir este serviço.' };
  }
  if (await servicoTemAgendamentos(servico.id)) {
    return { erro: ERRO_SERVICO_COM_AGENDAMENTOS };
  }

  return { usuario, servico };
}

function chaveCodigoExclusao(usuarioId, servicoId) {
  return `excluir-servico:${usuarioId}:${servicoId}`;
}

// so categorias do sistema
export async function listarCategorias() {
  return await db
    .select()
    .from(categorias)
    .where(inArray(categorias.nome, CATEGORIAS_PADRAO));
}

export async function listarServicosPorPrestador(prestadorId: number) {
  // foto como endereco curto
  return await db
    .select({
      ...getTableColumns(servicos),
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
    })
    .from(servicos)
    .where(eq(servicos.prestadorId, Number(prestadorId)));
}

// slug unico
async function gerarSlugUnicoDeServico(nome: string) {
  const base = gerarSlug(nome) || 'servico';
  let candidato = base;

  for (let sufixo = 2; ; sufixo++) {
    const [existente] = await db
      .select({ id: servicos.id })
      .from(servicos)
      .where(eq(servicos.slug, candidato))
      .limit(1);
    if (!existente) return candidato;
    candidato = `${base}-${sufixo}`;
  }
}

// validacao comum a criar e editar
function validarCamposServico(formData) {
  const nome = formData.get('nome')?.toString().trim() || '';
  const categoriaIdRaw = formData.get('categoriaId')?.toString() || '';
  const novaCategoriaNome = formData.get('novaCategoria')?.toString().trim() || '';
  const preco = formData.get('preco')?.toString() || '';
  const duracaoRaw = formData.get('duracaoEstimada')?.toString() || '';
  const descricao = formData.get('descricao')?.toString().trim() || '';

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

  return {
    dados: {
      nome,
      categoriaIdRaw,
      novaCategoriaNome,
      preco: precoNum.toFixed(2),
      duracaoEstimada,
      descricao: descricao || null,
      urlImagem: formData.get('urlImagem')?.toString().trim() || null,
    },
  };
}

// nome de categoria e unico
async function resolverCategoriaId(categoriaIdRaw, novaCategoriaNome) {
  if (categoriaIdRaw !== 'outro') return Number(categoriaIdRaw);

  const [existente] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(sql`lower(${categorias.nome}) = ${novaCategoriaNome.toLowerCase()}`)
    .limit(1);
  if (existente) return existente.id;

  const [nova] = await db
    .insert(categorias)
    .values({ nome: novaCategoriaNome })
    .returning({ id: categorias.id });
  return nova.id;
}

export async function cadastrarServico(_estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  // so prestador cria servico
  if (usuario.tipo !== 'prestador') {
    return { erro: 'Sua conta ainda é de cliente. Vire prestador nas configurações para cadastrar serviços.' };
  }

  const prestadorId = Number(usuario.id);

  const validacao = validarCamposServico(formData);
  if (!validacao.dados) return validacao;
  const { nome, categoriaIdRaw, novaCategoriaNome, preco, duracaoEstimada, descricao, urlImagem } = validacao.dados;

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

    await db.insert(servicos).values({
      prestadorId,
      categoriaId: await resolverCategoriaId(categoriaIdRaw, novaCategoriaNome),
      nome,
      slug: await gerarSlugUnicoDeServico(nome),
      descricao,
      urlImagem,
      preco,
      duracaoEstimada,
    });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return { erro: 'Não foi possível salvar o serviço agora. Seus dados continuam aqui — tente de novo em instantes.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/servicos');

  // fora do try pois redirect lanca
  redirect('/dashboard?servico=criado');
}

// desativado sai da busca
export async function alterarServicoAtivo(servicoId: number, ativo: boolean) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Sua sessão expirou. Entre de novo para continuar.' };

  const [servico] = await db
    .select({ prestadorId: servicos.prestadorId })
    .from(servicos)
    .where(eq(servicos.id, Number(servicoId)))
    .limit(1);

  if (!servico || servico.prestadorId !== usuario.id) {
    return { erro: 'Você não pode alterar este serviço.' };
  }

  await db
    .update(servicos)
    .set({ desativadoEm: ativo ? null : new Date() })
    .where(eq(servicos.id, Number(servicoId)));

  revalidatePath('/', 'layout');
  return { erro: null, sucesso: true };
}

// exclusao etapa 1 envia codigo por email
export async function solicitarCodigoExclusaoServico(servicoId: number) {
  const validacao = await validarExclusaoDeServico(servicoId);
  if (!validacao.usuario) return { erro: validacao.erro };
  const { usuario, servico } = validacao;

  const chave = chaveCodigoExclusao(usuario.id, servico.id);
  const { codigo, aguardarSegundos } = criarCodigo(chave);
  if (!codigo) {
    return { erro: `Já enviamos um código há pouco. Aguarde ${aguardarSegundos} segundos para pedir outro.`, aguardando: true };
  }

  const email = emailCodigoExclusaoServico({ usuarioNome: usuario.nome, servicoNome: servico.nome, codigo });
  const resultado = await enviarEmail({ to: usuario.email, subject: email.assunto, html: email.html });

  if (!resultado.enviado) {
    // sem smtp em dev o codigo vai para o terminal
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[dev] Código para excluir o serviço ${servico.id}: ${codigo}`);
      return { erro: null, sucesso: true };
    }
    descartarCodigo(chave);
    return { erro: 'Não foi possível enviar o e-mail agora. O serviço não foi excluído. Tente de novo em instantes.' };
  }

  return { erro: null, sucesso: true };
}

// exclusao etapa 2 confere o codigo e exclui
export async function excluirServico(servicoId: number, codigo: string) {
  const validacao = await validarExclusaoDeServico(servicoId);
  if (!validacao.usuario) return { erro: validacao.erro };
  const { usuario, servico } = validacao;

  const conferencia = conferirCodigo(chaveCodigoExclusao(usuario.id, servico.id), codigo);
  if (!conferencia.valido) return { erro: conferencia.erro };

  try {
    await db.delete(servicos).where(eq(servicos.id, servico.id));
  } catch (error) {
    // a fk barra agendamento feito depois
    if (error?.cause?.code === '23503' || error?.code === '23503') {
      return { erro: ERRO_SERVICO_COM_AGENDAMENTOS };
    }
    console.error('Erro ao excluir serviço:', error);
    return { erro: 'Não foi possível excluir o serviço agora. Peça um novo código e tente de novo.' };
  }

  return { erro: null, destino: `/prestador/${usuario.slug || usuario.id}` };
}

// edita o servico sem mudar o slug
export async function atualizarServico(_estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  const servicoId = Number(formData.get('servicoId'));

  const [servicoAtual] = await db
    .select({ prestadorId: servicos.prestadorId, slug: servicos.slug })
    .from(servicos)
    .where(eq(servicos.id, servicoId))
    .limit(1);

  if (!servicoAtual || servicoAtual.prestadorId !== usuario.id) {
    return { erro: 'Você não pode editar este serviço.' };
  }

  const validacao = validarCamposServico(formData);
  if (!validacao.dados) return validacao;
  const { nome, categoriaIdRaw, novaCategoriaNome, preco, duracaoEstimada, descricao, urlImagem } = validacao.dados;

  // foto nao mudou
  const fotoSemMudanca = urlImagem?.startsWith(`${CAMINHO_BASE}/api/imagem/`);

  try {
    await db
      .update(servicos)
      .set({
        categoriaId: await resolverCategoriaId(categoriaIdRaw, novaCategoriaNome),
        nome,
        descricao,
        preco,
        duracaoEstimada,
        ...(fotoSemMudanca ? {} : { urlImagem }),
      })
      .where(eq(servicos.id, servicoId));
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return { erro: 'Não foi possível salvar as alterações agora. Seus dados continuam aqui — tente de novo em instantes.' };
  }

  const destino = `/servicos/${servicoAtual.slug || servicoId}`;

  revalidatePath('/dashboard');
  revalidatePath('/servicos');
  revalidatePath(destino);

  redirect(`${destino}?servico=editado`);
}
