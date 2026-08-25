import { Star, StarHalf } from 'lucide-react';
import Image from "next/image";

export default function CardServicoCatalogo({ servico, avaliacao = 5 }) {
  const imagemUrl = `https://picsum.photos/200/200?random=${servico?.id || 1}`;

  return (
    <div className="group w-full max-w-[180px] bg-card rounded-2xl shadow-soft hover:shadow-elevated p-3 flex flex-col items-center border border-border transition-all duration-300 ease-apple hover:-translate-y-1 h-full">

      {/* Imagem com overlay de gradiente e badge de categoria */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shrink-0">
        <Image
          className="object-cover transition-transform duration-300 ease-apple group-hover:scale-110"
          src={imagemUrl}
          alt={`Foto de ${servico?.nomeProfissional || "Profissional"}`}
          fill
          sizes="(max-width: 768px) 50vw, 180px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />

        {servico?.nomeCategoria && (
          <span
            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-tcc-azul-deep text-caption font-semibold px-2 py-1 rounded-full truncate max-w-[85%]"
            title={servico.nomeCategoria}
          >
            {servico.nomeCategoria}
          </span>
        )}
      </div>

      {/* Nome do profissional */}
      <h3
        className="font-bold text-body-sm text-foreground text-center leading-tight w-full truncate px-1"
        title={servico?.nomeProfissional}
      >
        {servico?.nomeProfissional || "Profissional"}
      </h3>

      {/* Estrelas de avaliação */}
      <div className="flex items-center gap-1 mt-1 mb-2">
        <div className="flex gap-0.5" aria-hidden="true">
          {[...Array(5)].map((_, index) => {
            const estrelaNumero = index + 1;

            if (avaliacao >= estrelaNumero) {
              return <Star key={index} size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />;
            }

            if (avaliacao > index && avaliacao < estrelaNumero) {
              return <StarHalf key={index} size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />;
            }

            return <Star key={index} size={12} className="stroke-muted-foreground shrink-0" />;
          })}
        </div>
        <span className="text-caption text-muted-foreground font-medium">
          <span className="sr-only-status">Avaliação: </span>{avaliacao?.toFixed(1)}
        </span>
      </div>

      {/* Nome do serviço + preço */}
      <div className="flex flex-col items-center w-full bg-muted rounded-lg px-2 py-1.5 mt-auto border border-border">
        <span
          className="text-caption text-muted-foreground truncate w-full text-center"
          title={servico?.nomeServico}
        >
          {servico?.nomeServico || "Serviço"}
        </span>
        <span className="text-body-sm font-bold text-tcc-laranja mt-0.5">
          R$ {servico?.preco || "0,00"}
        </span>
      </div>
    </div>
  );
}
