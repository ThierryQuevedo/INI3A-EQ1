'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios, sessoes, prestadores } from '@/db/schema';

const SESSION_COOKIE = 'marcaai_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24; 

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

    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(sessoes).values({
      id: sessionId,
      usuarioId: usuario.id,
      expiraEm,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiraEm,
      path: '/',
    });

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