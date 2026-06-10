'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '../../db/index.js';
import { servicos, categorias } from "../../db/schema.js";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('marcaai_token')?.value;

  if (!token) return null; 
  
  return token;
}

export async function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64Url = rawToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Malformed or invalid JWT token", error);
    return null;
  }
}

export async function executarCadastro(formData) {
  const nome = formData.get('nome');
  const email = formData.get('email');
  const senha = formData.get('senha');
  const tipo = formData.get('tipo'); 
  const telefone = formData.get('cel');
  
  try {
    const resposta = await fetch('http://127.0.0.1:5000/api/auth/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, telefone, senha, tipo }),
    });
    
    const dados = await resposta.json();
    if (!resposta.ok) {
      console.log(dados.error);
      return { erro: dados.error || 'Erro ao cadastrar' };
    }
  } catch (error) {
    console.error("Erro de conexão no cadastro:", error);
    return { erro: "Servidor fora do ar. Tente mais tarde." };
  }
  
  await executarLogin(formData);
}

export async function executarLogin(formData) {
  console.log("executarLogin c.")
  const email = formData.get('email');
  const senha = formData.get('senha');
  
  let resposta;
  try {
    resposta = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
  } catch (error) {
    console.error("Erro de conexão no login:", error);
    return { erro: "Servidor fora do ar. Tente mais tarde." };
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    return { erro: dados.error || 'Credenciais inválidas.' };
  }

  try {
    const token = resposta.headers.get('Authorization');
    
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set('marcaai_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }
  } catch (err) {
    console.log("Erro ao salvar cookie:", err);
  }

  const tokenGerado = resposta.headers.get('Authorization');
  const usuario = await decodeJwtPayload(tokenGerado);

  revalidatePath('/', 'layout');

  if (usuario && usuario.tipo === "prestador") {
    redirect("/dashboard");
  } else {
    redirect("/usuario");
  }
}

export async function executarCadastroServico(formData) {
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  
  if (!usuario || !usuario.id) {
    throw new Error("Usuário não autenticado.");
  }
  
  const prestadorId = usuario.id;

  const nome = formData.get("nome");
  const categoriaIdRaw = formData.get("categoriaId"); 
  const novaCategoriaNome = formData.get("novaCategoria");
  const preco = formData.get("preco");
  const duracaoEstimada = formData.get("duracaoEstimada");
  const descricao = formData.get("descricao");

  if (!nome || !preco || !duracaoEstimada || !categoriaIdRaw) {
    throw new Error("Campos obrigatórios ausentes no formulário.");
  }

  let categoriaIdFinal = null;

  if (categoriaIdRaw === "outro") {
    if (!novaCategoriaNome || novaCategoriaNome.trim() === "") {
      throw new Error("O nome da nova categoria não foi informado.");
    }

    const [novaCat] = await db
      .insert(categorias)
      .values({ nome: novaCategoriaNome })
      .returning({ id: categorias.id });

    categoriaIdFinal = novaCat.id;
  } else {
    categoriaIdFinal = Number(categoriaIdRaw);
  }

  try {
    await db.insert(servicos).values({
      prestadorId: prestadorId,
      categoriaId: categoriaIdFinal,
      nome: nome.toString(),
      descricao: descricao ? descricao.toString() : null, 
      preco: preco.toString(), 
      duracaoEstimada: parseInt(duracaoEstimada, 10),
    });
  } catch (error) {
    console.error("===> ERRO DETALHADO DO BANCO:", error.message);
    throw error;
  }
  revalidatePath('/dashboard');
  revalidatePath('/catalogo');

  redirect("/dashboard"); 
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('marcaai_token'); 
  revalidatePath('/', 'layout');
  redirect('/login');
}