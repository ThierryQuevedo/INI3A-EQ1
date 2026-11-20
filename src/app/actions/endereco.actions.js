'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { getSession } from '@/app/actions/auth.actions';
import { geocodificarEndereco, enderecoDasCoordenadas } from '@/lib/geocodificacao';

const TAMANHO_MAXIMO = 200;

async function salvarEndereco(usuarioId, dados) {
  await db.update(usuarios).set(dados).where(eq(usuarios.id, usuarioId));
  // o endereco muda a distancia mostrada no catalogo e na home
  revalidatePath('/configuracoes');
  revalidatePath('/servicos');
  revalidatePath('/');
}

function coordenadaValida(valor, limite) {
  const n = Number(valor);
  return valor != null && Number.isFinite(n) && Math.abs(n) <= limite ? n : null;
}

// formulario de configuracoes: endereco digitado
export async function atualizarEnderecoAction(estadoAnterior, formData) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Faça login para continuar.' };

  const texto = String(formData.get('enderecoTexto') ?? '').trim().replace(/\s+/g, ' ');

  if (!texto) {
    await salvarEndereco(usuario.id, { enderecoTexto: null, latitude: null, longitude: null });
    return { erro: null, sucesso: true };
  }
  if (texto.length > TAMANHO_MAXIMO) {
    return { erro: `O endereço pode ter no máximo ${TAMANHO_MAXIMO} caracteres.` };
  }

  let coordenadas;
  try {
    coordenadas = await geocodificarEndereco(texto);
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return { erro: 'Não foi possível verificar o endereço agora. Tente novamente em instantes.' };
  }
  if (!coordenadas) {
    return { erro: 'Não encontramos esse endereço. Inclua rua, número, cidade e estado.' };
  }

  await salvarEndereco(usuario.id, { enderecoTexto: texto, ...coordenadas });
  return { erro: null, sucesso: true };
}

// botao "usar minha localizacao atual": vira o mesmo endereco do campo manual
export async function salvarLocalizacaoAtualAction({ latitude, longitude } = {}) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Faça login para continuar.' };

  const lat = coordenadaValida(latitude, 90);
  const lng = coordenadaValida(longitude, 180);
  if (lat == null || lng == null) return { erro: 'Localização inválida.' };

  let enderecoTexto;
  try {
    enderecoTexto = await enderecoDasCoordenadas(lat, lng);
  } catch (error) {
    console.error('Erro ao buscar endereço da localização:', error);
    return { erro: 'Não foi possível descobrir o endereço da sua localização agora. Tente novamente ou digite o endereço.' };
  }
  if (!enderecoTexto) {
    return { erro: 'Não encontramos um endereço para a sua localização. Digite o endereço manualmente.' };
  }

  enderecoTexto = enderecoTexto.slice(0, TAMANHO_MAXIMO);
  await salvarEndereco(usuario.id, { enderecoTexto, latitude: lat, longitude: lng });
  return { erro: null, sucesso: true, enderecoTexto };
}
