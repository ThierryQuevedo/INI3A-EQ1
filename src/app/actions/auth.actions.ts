'use server';

import { cookies } from 'next/headers';
import { forbidden, redirect, unstable_rethrow } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios, sessoes, prestadores } from '@/db/schema';
import { SESSION_COOKIE, COMPLETAR_CADASTRO_COOKIE, criarSessao, consumirProximo } from '@/lib/session';
import { destinoPadrao, filtroEmail, gerarSlugUnicoDeUsuario, normalizarEmail } from '@/lib/usuarios';
import { desformatarTelefone, formatarTelefone } from '@/lib/formatarTelefone';
import { SENHA_MINIMA, emailValido, telefoneValido } from '@/lib/validacao';
import { imagemPublica } from '@/lib/imagemPublica';

const ERRO_EMAIL_EM_USO = 'Já existe uma conta com este e-mail.';
const ERRO_TELEFONE_EM_USO = 'Este telefone já está em uso em outra conta.';


export async function cadastrar(estadoAnterior: unknown, formData: FormData) {
  try {
    const nome = String(formData.get('nome') ?? '').trim();
    const email = normalizarEmail(formData.get('email'));
    const senha = String(formData.get('senha') ?? '');
    const tipo = formData.get('tipo') === 'prestador' ? 'prestador' : 'cliente';
    const digitosTelefone = desformatarTelefone(formData.get('cel'));

    if (!nome || !email || !senha || !digitosTelefone) {
      return { erro: 'Campos incompletos.' };
    }
    if (!emailValido(email)) {
      return { erro: 'E-mail inválido.', errosCampos: { email: 'E-mail inválido.' } };
    }
    if (!telefoneValido(digitosTelefone)) {
      const erroTelefone = 'Telefone inválido. Ex: (11) 91234-5678';
      return { erro: erroTelefone, errosCampos: { cel: erroTelefone } };
    }
    if (senha.length < SENHA_MINIMA) {
      const erroSenha = `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
      return { erro: erroSenha, errosCampos: { senha: erroSenha } };
    }

    // Sempre na mesma máscara: é ela que a coluna única compara.
    const telefone = formatarTelefone(digitosTelefone);

    const [emailExistente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(filtroEmail(email))
      .limit(1);

    if (emailExistente) {
      return { erro: ERRO_EMAIL_EM_USO, errosCampos: { email: ERRO_EMAIL_EM_USO } };
    }

    const [telefoneExistente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.telefone, telefone))
      .limit(1);

    if (telefoneExistente) {
      return { erro: ERRO_TELEFONE_EM_USO, errosCampos: { cel: ERRO_TELEFONE_EM_USO } };
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const slug = await gerarSlugUnicoDeUsuario(nome);

    const novoUsuario = await db.transaction(async (tx) => {
      const [criado] = await tx
        .insert(usuarios)
        .values({ nome, slug, email, telefone, senha: senhaHash, tipo })
        .returning({ id: usuarios.id });

      if (tipo === 'prestador') {
        await tx.insert(prestadores).values({ usuarioId: criado.id });
      }

      return criado;
    });

    await criarSessao(novoUsuario.id);
    const proximo = await consumirProximo();
    return { erro: null, destino: proximo ?? destinoPadrao(tipo) };
  } catch (error) {
    // Dois envios simultâneos podem passar pelas consultas acima e bater na
    // restrição única do banco: é dado repetido, não falha do servidor.
    if (error?.cause?.code === '23505' || error?.code === '23505') {
      return { erro: 'Este e-mail ou telefone já está em uso em outra conta.' };
    }
    console.error('Erro no cadastro:', error);
    return { erro: 'Ocorreu um erro ao realizar o cadastro. Tente novamente mais tarde.' };
  }
}

export async function login(estadoAnterior: unknown, formData: FormData) {
  try {
    const email = formData.get('email');
    const senha = formData.get('senha');

    if (!email || !senha) {
      return { erro: 'Preencha todos os campos.' };
    }

    const resultado = await db
      .select()
      .from(usuarios)
      .where(filtroEmail(email))
      .limit(1);

    const usuario = resultado[0];
    const senhaValida = usuario ? await bcrypt.compare(String(senha), usuario.senha) : false;

    // Mesma mensagem para e-mail inexistente e senha errada: não confirma a quem
    // tenta adivinhar se aquele e-mail tem conta. Aparece uma vez só (na faixa do formulário).
    if (!senhaValida) {
      return { erro: 'E-mail ou senha incorretos.' };
    }

    await criarSessao(usuario.id);
    const proximo = await consumirProximo();

    return { erro: null, destino: proximo ?? destinoPadrao(usuario.tipo) };
  } catch (error) {
    console.error('Erro na consulta de login:', error);
    return { erro: 'Falha na conexão com o banco de dados. Tente novamente.' };
  }
}

/**
 * Último passo de quem criou a conta pelo Google: a conta nasce como cliente e
 * aqui a pessoa diz se também vai oferecer serviços. Depois disso, continua de
 * onde parou (ex.: o agendamento que estava marcando antes de entrar).
 */
export async function concluirCadastroGoogle(estadoAnterior: unknown, formData: FormData) {
  const usuario = await requireSession();
  const virarPrestador = formData.get('tipo') === 'prestador';

  if (virarPrestador && usuario.tipo !== 'prestador') {
    await db.transaction(async (tx) => {
      await tx.update(usuarios).set({ tipo: 'prestador' }).where(eq(usuarios.id, usuario.id));
      await tx.insert(prestadores).values({ usuarioId: usuario.id }).onConflictDoNothing();
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete(COMPLETAR_CADASTRO_COOKIE);

  const proximo = await consumirProximo();
  return { destino: proximo ?? destinoPadrao(virarPrestador ? 'prestador' : usuario.tipo) };
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (sessionId) {
      await db.delete(sessoes).where(eq(sessoes.id, sessionId));
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) return null;

    const resultado = await db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        slug: usuarios.slug,
        email: usuarios.email,
        telefone: usuarios.telefone,
        tipo: usuarios.tipo,
        admin: usuarios.admin,
        urlImagem: imagemPublica(usuarios.urlImagem, 'avatar', usuarios.id),
        urlBanner: imagemPublica(usuarios.urlBanner, 'banner', usuarios.id),
        criadoEm: usuarios.criadoEm,
        expiraEm: sessoes.expiraEm,
      })
      .from(sessoes)
      .innerJoin(usuarios, eq(sessoes.usuarioId, usuarios.id))
      .where(eq(sessoes.id, sessionId))
      .limit(1);

    const linha = resultado[0];

    if (!linha) return null;

    const expiraEmDate = new Date(linha.expiraEm);
    if (expiraEmDate.getTime() < Date.now()) {
      await db.delete(sessoes).where(eq(sessoes.id, sessionId));
      return null;
    }

    const { expiraEm, ...usuario } = linha;
    return usuario;

  } catch (error) {
    // cookies() lança um sinal interno do Next ao renderizar páginas estáticas no build
    // (/sobre, /termos, /suporte); ele precisa subir, senão vira log de erro falso.
    unstable_rethrow(error);
    console.error("Erro em getSession:", error);
    return null;
  }
}

export async function requireSession() {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }
  return usuario;
}

export async function requireAdmin() {
  const usuario = await requireSession();
  if (!usuario.admin) {
    forbidden();
  }
  return usuario;
}

export async function atualizarNome(estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  const nome = formData.get('nome');
  if (!nome || String(nome).trim() === '') {
    return { erro: 'Informe um nome válido.' };
  }

  await db.update(usuarios).set({ nome: String(nome).trim() }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');

  return { erro: null, sucesso: true };
}

export async function atualizarEmail(estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  // Mesma normalização do cadastro: sem ela, "Ana@x.com" passaria pela
  // checagem de "já em uso" de "ana@x.com" e o login ficaria ambíguo.
  const emailNormalizado = normalizarEmail(formData.get('email'));
  if (!emailValido(emailNormalizado)) {
    return { erro: 'Informe um e-mail válido.' };
  }

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(filtroEmail(emailNormalizado))
    .limit(1);

  if (existente && existente.id !== usuario.id) {
    return { erro: 'Este e-mail já está em uso.' };
  }

  await db.update(usuarios).set({ email: emailNormalizado }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');

  return { erro: null, sucesso: true };
}

export async function atualizarTelefone(estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  // Sempre na mesma máscara do cadastro: é ela que a checagem de "já em uso" compara.
  const telefone = formData.get('telefone');
  if (!telefoneValido(telefone)) {
    return { erro: 'Informe um telefone válido, com DDD. Ex: (11) 91234-5678' };
  }

  const telefoneNormalizado = formatarTelefone(telefone);

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.telefone, telefoneNormalizado))
    .limit(1);

  if (existente && existente.id !== usuario.id) {
    return { erro: 'Este telefone já está em uso.' };
  }

  await db.update(usuarios).set({ telefone: telefoneNormalizado }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');

  return { erro: null, sucesso: true };
}

export async function atualizarSenha(estadoAnterior: unknown, formData: FormData) {
  const usuario = await getSession();
  if (!usuario) {
    redirect('/login');
  }

  const senhaAtual = formData.get('senhaAtual');
  const novaSenha = formData.get('novaSenha');
  const confirmarSenha = formData.get('confirmarSenha');

  if (!senhaAtual || String(senhaAtual).trim() === '') {
    return { erro: 'Informe a senha atual.' };
  }

  if (!novaSenha || String(novaSenha).trim() === '') {
    return { erro: 'Informe a nova senha.' };
  }

  if (!confirmarSenha || String(confirmarSenha).trim() === '') {
    return { erro: 'Confirme a nova senha.' };
  }

  if (String(novaSenha).length < 6) {
    return { erro: 'A nova senha deve ter ao menos 6 caracteres.' };
  }

  if (String(novaSenha) !== String(confirmarSenha)) {
    return { erro: 'As senhas não coincidem.' };
  }

  const [linha] = await db
    .select({ senha: usuarios.senha })
    .from(usuarios)
    .where(eq(usuarios.id, usuario.id))
    .limit(1);

  if (!linha || !linha.senha) {
    return { erro: 'Usuário não encontrado.' };
  }

  const senhaValida = await bcrypt.compare(String(senhaAtual), linha.senha);
  if (!senhaValida) {
    return { erro: 'Senha atual incorreta.' };
  }

  const novaSenhaHash = await bcrypt.hash(String(novaSenha), 10);
  await db.update(usuarios).set({ senha: novaSenhaHash }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');

  return { erro: null, sucesso: true };
}

