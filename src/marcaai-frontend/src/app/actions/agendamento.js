'use server';

import { cookies } from 'next/headers';

async function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64Url = rawToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function confirmarAgendamentoAction({ servicoId, dataHora }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('marcaai_token')?.value;
  const usuario = await decodeJwtPayload(token);

  if (!usuario?.id) {
    return { erro: 'Usuário não autenticado.' };
  }

  try {
    const res = await fetch('http://localhost:5000/api/agendamentos/criarAgendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: usuario.id,
        servicoId,
        dataHora,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      return { erro: d.error || 'Erro ao agendar.' };
    }

    return { sucesso: true };
  } catch (e) {
    console.error(e);
    return { erro: 'Erro ao conectar com o servidor.' };
  }
}