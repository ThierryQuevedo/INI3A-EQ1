import { Star, StarHalf } from 'lucide-react';
import Image from "next/image";

export default function CardServicoDestaque({ servico, avaliacao = 5 }) {
  const imagemUrl = `https://picsum.photos/200/200?random=${servico?.id || 1}`;

  return (
    <div className="w-50 h-50 relative rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 ease-apple">
      <Image
        className="object-cover"
        src={imagemUrl}
        alt={`Foto de ${servico?.nomeProfissional || "Profissional"}`}
        fill
        sizes="200px"
      />

      <div className="absolute rounded-b-2xl w-full bg-tcc-laranja bottom-0 text-center px-2 py-2 text-white">
        <h2
          className="font-semibold text-body-lg leading-tight truncate"
          title={servico?.nomeProfissional}
        >
          {servico?.nomeProfissional || "Profissional"}
        </h2>
        <h3
          className="text-caption truncate"
          title={servico?.nomeServico}
        >
          {servico?.nomeServico || "Serviço"}
        </h3>

        <div className="flex justify-center items-center gap-2 mt-1">
          <span className="text-caption font-bold">
            R$ {servico?.preco || "0,00"}
          </span>
          <div className="flex gap-0.5" aria-hidden="true">
            {[...Array(5)].map((_, index) => {
              const estrelaNumero = index + 1;

              if (avaliacao >= estrelaNumero) {
                return <Star key={index} size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />;
              }

              if (avaliacao > index && avaliacao < estrelaNumero) {
                return <StarHalf key={index} size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />;
              }

              return <Star key={index} size={12} className="stroke-white/60 shrink-0" />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
