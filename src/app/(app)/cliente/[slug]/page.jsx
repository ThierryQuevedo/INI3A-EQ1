import { Phone, Star, CalendarCheck, Clock3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { buscarPerfilCliente } from '@/app/actions/clientes.actions';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import { Button } from '@/app/components/ui/button';
import EstrelasNota from '@/app/components/ui/EstrelasNota';
import PlaceholderImage from '@/app/components/ui/PlaceholderImage';

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
    <div className="bg-background min-h-screen">
      <div className="relative h-52 sm:h-60 w-full bg-muted overflow-hidden">
        {usuario.urlBanner ? (
          <Image src={usuario.urlBanner} alt="" fill className="object-cover" />
        ) : (
          <PlaceholderImage className="absolute inset-0" />
        )}

        <div className="absolute top-6 left-6 z-20">
          <BotaoVoltar fallbackHref="/dashboard" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="flex flex-col items-center text-center md:text-left md:items-end md:flex-row md:justify-between bg-card border border-border p-6 rounded-3xl shadow-elevated gap-6">
          <div className="flex flex-col items-center md:flex-row gap-6">
            <div className="relative size-28 sm:size-32 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center shrink-0">
              {usuario.urlImagem ? (
                <Image src={usuario.urlImagem} alt={usuario.nome} fill className="object-cover" />
              ) : (
                <span className="text-h4 font-bold text-muted-foreground">
                  {usuario.nome?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-caption font-bold text-primary mb-1">Cliente Marca Aí</span>
              <h1 className="text-h4 font-extrabold font-display tracking-tight text-foreground mb-2">
                {usuario.nome}
              </h1>

              <div className="bg-muted w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-body-sm font-bold text-foreground">
                  {avaliacaoMedia > 0 ? avaliacaoMedia.toFixed(1) : 'Novo'}
                </span>
                {avaliacaoMedia > 0 && <EstrelasNota nota={avaliacaoMedia} tamanho={13} />}
                <span className="text-caption text-muted-foreground">
                  ({totalAvaliacoesRecebidas} avaliações de prestadores)
                </span>
              </div>
            </div>
          </div>

          {usuario.telefone && (
            <Button asChild variant="accent" size="lg" className="w-full md:w-auto">
              <a href={`tel:${usuario.telefone}`}>
                <Phone size={18} aria-hidden="true" /> Ligar
              </a>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <CalendarCheck size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{totalConcluidos}</p>
            <p className="text-caption text-muted-foreground">Serviços concluídos</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Star size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{avaliacaoMedia > 0 ? avaliacaoMedia.toFixed(1) : '—'}</p>
            <p className="text-caption text-muted-foreground">Reputação</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Clock3 size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{membroDesde}</p>
            <p className="text-caption text-muted-foreground">Cliente desde</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-h6 font-bold font-display text-foreground mb-4">
            Avaliações e comentários de prestadores
          </h2>

          {avaliacoes.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-2xl text-center text-muted-foreground">
              <p>Ainda não há avaliações registradas para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-card border border-border p-5 rounded-2xl flex gap-4">
                  <div className="relative size-11 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {av.prestadorImagem ? (
                      <Image src={av.prestadorImagem} alt={av.prestadorNome} fill className="object-cover" />
                    ) : (
                      <span className="text-body-sm font-bold text-muted-foreground">
                        {av.prestadorNome?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        href={`/prestador/${av.prestadorSlug || ''}`}
                        className="font-bold text-body-sm text-foreground hover:text-primary transition-colors"
                      >
                        {av.prestadorNome}
                      </Link>
                      <EstrelasNota nota={av.nota || 0} tamanho={13} />
                    </div>
                    <p className="text-caption text-muted-foreground mb-1">
                      Serviço: {av.servicoNome} · {new Date(av.dataHora).toLocaleDateString('pt-BR')}
                    </p>
                    {av.comentario && <p className="text-body-sm text-foreground">{av.comentario}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
