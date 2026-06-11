import { getSession, decodeJwtPayload } from "../../../app/actions/auth"
import { db } from "../../../db/index.js";
import { agendamentos, servicos, usuarios } from "../../../db/schema.js";
import { eq, and, gte, lt } from "drizzle-orm";

export default async function Dashboard() {
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  const nome = usuario.nome;
  const prestadorId = usuario.id;

  // Início e fim de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  // Busca agendamentos de hoje do prestador
  const agendamentosHoje = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      clienteNome: usuarios.nome,
      servicoNome: servicos.nome,
      duracaoEstimada: servicos.duracaoEstimada,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        gte(agendamentos.dataHora, hoje),
        lt(agendamentos.dataHora, amanha)
      )
    )
    .orderBy(agendamentos.dataHora);

  function formatarHora(data) {
    const d = new Date(data);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function statusLabel(status) {
    const map = {
      pendente: { label: 'Pendente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
      confirmado: { label: 'Confirmado', bg: 'bg-blue-100', text: 'text-blue-700' },
      concluido: { label: 'Feito', bg: 'bg-green-100', text: 'text-green-700' },
      cancelado: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700' },
      pending: { label: 'Pendente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };
    return map[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-500 text-sm">Painel do prestador</p>
            <h1 className="text-3xl font-bold text-tcc-azul-dark">Barbearia do {nome}</h1>
          </div>
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-sm">
            <h3 className="text-blue-600 text-4xl font-bold">{agendamentosHoje.length}</h3>
            <p className="text-gray-500">agendamentos hoje</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
            <h3 className="text-orange-500 text-4xl font-bold">R$receita</h3>
            <p className="text-gray-500">este mês</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
            <p className="text-green-600 font-semibold text-sm">Avaliação</p>
            <h3 className="text-green-600 text-4xl font-bold">media_avaliacoes <span className="text-2xl">★</span></h3>
            <p className="text-gray-500">qtde_avaliacoes avaliações</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-gray-800 shadow-sm">
            <h3 className="text-gray-800 text-4xl font-bold">qtde_clientes</h3>
            <p className="text-gray-500">Clientes atendidos</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agenda de hoje</h2>
          <div className="space-y-3">
            {agendamentosHoje.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
                Nenhum agendamento para hoje.
              </div>
            ) : (
              agendamentosHoje.map((ag) => {
                const { label, bg, text } = statusLabel(ag.status);
                return (
                  <div key={ag.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex gap-6 items-center">
                      <span className="text-blue-600 font-semibold">{formatarHora(ag.dataHora)}</span>
                      <div>
                        <p className="font-bold text-gray-800">{ag.clienteNome}</p>
                        <p className="text-xs text-gray-400">{ag.servicoNome} • {ag.duracaoEstimada} min</p>
                      </div>
                    </div>
                    <span className={`${bg} ${text} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>{label}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}