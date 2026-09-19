import { Star, StarHalf, CalendarPlus } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

export default function CardServicoCatalogo({ servico, avaliacao = 5 }) {
  const imagemUrl = servico.urlImagem || `https://picsum.photos/200/200?random=${servico?.id || 1}`;
  const hrefDetalhe = `/servicos/${servico.slug || servico.id}`;

  return (
    <article
      aria-label={`${servico?.nomeServico || "Serviço"}, por ${servico?.nomeProfissional || "Profissional"}`}
      className="group w-full bg-card rounded-2xl shadow-soft hover:shadow-elevated border border-border transition-all duration-300 ease-apple hover:-translate-y-1 flex flex-col h-full overflow-hidden"
    >
      <Link
        href={hrefDetalhe}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-t-2xl"
      >
        {/* Imagem com overlay de gradiente e badge de categoria */}
        <div className="relative w-full aspect-square overflow-hidden shrink-0">
          <Image
            className="object-cover transition-transform duration-300 ease-apple group-hover:scale-105"
            src={imagemUrl}
            alt={`Foto de ${servico?.nomeProfissional || "Profissional"}`}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />

          {servico?.nomeCategoria && (
            <span
              className="absolute top-3 left-3 bg-white/95 text-tcc-azul-deep text-caption font-semibold px-2.5 py-1 rounded-full truncate max-w-[80%] shadow-soft"
              title={servico.nomeCategoria}
            >
              {servico.nomeCategoria}
            </span>
          )}
        </div>

        <div className="p-4 pb-2">
          {/* Nome do serviço */}
          <h3
            className="font-bold text-body text-foreground leading-snug"
            title={servico?.nomeServico}
          >
            {servico?.nomeServico || "Serviço"}
          </h3>

          {/* Nome do profissional */}
          <p
            className="text-body-sm text-muted-foreground truncate mt-0.5"
            title={servico?.nomeProfissional}
          >
            {servico?.nomeProfissional || "Profissional"}
          </p>

          {/* Estrelas de avaliação */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-0.5" aria-hidden="true">
              {[...Array(5)].map((_, index) => {
                const estrelaNumero = index + 1;

                if (avaliacao >= estrelaNumero) {
                  return <Star key={index} size={14} className="fill-amber-400 stroke-amber-400 shrink-0" />;
                }

                if (avaliacao > index && avaliacao < estrelaNumero) {
                  return <StarHalf key={index} size={14} className="fill-amber-400 stroke-amber-400 shrink-0" />;
                }

                return <Star key={index} size={14} className="stroke-muted-foreground shrink-0" />;
              })}
            </div>
            <span className="text-body-sm text-muted-foreground font-medium">
              <span className="sr-only-status">Avaliação: </span>{avaliacao?.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>

      {/* Preço + agendar — ações separadas do link de detalhe, sem link aninhado */}
      <div className="mt-auto px-4 pb-4 pt-1 flex items-center justify-between gap-2">
        <span className="text-body-lg font-bold text-tcc-laranja-deep dark:text-tcc-laranja whitespace-nowrap">
          R$ {servico?.preco || "0,00"}
        </span>
        <Link
          href={`/agendamentos/novo?servico=${servico.id}`}
          aria-label={`Agendar horário para ${servico?.nomeServico || "este serviço"}`}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-accent hover:bg-accent-hover text-accent-foreground text-body-sm font-bold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <CalendarPlus size={16} aria-hidden="true" />
          Agendar
        </Link>
      </div>
    </article>
  );
}
