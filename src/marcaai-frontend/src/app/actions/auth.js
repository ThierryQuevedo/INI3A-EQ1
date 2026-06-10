'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../db/index.js';
import { servicos, categorias } from "../../db/schema.js";


export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('marcaai_token')?.value;

  if (!token) throw new Error("cookie marcaai_token is undefined. cannot provide token");
  
  return token;
}

export async function decodeJwtPayload(token) {
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

  const resposta = await fetch('http://localhost:5000/api/auth/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, telefone, senha, tipo }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    return { erro: dados.error || 'Erro ao cadastrar' };
  }
  redirect('/login')
}

export async function executarLogin(formData) {
  console.log("executarLogin c.")
  const email = formData.get('email');
  const senha = formData.get('senha');
  console.log(email);
  const tipo = "tipo";

  const resposta = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha, tipo }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    return { erro: dados.error || 'Credenciais inválidas.' };
  }
  try {
    const token = resposta.headers.get('Authorization');
    const cookieStore = await cookies();
    cookieStore.set('marcaai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    
  }
  catch (err) {
    console.log(err);
  }

  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);

  if(usuario.tipo == "prestador"){

    redirect("/dashboard");
  }
  else{
    redirect("/usuario");
  }

}

export async function executarCadastroServico(formData) {
  // 1. Pegar a sessão do prestador logado para garantir segurança
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  
  if (!usuario || !usuario.id) {
    throw new Error("Usuário não autenticado.");
  }
  
  const prestadorId = usuario.id; // Força para tipo Number se o banco for integer

  // 2. Extrair dados brutos do FormData pelos atributos 'name' do formulário
  const nome = formData.get("nome");
  const categoriaIdRaw = formData.get("categoriaId"); 
  const novaCategoriaNome = formData.get("novaCategoria");
  const preco = formData.get("preco");
  const duracaoEstimada = formData.get("duracaoEstimada");
  const descricao = formData.get("descricao");

  // Validação básica para evitar inserts vazios
  if (!nome || !preco || !duracaoEstimada || !categoriaIdRaw) {
    throw new Error("Campos obrigatórios ausentes no formulário.");
  }

  let categoriaIdFinal = null;

  // 3. Regra de negócio para salvar/definir a categoria
  if (categoriaIdRaw === "outro") {
    if (!novaCategoriaNome || novaCategoriaNome.trim() === "") {
      throw new Error("O nome da nova categoria não foi informado.");
    }

    // Cria a categoria no banco e recolhe o ID gerado automaticamente
    const [novaCat] = await db
      .insert(categorias)
      .values({ 
        nome: novaCategoriaNome 
      })
      .returning({ id: categorias.id });

    categoriaIdFinal = novaCat.id;
  } else {
    categoriaIdFinal = Number(categoriaIdRaw);
  }

// 4. Salva o serviço final no banco de dados 
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
    throw error; // Mantém o erro para o Next saber que falhou
  }

  // 5. Redireciona o usuário após o sucesso do cadastro
  redirect("/dashboard"); 
}