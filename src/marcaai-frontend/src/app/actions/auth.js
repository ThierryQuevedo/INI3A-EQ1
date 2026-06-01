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
    const email = formData.get('email');
    const senha = formData.get('senha');


  const resposta = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    return { erro: dados.error || 'Credenciais inválidas.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('marcaai_token', dados.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, 
    path: '/',
  });

  redirect('/dashboard');
}