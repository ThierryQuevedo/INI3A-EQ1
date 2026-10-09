import { Calendar, Phone, Mail, Award, Clock3 } from 'lucide-react';
import Image from "next/image";
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { db } from '@/db';
import { servicos, usuarios, categorias, prestadores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import BotaoVoltar from "@/app/components/ui/BotaoVoltar";
import { Button } from "@/app/components/ui/button";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import PlaceholderImage from "@/app/components/ui/PlaceholderImage";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { formatarDuracao } from "@/app/components/ui/DurationTag";
import { estatisticasPorServico } from "@/lib/avaliacoes";

export const dynamic = 'force-dynamic';

function rotuloAvaliacoes(total) {
  return `${total} ${total === 1 ? 'avaliação' : 'avaliações'}`;
}

export default async function DetalheServico({ params }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const resultadoBanco = await db
    .select({
      id: servicos.id,
      nome: servicos.nome,
      descricao: servicos.descricao,
      preco: servicos.preco,
      duracaoEstimada: servicos.duracaoEstimada,
      urlImagem: servicos.urlImagem,
      categoriaNome: categorias.nome,
      prestadorId: servicos.prestadorId,
      prestadorSlug: usuarios.slug,
      prestadorNome: usuarios.nome,
      prestadorEmail: usuarios.email,
      prestadorTelefone: usuarios.telefone,
      prestadorImagem: usuarios.urlImagem,
      prestadorBiografia: prestadores.biografia,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(prestadores, eq(servicos.prestadorId, prestadores.usuarioId))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(eq(servicos.slug, slug));

  if (!resultadoBanco || resultadoBanco.length === 0) {
   return notFound();
  }

  const dadosDb = resultadoBanco[0];
  const estatisticas = (await estatisticasPorServico([dadosDb.id])).get(dadosDb.id);

  const servico = {
    id: dadosDb.id,
    nome: dadosDb.nome || "Serviço sem nome",
    descricao: dadosDb.descricao,
    preco: dadosDb.preco || "0.00",
    duracaoEstimada: dadosDb.duracaoEstimada || 0,
    urlImagem: dadosDb.urlImagem,
    categoria: dadosDb.categoriaNome,
    avaliacaoMedia: estatisticas?.media ?? 0,
    totalAvaliacoes: estatisticas?.total ?? 0,
    prestadorId: dadosDb.prestadorId,
    prestadorSlug: dadosDb.prestadorSlug || dadosDb.prestadorId,
    prestador: {
      nome: dadosDb.prestadorNome || "Profissional",
      biografia: dadosDb.prestadorBiografia,
      telefone: dadosDb.prestadorTelefone,
      email: dadosDb.prestadorEmail,
      urlImagem: dadosDb.prestadorImagem,
    }
  };

  return (
    <div className="bg-background min-h-screen">

      <div className="relative h-52 sm:h-60 w-full bg-muted overflow-hidden">
        <PlaceholderImage className="absolute inset-0" />
        <div className="absolute top-6 left-6 z-20">
          <BotaoVoltar fallbackHref="/servicos" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">

        <div className="flex flex-col items-center text-center md:text-left md:items-end md:flex-row md:justify-between bg-card border border-border p-6 rounded-3xl shadow-elevated gap-6">
          <div className="flex flex-col items-center md:flex-row gap-6">

            <div className="relative size-28 sm:size-32 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted shrink-0">
              {servico.urlImagem ? (
                <Image src={servico.urlImagem} alt={servico.nome} fill className="object-cover" />
              ) : (
                <PlaceholderImage className="absolute inset-0" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              {servico.categoria && (
                <span className="text-caption font-bold text-primary mb-1">{servico.categoria}</span>
              )}
              <h1 className="text-h4 font-extrabold font-display tracking-tight text-foreground mb-2">
                {servico.nome}
              </h1>
              <p className="text-muted-foreground font-medium mb-3">
                Por:{' '}
                <Link
                  href={`/prestador/${servico.prestadorSlug}`}
                  className="font-bold underline text-foreground hover:text-primary transition-colors"
                >
                  {servico.prestador.nome}
                </Link>
              </p>

              <div className="bg-muted w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full flex items-center gap-2">
                {servico.totalAvaliacoes > 0 ? (
                  <>
                    <span className="text-body-sm font-bold text-foreground">{servico.avaliacaoMedia.toFixed(1)}</span>
                    <EstrelasNota nota={servico.avaliacaoMedia} tamanho={14} />
                    <span className="text-caption text-muted-foreground" role="img" aria-label={`Avaliação ${servico.avaliacaoMedia.toFixed(1)} de 5, ${rotuloAvaliacoes(servico.totalAvaliacoes)}`}>
                      ({rotuloAvaliacoes(servico.totalAvaliacoes)})
                    </span>
                  </>
                ) : (
                  <>
                    <EstrelasNota nota={0} tamanho={14} />
                    <span className="text-caption text-muted-foreground">Sem avaliações ainda</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button asChild variant="accent" size="lg" className="w-full md:w-auto">
            <Link href={`/agendamentos/novo?servico=${servico.id}`}>
              <Calendar size={20} aria-hidden="true" /> Agendar horário
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">

          <div className="md:col-span-2 space-y-6">
            {servico.descricao && (
              <div className="bg-card border border-border p-8 rounded-3xl shadow-soft">
                <h2 className="text-h6 font-bold font-display text-foreground border-b border-border pb-3 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary" aria-hidden="true" /> Detalhes do serviço
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{servico.descricao}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <span className="text-h6 font-bold leading-none">R$</span>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground font-medium">Valor do serviço</p>
                  <p className="text-h6 font-bold text-foreground">{formatarPreco(servico.preco)}</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <Clock3 size={24} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground font-medium">Tempo estimado</p>
                  <p className="text-h6 font-bold text-foreground">{formatarDuracao(servico.duracaoEstimada)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
              <h2 className="text-body-lg font-bold font-display text-foreground border-b border-border pb-3 mb-4">
                Sobre o profissional
              </h2>
              {servico.prestador.biografia && (
                <p className="text-body-sm text-muted-foreground leading-relaxed mb-6">{servico.prestador.biografia}</p>
              )}

              <Button asChild variant="outline" className="w-full mb-6">
                <Link href={`/prestador/${servico.prestadorSlug}`}>Ver perfil e outros serviços</Link>
              </Button>

              {(servico.prestador.telefone || servico.prestador.email) && (
                <>
                  <h3 className="text-caption font-bold text-muted-foreground mb-3">Canais de contato</h3>
                  <div className="space-y-3">
                    {servico.prestador.telefone && (
                      <a href={`tel:${servico.prestador.telefone}`} className="flex items-center gap-3 text-body-sm text-foreground hover:text-primary transition-colors p-3 rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <Phone size={16} className="text-primary shrink-0" aria-hidden="true" />
                        <span>{servico.prestador.telefone}</span>
                      </a>
                    )}
                    {servico.prestador.email && (
                      <a href={`mailto:${servico.prestador.email}`} className="flex items-center gap-3 text-body-sm text-foreground hover:text-primary transition-colors p-3 rounded-xl bg-muted overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <Mail size={16} className="text-primary shrink-0" aria-hidden="true" />
                        <span className="truncate">{servico.prestador.email}</span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
