'use server';

// "Esqueci minha senha" em duas etapas:
//   1. solicitarCodigoSenha  → manda um código de 6 dígitos para o e-mail da conta;
//   2. redefinirSenha        → confere o código, grava a nova senha e encerra as sessões.
//
// O código usa o mesmo mecanismo da exclusão de serviço (lib/codigoVerificacao.js):
// fica na memória do servidor, vale 10 minutos, só uma vez e aceita 5 tentativas.
// Não precisa de tabela nova (nenhuma mudança em db/schema.ts).

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios, sessoes } from '@/db/schema';
import { filtroEmail, normalizarEmail } from '@/lib/usuarios';
import { conferirCodigo, criarCodigo, descartarCodigo } from '@/lib/codigoVerificacao';
import { enviarEmail } from '@/lib/email';
import { emailCodigoRedefinirSenha } from '@/lib/emails/templates';
import { verificarLimite, registrarFalha, ipDaRequisicao } from '@/lib/limiteTentativas';

const TAMANHO_MINIMO_SENHA = 6;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cada pedido de código conta: no máximo 10 por IP a cada 15 minutos, para a
// tela não virar um disparador de e-mails.
const JANELA_PEDIDOS_MS = 15 * 60 * 1000;
const MAXIMO_PEDIDOS_POR_IP = 10;

function chaveCodigo(usuarioId) {
  return `redefinir-senha:${usuarioId}`;
}

async function buscarUsuarioPorEmail(email) {
  const [usuario] = await db
    .select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email })
    .from(usuarios)
    .where(filtroEmail(email))
    .limit(1);
  return usuario ?? null;
}

/**
 * Etapa 1. A resposta é sempre a mesma, exista ou não a conta: uma resposta
 * diferente deixaria descobrir quais e-mails estão cadastrados.
 */
export async function solicitarCodigoSenha(_estadoAnterior, formData) {
  const email = normalizarEmail(formData.get('email'));
  if (!RE_EMAIL.test(email)) {
    return { erro: 'Informe um e-mail válido.', errosCampos: { email: 'Informe um e-mail válido.' } };
  }

  const chaveIp = `redefinir-senha:ip:${await ipDaRequisicao()}`;
  const limite = verificarLimite(chaveIp, { maximo: MAXIMO_PEDIDOS_POR_IP });
  if (limite.bloqueado) {
    return { erro: `Muitos pedidos seguidos. Aguarde ${limite.aguardarMinutos} minuto(s) e tente de novo.` };
  }
  registrarFalha(chaveIp, { janelaMs: JANELA_PEDIDOS_MS });

  const respostaPadrao = { erro: null, sucesso: true, email };

  try {
    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) return respostaPadrao;

    const chave = chaveCodigo(usuario.id);
    const { codigo } = criarCodigo(chave);
    // Pedido repetido em menos de 1 minuto: o código anterior continua valendo.
    if (!codigo) return respostaPadrao;

    const mensagem = emailCodigoRedefinirSenha({ usuarioNome: usuario.nome, codigo });
    const resultado = await enviarEmail({ to: usuario.email, subject: mensagem.assunto, html: mensagem.html });

    if (!resultado.enviado) {
      // Sem SMTP em desenvolvimento, o código sai no terminal para dar para testar.
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[dev] Código para redefinir a senha de ${usuario.email}: ${codigo}`);
        return respostaPadrao;
      }
      descartarCodigo(chave);
      return { erro: 'Não foi possível enviar o e-mail agora. Tente de novo em instantes.' };
    }
  } catch (error) {
    console.error('Erro ao solicitar código de redefinição de senha:', error);
    return { erro: 'Não foi possível concluir o pedido agora. Tente de novo em instantes.' };
  }

  return respostaPadrao;
}

/** Etapa 2. Confere o código e troca a senha. */
export async function redefinirSenha(_estadoAnterior, formData) {
  const email = normalizarEmail(formData.get('email'));
  const codigo = String(formData.get('codigo') ?? '').replace(/\D/g, '');
  const novaSenha = String(formData.get('novaSenha') ?? '');
  const confirmarSenha = String(formData.get('confirmarSenha') ?? '');

  if (codigo.length !== 6) {
    return { erro: 'Digite os 6 números do código.', errosCampos: { codigo: 'Digite os 6 números do código.' } };
  }
  if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
    const msg = `A nova senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
    return { erro: msg, errosCampos: { novaSenha: msg } };
  }
  if (novaSenha !== confirmarSenha) {
    return { erro: 'As senhas não coincidem.', errosCampos: { confirmarSenha: 'As senhas não coincidem.' } };
  }

  try {
    const usuario = RE_EMAIL.test(email) ? await buscarUsuarioPorEmail(email) : null;
    // Conta inexistente responde como código vencido: não confirma se o e-mail existe.
    if (!usuario) {
      return { erro: 'Este código expirou. Peça um novo.', errosCampos: { codigo: 'Este código expirou. Peça um novo.' } };
    }

    const conferencia = conferirCodigo(chaveCodigo(usuario.id), codigo);
    if (!conferencia.valido) {
      return { erro: conferencia.erro, errosCampos: { codigo: conferencia.erro } };
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await db.transaction(async (tx) => {
      await tx.update(usuarios).set({ senha: senhaHash }).where(eq(usuarios.id, usuario.id));
      // Quem esqueceu a senha pode ter uma sessão aberta num aparelho que não
      // controla mais: todas são encerradas e a pessoa entra de novo.
      await tx.delete(sessoes).where(eq(sessoes.usuarioId, usuario.id));
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { erro: 'Não foi possível salvar a nova senha agora. Peça um novo código e tente de novo.' };
  }

  return { erro: null, sucesso: true };
}
