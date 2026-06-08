'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function executarCadastro(formData) {
    const nome = formData.get('nome');
    const email = formData.get('email');
    const senha = formData.get('senha');
    const tipo = formData.get('tipo');

    const resposta = await fetch('http://localhost:5000/api/auth/cadastro',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nome, email, senha, tipo}),
    });

    const dados = await resposta.json();
    if(!resposta.ok){
        return {erro: dados.error || 'Erro ao cadastrar'};
    }
    redirect('/usuario/login')
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
  try
  {
    const token = resposta.headers.get('Authorization');
    const cookieStore = await cookies();
    cookieStore.set('marcaai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });
    console.log("c cookie login ");
  }
  catch(err)
  {
    console.log(err);
  }

  redirect('/dashboard');
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('marcaai_token')?.value;

  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}