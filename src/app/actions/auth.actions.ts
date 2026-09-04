'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios, sessoes, prestadores } from '@/db/schema';
import { SESSION_COOKIE, criarSessao } from '@/lib/session';

export async function cadastrar(estadoAnterior: unknown, formData: FormData) {
  try {
    const nome = formData.get('nome');
    const email = formData.get('email');
    const senha = formData.get('senha');
    const tipo = formData.get('tipo');
    const telefone = formData.get('cel');

    if (!nome || !email || !senha || !tipo || !telefone) {
      return { erro: 'Campos incompletos.' };
    }

    const existente = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.email, String(email)))
      .limit(1);

    if (existente.length > 0) {
      return { erro: 'Já existe uma conta com este e-mail.' };
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const resultadoNovoUsuario = await db
      .insert(usuarios)
      .values({
        nome: String(nome),
        email: String(email),
        telefone: String(telefone),
        senha: senhaHash,
        tipo: String(tipo),
      })
      .returning({ id: usuarios.id });

    const novoUsuario = resultadoNovoUsuario[0];

    if (!novoUsuario) {
      return { erro: 'Erro ao criar conta de usuário.' };
    }

    if (String(tipo).toLowerCase() === 'prestador') {
      await db.insert(prestadores).values({ usuarioId: novoUsuario.id });
    }

    return await login(estadoAnterior, formData);

  } catch (error) {
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
      .where(eq(usuarios.email, String(email)))
      .limit(1);

    const usuario = resultado[0];

    if (!usuario) {
      return { erro: 'E-mail ou senha inválidos.' };
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.senha);
    if (!senhaValida) {
      return { erro: 'E-mail ou senha inválidos.' };
    }

    await criarSessao(usuario.id);

    revalidatePath('/', 'layout');

    return {
      erro: null,
      sucesso: true,
      redirectTo: usuario.tipo === 'prestador' ? '/dashboard' : '/',
    };

  } catch (error) {
    console.error('Erro na consulta de login:', error);
    return { erro: 'Falha na conexão com o banco de dados. Tente novamente.' };
  }
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
        email: usuarios.email,
        telefone: usuarios.telefone,
        tipo: usuarios.tipo,
        admin: usuarios.admin,
        urlImagem: usuarios.urlImagem,
        urlBanner: usuarios.urlBanner,
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
    redirect('/dashboard');
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

  const email = formData.get('email');
  if (!email || String(email).trim() === '') {
    return { erro: 'Informe um e-mail válido.' };
  }

  const emailNormalizado = String(email).trim();

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, emailNormalizado))
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

  const telefone = formData.get('telefone');
  if (!telefone || String(telefone).trim() === '') {
    return { erro: 'Informe um telefone válido.' };
  }

  const telefoneNormalizado = String(telefone).trim();

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

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return { erro: 'Preencha todos os campos.' };
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

  const senhaValida = await bcrypt.compare(String(senhaAtual), linha.senha);
  if (!senhaValida) {
    return { erro: 'Senha atual incorreta.' };
  }

  const novaSenhaHash = await bcrypt.hash(String(novaSenha), 10);
  await db.update(usuarios).set({ senha: novaSenhaHash }).where(eq(usuarios.id, usuario.id));

  return { erro: null, sucesso: true };
}

export async function atualizarFotoPerfil(urlImagem: string) {
  const usuario = await getSession();
  if (!usuario) {
    throw new Error('Não autorizado');
  }

  await db.update(usuarios).set({ urlImagem }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');
}

export async function atualizarUrlBanner(urlBanner: string) {
  const usuario = await getSession();
  if (!usuario) {
    throw new Error('Não autorizado');
  }

  await db.update(usuarios).set({ urlBanner }).where(eq(usuarios.id, usuario.id));

  revalidatePath('/configuracoes');
}