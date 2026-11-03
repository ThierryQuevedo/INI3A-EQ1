import { Phone, Star, CalendarCheck, Clock3 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { buscarPerfilCliente } from '@/app/actions/clientes.actions';
import { Button } from '@/app/components/ui/button';
import { PerfilBanner, PerfilResumo, CardAvaliacao } from '@/app/components/features/perfil/PerfilPublico';
import PageContainer from '@/app/components/ui/PageContainer';

export const dynamic = 'force-dynamic';

function primeiraLetraMaiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function PerfilClientePage({ params }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const perfil = await buscarPerfilCliente(slug);

  if (!perfil) {
    return notFound();
  }

  const { usuario, totalConcluidos, avaliacaoMedia, totalAvaliacoesRecebidas, avaliacoes } = perfil;

  const membroDesde = primeiraLetraMaiuscula(
    new Date(usuario.criadoEm).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );

  return (
    <div>
      <PerfilBanner urlBanner={usuario.urlBanner} fallbackHref="/dashboard" />

      <PageContainer size="xl" className="py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <PerfilResumo
            usuario={usuario}
            eyebrow="Cliente Marca Aí"
            nota={avaliacaoMedia}
            totalAvaliacoes={totalAvaliacoesRecebidas}
            rotuloAvaliacoes={totalAvaliacoesRecebidas === 1 ? 'avaliação de prestador' : 'avaliações de prestadores'}
            acoes={
              usuario.telefone && (
                <Button asChild variant="outline" className="flex-1">
                  <a href={`tel:${usuario.telefone}`}>
                    <Phone aria-hidden="true" /> Ligar
                  </a>
                </Button>
              )
            }
            estatisticas={[
              { Icon: CalendarCheck, rotulo: 'Serviços concluídos', valor: totalConcluidos },
              { Icon: Star, rotulo: 'Reputação', valor: avaliacaoMedia > 0 ? avaliacaoMedia.toFixed(1) : '—' },
              { Icon: Clock3, rotulo: 'Cliente desde', valor: membroDesde },
            ]}
          />

          <section aria-labelledby="titulo-avaliacoes" className="min-w-0">
            <h2 id="titulo-avaliacoes" className="text-h6 font-bold text-foreground mb-4">
              Avaliações de prestadores
            </h2>
            {avaliacoes.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">Ainda não há avaliações registradas para este cliente.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {avaliacoes.map((av) => (
                  <CardAvaliacao
                    key={av.id}
                    nome={av.prestadorNome}
                    urlImagem={av.prestadorImagem}
                    href={`/prestador/${av.prestadorSlug || ''}`}
                    nota={av.nota}
                    contexto={`${av.servicoNome} · ${new Date(av.dataHora).toLocaleDateString('pt-BR')}`}
                    comentario={av.comentario}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
