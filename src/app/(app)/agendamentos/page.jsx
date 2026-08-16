import Link from 'next/link';
import { requireSession } from '@/app/actions/auth.actions';
import { listarMeusAgendamentos } from '@/app/actions/agendamentos.actions';

export const dynamic = 'force-dynamic';

export default async function AgendamentosPage() {
  const usuarioLogado = await requireSession();
  const meusAgendamentos = await listarMeusAgendamentos();

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

      <div className="border-b pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sua Agenda</h1>
          <p className="text-gray-600 mt-1">
            Olá, <span className="font-semibold">{usuarioLogado.nome}</span>.
            Modo visualização: <span className="text-indigo-600 font-medium uppercase text-xs bg-indigo-50 px-2 py-1 rounded">{usuarioLogado.tipo}</span>
          </p>
        </div>
        {usuarioLogado.tipo === 'cliente' && (
          <Link
            href="/servicos"
            className="bg-tcc-laranja hover:bg-tcc-laranja-dark text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Agendar novo horário
          </Link>
        )}
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
                      <p>Cliente: <span className="font-medium">{item.clienteNome}</span></p>
                      {item.clienteTelefone && (
                        <p className="text-gray-500 text-xs mt-0.5">Tel: {item.clienteTelefone}</p>
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
