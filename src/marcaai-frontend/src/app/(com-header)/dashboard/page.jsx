import Link from "next/link";
import { getSession, decodeJwtPayload } from "../../../app/actions/auth"
import { db } from "../../../db/index.js";
import { agendamentos, servicos, usuarios } from "../../../db/schema.js";
import { eq, and, gte, lt } from "drizzle-orm";
import { atualizarStatusAgendamento } from "../../../app/actions/agendamento";

export default async function Dashboard() {
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  const nome = usuario.nome;
  const prestadorId = usuario.id;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const camposAgendamento = {
    id: agendamentos.id,
    dataHora: agendamentos.dataHora,
    status: agendamentos.status,
    clienteNome: usuarios.nome,
    servicoNome: servicos.nome,
    duracaoEstimada: servicos.duracaoEstimada,
  };

  const [agendamentosHoje, agendamentosFuturos] = await Promise.all([
    db.select(camposAgendamento)
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(and(
        eq(servicos.prestadorId, prestadorId),
        gte(agendamentos.dataHora, hoje),
        lt(agendamentos.dataHora, amanha)
      ))
      .orderBy(agendamentos.dataHora),

    db.select(camposAgendamento)
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(and(
        eq(servicos.prestadorId, prestadorId),
        gte(agendamentos.dataHora, amanha)
      ))
      .orderBy(agendamentos.dataHora),
  ]);

  function formatarHora(data) {
    const d = new Date(data);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  }

  function statusLabel(status) {
    const map = {
      pendente:   { label: 'Pendente',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
      confirmado: { label: 'Confirmado', bg: 'bg-blue-100',   text: 'text-blue-700'   },
      concluido:  { label: 'Feito',      bg: 'bg-green-100',  text: 'text-green-700'  },
      cancelado:  { label: 'Cancelado',  bg: 'bg-red-100',    text: 'text-red-700'    },
      pending:    { label: 'Pendente',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };
    return map[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  }

  function CardAgendamento({ ag }) {
    const { label, bg, text } = statusLabel(ag.status);
    const podeConfirmar = ag.status === 'pendente' || ag.status === 'pending';
    const podeCancelar  = ag.status !== 'cancelado' && ag.status !== 'concluido';

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex gap-6 items-center flex-1">
          <div className="text-center min-w-[48px]">
            <span className="text-blue-600 font-bold text-sm block">{formatarHora(ag.dataHora)}</span>
            <span className="text-gray-400 text-[10px]">{formatarData(ag.dataHora)}</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{ag.clienteNome}</p>
            <p className="text-xs text-gray-400">{ag.servicoNome} • {ag.duracaoEstimada} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`${bg} ${text} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>
            {label}
          </span>

          {podeConfirmar && (
            <form action={atualizarStatusAgendamento.bind(null, ag.id, 'confirmado')}>
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                Confirmar
              </button>
            </form>
          )}

          {podeCancelar && (
            <form action={atualizarStatusAgendamento.bind(null, ag.id, 'cancelado')}>
              <button type="submit" className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8 max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-500 text-sm">Painel do prestador</p>
            <h1 className="text-3xl font-bold text-tcc-azul-dark">{nome}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/cadastroservico"
              className="bg-[#0B4F98] hover:bg-[#0B4F98]/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo serviço
            </Link>
            <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Online
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-sm">
            <h3 className="text-blue-600 text-4xl font-bold">{agendamentosHoje.length}</h3>
            <p className="text-gray-500">agendamentos hoje</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
            <h3 className="text-orange-500 text-4xl font-bold">R$ —</h3>
            <p className="text-gray-500">este mês</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
            <p className="text-green-600 font-semibold text-sm">Avaliação</p>
            <h3 className="text-green-600 text-4xl font-bold">— <span className="text-2xl">★</span></h3>
            <p className="text-gray-500">— avaliações</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-gray-800 shadow-sm">
            <h3 className="text-gray-800 text-4xl font-bold">—</h3>
            <p className="text-gray-500">Clientes atendidos</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Agenda de hoje</h2>
          <div className="space-y-3">
            {agendamentosHoje.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
                Nenhum agendamento para hoje.
              </div>
            ) : (
              agendamentosHoje.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Próximos agendamentos</h2>
            {agendamentosFuturos.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {agendamentosFuturos.length} agendamento{agendamentosFuturos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {agendamentosFuturos.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
                Nenhum agendamento futuro.
              </div>
            ) : (
              agendamentosFuturos.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
            )}
          </div>
        </section>

      </main>
    </div>
  );
}