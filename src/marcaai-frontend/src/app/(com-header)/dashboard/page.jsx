
import { getSession, decodeJwtPayload } from "../../../app/actions/auth"

export default async function Dashboard() {
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  const nome = usuario.nome;

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
            <h3 className="text-blue-600 text-4xl font-bold">qtde_agendamentos</h3>
            <p className="text-gray-500">agendamentos</p>
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

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex gap-6 items-center">
                <span className="text-blue-600 font-semibold">09:00</span>
                <div>
                  <p className="font-bold text-gray-800">MOLEQUE SOLTO</p>
                  <p className="text-xs text-gray-400">SERVICO • TEMPO</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">Feito</span>
            </div>


            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex gap-6 items-center">
                <span className="text-blue-600 font-semibold">14:00</span>
                <div>
                  <p className="font-bold text-gray-800">SULZBACHER</p>
                  <p className="text-xs text-gray-400">SERVICO • TEMPO</p>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">Próximo</span>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}