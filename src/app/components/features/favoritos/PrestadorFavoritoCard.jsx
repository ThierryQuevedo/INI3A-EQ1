import Link from "next/link";
import Image from "next/image";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import FavoritoButton from "./FavoritoButton";

export default function PrestadorFavoritoCard({ prestador }) {
  const { id, slug, nome, urlImagem, enderecoTexto, avaliacaoMedia = 0, totalAvaliacoes = 0 } = prestador;

  return (
    <article className="group relative bg-card rounded-xl shadow-soft hover:shadow-card border border-border transition hover:-translate-y-1 overflow-hidden">
      <FavoritoButton tipo="prestador" alvoId={id} favoritoInicial={true} />
      <Link
        href={`/prestador/${slug || id}`}
        className="flex gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-xl"
      >
        <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {urlImagem ? (
            <Image src={urlImagem} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="text-h6 font-bold text-muted-foreground">{nome?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <h3 className="font-bold text-body text-foreground truncate">{nome}</h3>
          {enderecoTexto && <p className="text-body-sm text-muted-foreground truncate mt-0.5">{enderecoTexto}</p>}
          <div className="flex items-center gap-1.5 mt-1.5">
            <EstrelasNota nota={avaliacaoMedia} tamanho={13} />
            <span className="text-caption text-muted-foreground font-medium">
              {totalAvaliacoes > 0 ? `${avaliacaoMedia.toFixed(1)} (${totalAvaliacoes})` : "Sem avaliações ainda"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
