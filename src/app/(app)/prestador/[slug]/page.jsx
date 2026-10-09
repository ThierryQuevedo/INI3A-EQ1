import { MapPin, Phone, Users, Star, Clock3, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { buscarPerfilPrestador } from '@/app/actions/prestadores.actions';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import { Button } from '@/app/components/ui/button';
import ServiceCard from '@/app/components/features/servicos/ServiceCard';
import PlaceholderImage from '@/app/components/ui/PlaceholderImage';
import EstrelasNota from '@/app/components/ui/EstrelasNota';

export const dynamic = 'force-dynamic';

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
  }));

  const primeiroServico = servicosFormatados[0] ?? null;

  return (
    <div className="bg-background min-h-screen">

      <div className="relative h-52 sm:h-60 w-full bg-muted overflow-hidden">
        {usuario.urlBanner ? (
          <Image src={usuario.urlBanner} alt="" fill className="object-cover" />
        ) : (
          <PlaceholderImage className="absolute inset-0" />
        )}

        <div className="absolute top-6 left-6 z-20">
          <BotaoVoltar fallbackHref="/servicos" />
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
              <h1 className="text-h4 font-extrabold font-display tracking-tight text-foreground mb-2">
                {usuario.nome}
              </h1>
              {localizacao && (
                <p className="text-muted-foreground font-medium mb-3 flex items-center gap-1.5 justify-center md:justify-start">
                  <MapPin size={14} aria-hidden="true" />
                  {localizacao}
                </p>
              )}

              <div className="bg-muted w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-body-sm font-bold text-foreground">{avaliacaoMedia.toFixed(1)}</span>
                <EstrelasNota nota={avaliacaoMedia} tamanho={13} />
                <span className="text-caption text-muted-foreground">({totalAvaliacoes} avaliações)</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {usuario.telefone && (
              <Button asChild variant="outline" size="lg">
                <a href={`tel:${usuario.telefone}`}>
                  <Phone size={18} aria-hidden="true" /> Ligar
                </a>
              </Button>
            )}
            <Button asChild variant="accent" size="lg">
              <a href={primeiroServico ? `/agendamentos/novo?servico=${primeiroServico.id}` : '#servicos'}>
                <CalendarDays size={18} aria-hidden="true" /> Agendar
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Users size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{totalClientesAtendidos}</p>
            <p className="text-caption text-muted-foreground">Clientes atendidos</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Star size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{totalAvaliacoes}</p>
            <p className="text-caption text-muted-foreground">Avaliações</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Clock3 size={22} className="text-primary mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">{membroDesde}</p>
            <p className="text-caption text-muted-foreground">No Marca Aí desde</p>
          </div>
        </div>

        {usuario.biografia && (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-soft mt-8">
            <h2 className="text-body-lg font-bold font-display text-foreground mb-2">Sobre</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{usuario.biografia}</p>
          </div>
        )}

        <div id="servicos" className="mt-10 scroll-mt-20">
          <h2 className="text-h6 font-bold font-display text-foreground mb-4">Serviços de {usuario.nome}</h2>

          {servicosFormatados.length === 0 ? (
            <p className="text-muted-foreground">Nenhum serviço cadastrado no momento.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {servicosFormatados.map((s) => (
                <ServiceCard key={s.id} servico={s} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-h6 font-bold font-display text-foreground mb-4">Avaliações de clientes</h2>

          {avaliacoes.length === 0 ? (
            <p className="text-muted-foreground">Ainda sem avaliações.</p>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-card border border-border p-5 rounded-2xl flex gap-4">
                  <div className="relative size-11 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {av.clienteImagem ? (
                      <Image src={av.clienteImagem} alt={av.clienteNome} fill className="object-cover" />
                    ) : (
                      <span className="text-body-sm font-bold text-muted-foreground">
                        {av.clienteNome?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-body-sm text-foreground">{av.clienteNome}</p>
                      <EstrelasNota nota={av.nota || 0} tamanho={13} />
                    </div>
                    <p className="text-caption text-muted-foreground mb-1">{av.servicoNome}</p>
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
