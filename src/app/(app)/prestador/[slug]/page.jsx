import { MapPin, Phone, Users, Star, Clock3, CalendarDays } from 'lucide-react';
import { notFound } from 'next/navigation';

import { buscarPerfilPrestador } from '@/app/actions/prestadores.actions';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';
import { listarIdsFavoritos } from '@/app/actions/favoritos.actions';
import { getSession } from '@/app/actions/auth.actions';
import { Button } from '@/app/components/ui/button';
import ServiceCard from '@/app/components/features/servicos/ServiceCard';
import FavoritoButton from '@/app/components/features/favoritos/FavoritoButton';
import { PerfilBanner, PerfilResumo, CardAvaliacao } from '@/app/components/features/perfil/PerfilPublico';
import PageContainer from '@/app/components/ui/PageContainer';

export const dynamic = 'force-dynamic';

const LIMITE_AVALIACOES = 6;

function primeiraLetraMaiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function PerfilPrestador({ params }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const perfil = await buscarPerfilPrestador(slug);

  if (!perfil) {
    return notFound();
  }

  const { usuario, servicos, avaliacaoMedia, totalAvaliacoes, totalClientesAtendidos, avaliacoes } = perfil;

  const [visitante, { servicos: idsServicosFavoritados, prestadores: idsPrestadoresFavoritados }] = await Promise.all([
    getSession(),
    listarIdsFavoritos(),
  ]);
  const favoritosServicoSet = new Set(idsServicosFavoritados);
  const prestadorFavoritado = idsPrestadoresFavoritados.includes(usuario.id);
  const souOPrestador = visitante?.id === usuario.id;

  const membroDesde = primeiraLetraMaiuscula(
    new Date(usuario.criadoEm).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );

  const localizacao = usuario.enderecoTexto
    ? usuario.enderecoTexto
    : usuario.raioAtendimentoKm
    ? `Atende num raio de ${usuario.raioAtendimentoKm} km`
    : null;

  const proximosHorarios = await calcularProximosHorariosLivres(servicos.map((s) => s.id));
  const servicosFormatados = servicos.map((s) => ({
    id: s.id,
    slug: s.slug,
    nomeServico: s.nome,
    nomeProfissional: usuario.nome,
    nomeCategoria: s.categoriaNome,
    preco: s.preco,
    urlImagem: s.urlImagem,
    duracaoEstimada: s.duracaoEstimada,
    avaliacaoMedia: s.avaliacaoMedia,
    totalAvaliacoes: s.totalAvaliacoes,
    proximoHorario: proximosHorarios[s.id] ?? null,
    favoritoInicial: favoritosServicoSet.has(s.id),
  }));

  const primeiroServico = servicosFormatados[0] ?? null;

  const avaliacoesVisiveis = avaliacoes.slice(0, LIMITE_AVALIACOES);
  const avaliacoesExtras = avaliacoes.slice(LIMITE_AVALIACOES);

  const cardsAvaliacao = (lista) =>
    lista.map((av) => (
      <CardAvaliacao
        key={av.id}
        nome={av.clienteNome}
        urlImagem={av.clienteImagem}
        nota={av.nota}
        contexto={av.servicoNome}
        comentario={av.comentario}
      />
    ));

  return (
    <div>
      <PerfilBanner urlBanner={usuario.urlBanner} fallbackHref="/servicos" />

      <PageContainer size="xl" className="py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <PerfilResumo
            usuario={usuario}
            eyebrow="Prestador de serviços"
            detalhe={
              localizacao && (
                <p className="text-body-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{localizacao}</span>
                </p>
              )
            }
            nota={avaliacaoMedia}
            totalAvaliacoes={totalAvaliacoes}
            rotuloAvaliacoes={totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
            acoes={
              <>
                <Button asChild variant="accent" className="flex-1">
                  <a href={primeiroServico ? `/agendamentos/novo?servico=${primeiroServico.id}` : '#servicos'}>
                    <CalendarDays aria-hidden="true" /> Agendar
                  </a>
                </Button>
                {usuario.telefone && (
                  <Button asChild variant="outline" size="icon" className="rounded-lg">
                    <a href={`tel:${usuario.telefone}`} aria-label={`Ligar para ${usuario.nome}`}>
                      <Phone aria-hidden="true" />
                    </a>
                  </Button>
                )}
                {!souOPrestador && (
                  <FavoritoButton
                    tipo="prestador"
                    alvoId={usuario.id}
                    favoritoInicial={prestadorFavoritado}
                    variant="standalone"
                    className="size-11"
                  />
                )}
              </>
            }
            estatisticas={[
              { Icon: Users, rotulo: 'Clientes atendidos', valor: totalClientesAtendidos },
              { Icon: Star, rotulo: 'Avaliações', valor: totalAvaliacoes },
              { Icon: Clock3, rotulo: 'No Marca Aí desde', valor: membroDesde },
            ]}
            biografia={usuario.biografia}
          />

          <div className="space-y-10 min-w-0">
            <section id="servicos" aria-labelledby="titulo-servicos" className="scroll-mt-20">
              <h2 id="titulo-servicos" className="text-h6 font-bold text-foreground mb-4">
                Serviços <span className="text-muted-foreground font-medium">({servicosFormatados.length})</span>
              </h2>
              {servicosFormatados.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">Nenhum serviço cadastrado no momento.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {servicosFormatados.map((s) => (
                    <ServiceCard key={s.id} servico={s} />
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="titulo-avaliacoes">
              <h2 id="titulo-avaliacoes" className="text-h6 font-bold text-foreground mb-4">
                Avaliações de clientes
              </h2>
              {avaliacoes.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">Ainda sem avaliações.</p>
              ) : (
                <>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">{cardsAvaliacao(avaliacoesVisiveis)}</ul>
                  {avaliacoesExtras.length > 0 && (
                    <details className="group mt-3">
                      <summary className="inline-flex items-center gap-1 h-10 px-3 -ml-3 rounded-lg text-body-sm font-semibold text-primary hover:bg-muted cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Ver mais {avaliacoesExtras.length} avaliações</span>
                        <span className="hidden group-open:inline">Mostrar menos</span>
                      </summary>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">{cardsAvaliacao(avaliacoesExtras)}</ul>
                    </details>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
