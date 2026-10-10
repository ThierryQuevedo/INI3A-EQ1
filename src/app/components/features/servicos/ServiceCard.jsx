import Image from "next/image";
import Link from "next/link";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import PlaceholderImage from "@/app/components/ui/PlaceholderImage";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { formatarDuracao } from "@/app/components/ui/DurationTag";
import { formatarDistancia } from "@/lib/geo";
import CategoryIcon from "./CategoryIcon";
import AvailabilityBadge from "./AvailabilityBadge";

/** `interativo=false` renderiza o mesmo card sem o link clicável — usado no preview ao vivo de "Novo serviço". */
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
  } = servico;

  const hrefDetalhe = `/servicos/${slug || id}`;
  const classeConteudo = "flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-t-2xl";

  const conteudo = (
    <>
      <div className="relative w-full aspect-square overflow-hidden shrink-0">
        {urlImagem ? (
          <Image
            className="object-cover transition-transform duration-300 ease-apple group-hover:scale-105"
            src={urlImagem}
            alt={`Foto de ${nomeProfissional || "profissional"}`}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : (
          <PlaceholderImage className="absolute inset-0" />
        )}

        {nomeCategoria && (
          <span
            className="absolute top-3 left-3 bg-card/95 text-foreground text-caption font-semibold px-2.5 py-1 rounded-full truncate max-w-[80%] shadow-soft inline-flex items-center gap-1.5"
            title={nomeCategoria}
          >
            <CategoryIcon nome={nomeCategoria} size={13} />
            {nomeCategoria}
          </span>
        )}
      </div>

      <div className="p-4 pb-2">
        <h3 className="font-bold text-body text-foreground leading-snug truncate" title={nomeServico}>
          {nomeServico || "Serviço"}
        </h3>
        <p className="text-body-sm text-muted-foreground truncate mt-0.5" title={nomeProfissional}>
          {nomeProfissional || "Profissional"}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <EstrelasNota nota={avaliacaoMedia} tamanho={14} />
          {totalAvaliacoes > 0 ? (
            <span className="text-body-sm text-muted-foreground font-medium">
              <span className="sr-only-status">Avaliação: </span>
              {avaliacaoMedia.toFixed(1)}
              <span className="sr-only-status">
                {` de 5, ${totalAvaliacoes} avaliaç${totalAvaliacoes === 1 ? "ão" : "ões"}`}
              </span>
            </span>
          ) : (
            <span className="text-body-sm text-muted-foreground font-medium">
              <span className="sr-only-status">Sem avaliações ainda: </span>Novo
            </span>
          )}
        </div>

        {(proximoHorario !== undefined || distanciaKm != null) && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <AvailabilityBadge proximoHorario={proximoHorario} />
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
      className="group w-full bg-card rounded-2xl shadow-soft hover:shadow-card border border-border transition-all duration-base ease-apple hover:-translate-y-1 flex flex-col h-full overflow-hidden"
    >
      {interativo ? (
        <Link href={hrefDetalhe} className={classeConteudo}>{conteudo}</Link>
      ) : (
        <div className={classeConteudo}>{conteudo}</div>
      )}

      <div className="mt-auto px-4 pb-4 pt-1 flex items-baseline justify-between gap-2">
        <span className="text-body-lg font-bold text-primary whitespace-nowrap">
          {formatarPreco(preco)}
        </span>
        {duracaoEstimada != null && (
          <span className="text-caption text-muted-foreground whitespace-nowrap">{formatarDuracao(duracaoEstimada)}</span>
        )}
      </div>
    </article>
  );
}
