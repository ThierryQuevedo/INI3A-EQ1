import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import PlaceholderImage from "@/app/components/ui/PlaceholderImage";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { formatarDuracao } from "@/app/components/ui/DurationTag";
import { formatarDistancia } from "@/lib/geo";
import CategoryIcon, { getCategoryIcon } from "./CategoryIcon";
import AvailabilityBadge from "./AvailabilityBadge";
import FavoritoButton from "@/app/components/features/favoritos/FavoritoButton";

export default function ServiceCard({ servico, interativo = true }) {
  const {
    id,
    slug,
    nomeServico,
    nomeProfissional,
    nomeCategoria,
    preco,
    urlImagem,
    duracaoEstimada,
    distanciaKm,
    avaliacaoMedia = 0,
    totalAvaliacoes = 0,
    proximoHorario,
    favoritoInicial,
  } = servico;
  const mostrarFavorito = interativo && favoritoInicial !== undefined;

  const hrefDetalhe = `/servicos/${slug || id}`;
  const classeConteudo = "flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-t-xl";

  const conteudo = (
    <>
      <div className="relative w-full aspect-square overflow-hidden shrink-0">
        {mostrarFavorito && <FavoritoButton tipo="servico" alvoId={id} favoritoInicial={favoritoInicial} />}
        {urlImagem ? (
          <Image
            className="object-cover transition-transform group-hover:scale-105"
            src={urlImagem}
            alt={`Foto de ${nomeProfissional || "profissional"}`}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : (
          <PlaceholderImage
            className="absolute inset-0"
            icon={getCategoryIcon(nomeCategoria)}
            label={nomeCategoria ? `Sem foto — ${nomeCategoria}` : "Sem foto"}
          />
        )}

        {nomeCategoria && (
          <span
            className={cn(
              "absolute top-3 left-3 bg-card/95 text-foreground text-caption font-semibold px-2.5 py-1 rounded-md shadow-soft inline-flex items-center gap-1.5 min-w-0",
              // margens mais coracao mais folga
              mostrarFavorito ? "max-w-[calc(100%-4.25rem)]" : "max-w-[80%]"
            )}
            title={nomeCategoria}
          >
            <CategoryIcon nome={nomeCategoria} size={13} className="shrink-0" />
            {/* card estreito mostra so o icone */}
            <span className="truncate min-w-0 @max-[12rem]:hidden">{nomeCategoria}</span>
          </span>
        )}
      </div>

      <div className="p-3 pb-2 @min-[12rem]:p-4 @min-[12rem]:pb-2">
        <h3 className="font-bold text-body text-foreground leading-snug line-clamp-2 break-words" title={nomeServico}>
          {nomeServico || "Serviço"}
        </h3>
        <p className="text-body-sm text-muted-foreground truncate mt-0.5" title={nomeProfissional}>
          {nomeProfissional || "Profissional"}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          {totalAvaliacoes > 0 ? (
            <>
              <EstrelasNota nota={avaliacaoMedia} tamanho={14} />
              <span className="text-body-sm text-muted-foreground font-medium">
                <span className="sr-only-status">Avaliação: </span>
                {avaliacaoMedia.toFixed(1)}
                <span className="sr-only-status">
                  {` de 5, ${totalAvaliacoes} avaliaç${totalAvaliacoes === 1 ? "ão" : "ões"}`}
                </span>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center bg-muted text-muted-foreground text-caption font-semibold px-2 py-0.5 rounded-md">
              <span className="sr-only-status">Sem avaliações ainda: </span>Novo
            </span>
          )}
        </div>

        {((!interativo && proximoHorario) || distanciaKm != null) && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {!interativo && <AvailabilityBadge proximoHorario={proximoHorario} />}
            {distanciaKm != null && (
              <span className="text-caption text-muted-foreground">{formatarDistancia(distanciaKm)}</span>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <article
      aria-label={`${nomeServico || "Serviço"}, por ${nomeProfissional || "Profissional"}`}
      className="@container group relative w-full bg-card rounded-xl shadow-soft hover:shadow-card border border-border transition hover:-translate-y-1 flex flex-col h-full overflow-hidden"
    >
      {interativo ? (
        <Link href={hrefDetalhe} className={classeConteudo}>{conteudo}</Link>
      ) : (
        <div className={classeConteudo}>{conteudo}</div>
      )}

      {/* acoes no fim do card */}
      <div className={cn("px-3 pb-4 pt-1 @min-[12rem]:px-4 flex flex-wrap items-baseline justify-between gap-x-2", !interativo && "mt-auto")}>
        <span className="text-body-lg font-bold text-foreground whitespace-nowrap tabular-nums">
          {formatarPreco(preco)}
        </span>
        {duracaoEstimada != null && (
          <span className="text-caption text-muted-foreground whitespace-nowrap">{formatarDuracao(duracaoEstimada)}</span>
        )}
      </div>

      {/* pilula abre com dia e hora e ver horarios abre no primeiro dia */}
      {interativo && (
        <div className="mt-auto px-3 pb-4 @min-[12rem]:px-4 flex flex-col gap-2">
          {proximoHorario ? (
            <AvailabilityBadge proximoHorario={proximoHorario} servicoId={id} nomeServico={nomeServico} />
          ) : proximoHorario === null ? (
            <p className="text-caption text-muted-foreground">Sem vaga nos próximos 14 dias</p>
          ) : null}
          <Button asChild variant="ghost" className="w-full text-primary">
            <Link href={`/agendamentos/novo/?servico=${id}`} aria-label={`Ver horários de ${nomeServico || "este serviço"}`}>
              <Calendar size={16} aria-hidden="true" /> Ver horários
            </Link>
          </Button>
        </div>
      )}
    </article>
  );
}
