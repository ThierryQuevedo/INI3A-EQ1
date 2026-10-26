import { Calendar, Phone, Mail, Clock3, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { db } from '@/db';
import { servicos, usuarios, categorias, prestadores } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import BotaoVoltar from "@/app/components/ui/BotaoVoltar";
import { Button } from "@/app/components/ui/button";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import Avatar from "@/app/components/ui/Avatar";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import FotoServico from "@/app/components/features/servicos/FotoServico";
import CategoryIcon from "@/app/components/features/servicos/CategoryIcon";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { formatarDuracao } from "@/app/components/ui/DurationTag";
import { estatisticasPorServico, avaliacoesPorServico } from "@/lib/avaliacoes";
import { getSession } from "@/app/actions/auth.actions";
import { listarIdsFavoritos } from "@/app/actions/favoritos.actions";
import FavoritoButton from "@/app/components/features/favoritos/FavoritoButton";
import PageContainer from "@/app/components/ui/PageContainer";

const PREVIA_AVALIACOES = 3;

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
    .where(eq(servicos.slug, slug))
    .orderBy(asc(servicos.id));

  if (!resultadoBanco || resultadoBanco.length === 0) {
   return notFound();
  }

  const dadosDb = resultadoBanco[0];
  const estatisticas = (await estatisticasPorServico([dadosDb.id])).get(dadosDb.id);
  const { servicos: idsServicosFavoritados } = await listarIdsFavoritos();
  const favoritoInicial = idsServicosFavoritados.includes(dadosDb.id);
  const previaAvaliacoes = await avaliacoesPorServico(dadosDb.id, { limite: PREVIA_AVALIACOES });

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

  const usuarioLogado = await getSession();
  const destinoAgendar = `/agendamentos/novo/?servico=${servico.id}`;
  const hrefAgendar = usuarioLogado
    ? destinoAgendar
    : `/api/auth/entrar/?proximo=${encodeURIComponent(destinoAgendar)}`;

  const ehDono = usuarioLogado?.id === servico.prestadorId;

  return (
    <PageContainer size="lg" className="py-6 sm:py-8">
      <BotaoVoltar fallbackHref="/servicos" className="mb-4" />

      {/* Cabeçalho: foto + identidade do serviço numa faixa só, sem card nem
          banner placeholder — a informação principal fica na primeira dobra. */}
      <header className="flex items-start gap-4 sm:gap-6">
        <div className="w-28 sm:w-44 lg:w-52 shrink-0">
          <FotoServico
            servicoId={servico.id}
            urlImagem={servico.urlImagem}
            nome={servico.nome}
            categoria={servico.categoria}
            podeEditar={ehDono}
          />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          {servico.categoria && (
            <Badge variant="secundario" size="sm" className="mb-2">
              <CategoryIcon nome={servico.categoria} size={13} />
              {servico.categoria}
            </Badge>
          )}
          <h1 className="text-h5 sm:text-h4 font-bold text-foreground break-words">{servico.nome}</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            por{' '}
            <Link
              href={`/prestador/${servico.prestadorSlug}`}
              className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
            >
              {servico.prestador.nome}
            </Link>
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {servico.totalAvaliacoes > 0 ? (
              <>
                <span className="text-body-sm font-bold text-foreground">{servico.avaliacaoMedia.toFixed(1)}</span>
                <EstrelasNota nota={servico.avaliacaoMedia} tamanho={14} />
                <a
                  href="#avaliacoes"
                  className="text-body-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  aria-label={`Avaliação ${servico.avaliacaoMedia.toFixed(1)} de 5, ${rotuloAvaliacoes(servico.totalAvaliacoes)}`}
                >
                  ({rotuloAvaliacoes(servico.totalAvaliacoes)})
                </a>
              </>
            ) : (
              <Badge variant="neutro" size="sm">Novo · sem avaliações</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 lg:gap-8 mt-8 items-start">
        {/* Coluna lateral: no mobile sobe para logo após o cabeçalho, para o
            "Agendar" ficar visível sem rolar; no desktop acompanha a rolagem. */}
        <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1 lg:sticky lg:top-20 space-y-4">
          <Card padding="sm" className="sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-caption text-muted-foreground">Valor</p>
                <p className="text-h5 font-bold text-foreground leading-tight">{formatarPreco(servico.preco)}</p>
              </div>
              <p className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground pb-0.5">
                <Clock3 size={16} className="shrink-0" aria-hidden="true" />
                {formatarDuracao(servico.duracaoEstimada)}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button asChild variant="accent" size="lg" className="flex-1 px-4">
                <Link href={hrefAgendar}>
                  <Calendar aria-hidden="true" /> Agendar serviço
                </Link>
              </Button>
              <FavoritoButton
                tipo="servico"
                alvoId={servico.id}
                favoritoInicial={favoritoInicial}
                variant="standalone"
              />
            </div>
          </Card>

          <Card padding="sm" className="sm:p-5">
            <div className="flex items-center gap-3">
              <Avatar nome={servico.prestador.nome} urlImagem={servico.prestador.urlImagem} />
              <div className="min-w-0">
                <p className="text-caption text-muted-foreground">Profissional</p>
                <p className="text-body font-semibold text-foreground truncate">{servico.prestador.nome}</p>
              </div>
            </div>

            {servico.prestador.biografia && (
              <p className="text-body-sm text-muted-foreground leading-relaxed mt-3 line-clamp-4">{servico.prestador.biografia}</p>
            )}

            {(servico.prestador.telefone || servico.prestador.email) && (
              <ul className="mt-3 space-y-1">
                {servico.prestador.telefone && (
                  <li>
                    <a href={`tel:${servico.prestador.telefone}`} className="flex items-center gap-2.5 h-9 px-2 -mx-2 rounded-lg text-body-sm text-foreground hover:bg-muted transition-colors">
                      <Phone size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="sr-only">Telefone: </span>
                      <span className="truncate">{servico.prestador.telefone}</span>
                    </a>
                  </li>
                )}
                {servico.prestador.email && (
                  <li>
                    <a href={`mailto:${servico.prestador.email}`} className="flex items-center gap-2.5 h-9 px-2 -mx-2 rounded-lg text-body-sm text-foreground hover:bg-muted transition-colors">
                      <Mail size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="sr-only">E-mail: </span>
                      <span className="truncate">{servico.prestador.email}</span>
                    </a>
                  </li>
                )}
              </ul>
            )}

            <Button asChild variant="outline" size="sm" className="w-full mt-4">
              <Link href={`/prestador/${servico.prestadorSlug}`}>Ver perfil e outros serviços</Link>
            </Button>
          </Card>
        </aside>

        <div className="lg:col-start-1 lg:row-start-1 space-y-6 min-w-0">
          <Card>
            <h2 className="text-body-lg font-bold text-foreground mb-2">Sobre o serviço</h2>
            {servico.descricao ? (
              <p className="text-body text-muted-foreground leading-relaxed whitespace-pre-line">{servico.descricao}</p>
            ) : (
              <p className="text-body-sm text-muted-foreground">O profissional ainda não adicionou uma descrição.</p>
            )}
          </Card>

          <Card id="avaliacoes" className="scroll-mt-20">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-body-lg font-bold text-foreground flex items-center gap-2">
                <Star size={18} className="shrink-0 text-rating" aria-hidden="true" /> Avaliações
              </h2>
              {servico.totalAvaliacoes > PREVIA_AVALIACOES && (
                <Link
                  href={`/servicos/${slug}/avaliacoes`}
                  className="text-body-sm font-semibold text-primary hover:underline underline-offset-4 inline-flex items-center gap-0.5 shrink-0"
                >
                  Ver todas <ChevronRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>

            {previaAvaliacoes.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">Este serviço ainda não recebeu avaliações.</p>
            ) : (
              <ul className="divide-y divide-border">
                {previaAvaliacoes.map((av) => (
                  <li key={av.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar nome={av.clienteNome} urlImagem={av.clienteImagem} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-body-sm text-foreground">{av.clienteNome}</p>
                        <EstrelasNota nota={av.nota || 0} tamanho={13} />
                      </div>
                      {av.comentario && <p className="text-body-sm text-muted-foreground mt-0.5">{av.comentario}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
