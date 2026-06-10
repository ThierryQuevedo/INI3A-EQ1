import React from 'react';
import { db } from '../../../db/index'; 
import { agendamentos, servicos, usuarios } from '../../../db/schema';
import { eq, asc } from 'drizzle-orm';

import { getSession, decodeJwtPayload } from "../../actions/auth";


async function getAgendaCliente(clienteId) {
  return await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      servicoPreco: servicos.preco,
      prestadorNome: usuarios.nome,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .where(eq(agendamentos.clienteId, clienteId))
    .orderBy(asc(agendamentos.dataHora));
}

async function getAgendaPrestador(prestadorId) {
  return await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      clienteNome: usuarios.nome,
      clienteTelefone: usuarios.telefone,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .where(eq(servicos.prestadorId, prestadorId))
    .orderBy(asc(agendamentos.dataHora));
}


export default async function AgendaPage() {
  
  const token = await getSession();
  const usuarioLogado = await decodeJwtPayload(token); 

  if (!usuarioLogado) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center py-12">
        <p className="text-red-500 font-medium">Você precisa estar logado para acessar a agenda.</p>
      </div>
    );
  }

  let meusAgendamentos = [];
  try {
    if (usuarioLogado.tipo === 'cliente') {
      meusAgendamentos = await getAgendaCliente(usuarioLogado.id);
    } else if (usuarioLogado.tipo === 'prestador') {
      meusAgendamentos = await getAgendaPrestador(usuarioLogado.id);
    }
  } catch (error) {
    console.error("Erro ao buscar dados do banco de dados:", error);
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long',
    });
  };

  const formatarHora = (data) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const estilos = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-green-100 text-green-800',
      concluido: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return estilos[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">

      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sua Agenda</h1>
        <p className="text-gray-600 mt-1">
          Olá, <span className="font-semibold">{usuarioLogado.nome}</span>. 
          Modo visualização: <span className="text-indigo-600 font-medium uppercase text-xs bg-indigo-50 px-2 py-1 rounded">{usuarioLogado.tipo}</span>
        </p>
      </div>

      {meusAgendamentos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
          <p className="text-gray-500 text-lg">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {meusAgendamentos.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition-shadow"
            >

              <div className="flex items-start space-x-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-center min-w-[100px]">
                  <p className="text-xs font-bold text-indigo-600 uppercase">Horário</p>
                  <p className="text-xl font-extrabold text-indigo-900">{formatarHora(item.dataHora)}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.servicoNome}</h3>
                  <p className="text-sm text-gray-500 capitalize">{formatarData(item.dataHora)}</p>
                  
                  {usuarioLogado.tipo === 'cliente' && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Prestador: <span className="font-medium">{item.prestadorNome}</span></p>
                      <p className="text-green-600 font-semibold mt-0.5">R$ {Number(item.servicoPreco).toFixed(2)}</p>
                    </div>
                  )}

                  {usuarioLogado.tipo === 'prestador' && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>👤 Cliente: <span className="font-medium">{item.clienteNome}</span></p>
                      {item.clienteTelefone && (
                        <p className="text-gray-500 text-xs mt-0.5">📞 Tel: {item.clienteTelefone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div className="mt-4 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}