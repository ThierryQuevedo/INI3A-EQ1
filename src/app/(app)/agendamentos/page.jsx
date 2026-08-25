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
      pendente: 'bg-warning/15 text-warning',
      confirmado: 'bg-success/15 text-success',
      concluido: 'bg-tcc-azul/10 text-tcc-azul',
      cancelado: 'bg-destructive/10 text-destructive',
    };
    return estilos[status?.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 font-sans">

        <div className="border-b border-border pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h4 font-bold text-foreground">Sua Agenda</h1>
            <p className="text-muted-foreground mt-1 text-body-sm">
              Olá, <span className="font-semibold text-foreground">{usuarioLogado.nome}</span>.
              Modo visualização: <span className="text-tcc-azul font-medium uppercase text-caption bg-secondary px-2.5 py-1 rounded-full">{usuarioLogado.tipo}</span>
            </p>
          </div>
          {usuarioLogado.tipo === 'cliente' && (
            <Link
              href="/servicos"
              className="bg-tcc-laranja hover:bg-tcc-laranja-dark text-white text-body-sm font-bold px-4 h-11 inline-flex items-center rounded-full transition-colors duration-200 w-fit"
            >
              Agendar novo horário
            </Link>
          )}
        </div>

        {meusAgendamentos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card">
            <p className="text-muted-foreground text-body-lg">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meusAgendamentos.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl shadow-soft border border-border p-5 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-card transition-shadow duration-200"
              >

                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-xl text-center min-w-[100px]">
                    <p className="text-caption font-bold text-tcc-azul-dark dark:text-tcc-azul-light uppercase">Horário</p>
                    <p className="text-h6 font-extrabold text-tcc-azul-darker dark:text-white">{formatarHora(item.dataHora)}</p>
                  </div>

                  <div>
                    <h3 className="text-body-lg font-bold text-foreground">{item.servicoNome}</h3>
                    <p className="text-body-sm text-muted-foreground capitalize">{formatarData(item.dataHora)}</p>

                    {usuarioLogado.tipo === 'cliente' && (
                      <div className="mt-2 text-body-sm text-foreground">
                        <p>Prestador: <span className="font-medium">{item.prestadorNome}</span></p>
                        <p className="text-success font-semibold mt-0.5">R$ {Number(item.servicoPreco).toFixed(2)}</p>
                      </div>
                    )}

                    {usuarioLogado.tipo === 'prestador' && (
                      <div className="mt-2 text-body-sm text-foreground">
                        <p>Cliente: <span className="font-medium">{item.clienteNome}</span></p>
                        {item.clienteTelefone && (
                          <p className="text-muted-foreground text-caption mt-0.5">Tel: {item.clienteTelefone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className={`px-3 h-8 inline-flex items-center rounded-full text-caption font-semibold ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
