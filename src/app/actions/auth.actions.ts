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
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24; // 1 dia

export async function cadastrar(estadoAnterior: unknown, formData: FormData) {
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

  const [novoUsuario] = await db
    .insert(usuarios)
    .values({
      nome: String(nome),
      email: String(email),
      telefone: String(telefone),
      senha: senhaHash,
      tipo: String(tipo),
    })
    .returning({ id: usuarios.id });

  if (String(tipo).toLowerCase() === 'prestador') {
    await db.insert(prestadores).values({ usuarioId: novoUsuario.id });
  }

  return await login(estadoAnterior, formData);
}

export async function login(estadoAnterior: unknown, formData: FormData) {
  const email = formData.get('email');
  const senha = formData.get('senha');

  if (!email || !senha) {
    return { erro: 'Preencha todos os campos.' };
  }

  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, String(email)))
    .limit(1);

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
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await db.delete(sessoes).where(eq(sessoes.id, sessionId));
    cookieStore.delete(SESSION_COOKIE);
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const [linha] = await db
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

  if (!linha) return null;

  if (linha.expiraEm.getTime() < Date.now()) {
    await db.delete(sessoes).where(eq(sessoes.id, sessionId));
    return null;
  }

  const { expiraEm, ...usuario } = linha;
  return usuario;
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
