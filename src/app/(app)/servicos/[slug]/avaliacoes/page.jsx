import Image from "next/image";
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { db } from '@/db';
import { servicos } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import BotaoVoltar from "@/app/components/ui/BotaoVoltar";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import { estatisticasPorServico, avaliacoesPorServico } from "@/lib/avaliacoes";
import PageContainer from "@/app/components/ui/PageContainer";

export const dynamic = 'force-dynamic';

function rotuloAvaliacoes(total) {
  return `${total} ${total === 1 ? 'avaliação' : 'avaliações'}`;
}

export default async function AvaliacoesServico({ params }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const [servico] = await db
    .select({ id: servicos.id, nome: servicos.nome, slug: servicos.slug })
    .from(servicos)
    .where(eq(servicos.slug, slug))
    .orderBy(asc(servicos.id))
    .limit(1);

  if (!servico) {
    return notFound();
  }

  const estatisticas = (await estatisticasPorServico([servico.id])).get(servico.id);
  const avaliacaoMedia = estatisticas?.media ?? 0;
  const totalAvaliacoes = estatisticas?.total ?? 0;
  const avaliacoes = await avaliacoesPorServico(servico.id);

  return (
    <div className="min-h-screen">
      <PageContainer size="md" className="pt-8 pb-20">
        <BotaoVoltar fallbackHref={`/servicos/${slug}`} />

        <div className="mt-6 mb-8">
          <p className="text-caption text-muted-foreground font-medium mb-1">Avaliações de</p>
          <h1 className="text-h4 font-extrabold tracking-tight text-foreground mb-3">{servico.nome}</h1>

          {totalAvaliacoes > 0 ? (
            <div className="bg-muted w-fit px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-body-sm font-bold text-foreground">{avaliacaoMedia.toFixed(1)}</span>
              <EstrelasNota nota={avaliacaoMedia} tamanho={14} />
              <span className="text-caption text-muted-foreground">({rotuloAvaliacoes(totalAvaliacoes)})</span>
            </div>
          ) : (
            <span className="text-caption text-muted-foreground font-semibold">Serviço novo — sem avaliações ainda</span>
          )}
        </div>

        {avaliacoes.length === 0 ? (
          <p className="text-muted-foreground">Este serviço ainda não recebeu avaliações.</p>
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
                  {av.comentario && <p className="text-body-sm text-foreground mt-1">{av.comentario}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
