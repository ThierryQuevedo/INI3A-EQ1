'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios, servicos } from '@/db/schema';
import { getSession } from './auth.actions';

/**
 * Salva a URL da foto de perfil no banco de dados para o usuário autenticado
 * @param {string|null} urlImagem
 * @returns {Promise<{ sucesso: boolean, erro?: string, url?: string|null }>}
 */
export async function salvarFotoPerfil(urlImagem) {
  try {
    const usuario = await getSession();
    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não autenticado.' };
    }

    const valorFinal = urlImagem && urlImagem.trim() !== '' ? urlImagem.trim() : null;

    await db
      .update(usuarios)
      .set({ urlImagem: valorFinal })
      .where(eq(usuarios.id, usuario.id));

    revalidatePath('/configuracoes');
    revalidatePath('/', 'layout');

    return { sucesso: true, url: valorFinal };
  } catch (error) {
    console.error('Erro ao salvar foto de perfil no banco:', error);
    return { sucesso: false, erro: 'Erro ao persistir a foto de perfil no banco de dados.' };
  }
}

/**
 * Salva a URL da capa/banner no banco de dados para o usuário autenticado
 * @param {string|null} urlBanner
 * @returns {Promise<{ sucesso: boolean, erro?: string, url?: string|null }>}
 */
export async function salvarBannerPerfil(urlBanner) {
  try {
    const usuario = await getSession();
    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não autenticado.' };
    }

    const valorFinal = urlBanner && urlBanner.trim() !== '' ? urlBanner.trim() : null;

    await db
      .update(usuarios)
      .set({ urlBanner: valorFinal })
      .where(eq(usuarios.id, usuario.id));

    revalidatePath('/configuracoes');
    revalidatePath('/', 'layout');

    return { sucesso: true, url: valorFinal };
  } catch (error) {
    console.error('Erro ao salvar banner do perfil no banco:', error);
    return { sucesso: false, erro: 'Erro ao persistir a capa do perfil no banco de dados.' };
  }
}

/**
 * Salva ou atualiza a URL da imagem de um serviço existente
 * @param {number|string} servicoId
 * @param {string|null} urlImagem
 * @returns {Promise<{ sucesso: boolean, erro?: string, url?: string|null }>}
 */
export async function salvarImagemServico(servicoId, urlImagem) {
  try {
    const usuario = await getSession();
    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não autenticado.' };
    }

    const valorFinal = urlImagem && urlImagem.trim() !== '' ? urlImagem.trim() : null;

    await db
      .update(servicos)
      .set({ urlImagem: valorFinal })
      .where(eq(servicos.id, Number(servicoId)));

    revalidatePath('/servicos');
    revalidatePath('/dashboard');

    return { sucesso: true, url: valorFinal };
  } catch (error) {
    console.error('Erro ao salvar imagem do serviço no banco:', error);
    return { sucesso: false, erro: 'Erro ao persistir a imagem do serviço no banco de dados.' };
  }
}
