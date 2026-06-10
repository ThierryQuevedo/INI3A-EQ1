import { Star, StarHalf } from 'lucide-react'; 
import Image from "next/image";

export default function CardServicoCatalogo({ servico, avaliacao = 5 }) {
  const imagemUrl = `https://picsum.photos/100/100?random=${servico?.id || 1}`;

  return (
    <div className="w-40 bg-tcc-neutro-100 rounded-2xl shadow-md p-4 flex flex-col items-center border border-gray-100 transition-transform duration-200 hover:scale-102 h-full cursor-pointer">
      
      <div className="relative size-24 rounded-2xl overflow-hidden mb-3 shrink-0">
        <Image 
          className="object-cover"
          src={imagemUrl} 
          alt={`Foto de ${servico?.nomeProfissional || "Profissional"}`} 
          fill
          sizes="96px"
        />
      </div>

      <h3 className="font-semibold text-lg text-gray-800 text-center leading-tight w-full truncate px-1" title={servico?.nomeProfissional}>
        {servico?.nomeProfissional  || "Profissional"}
      </h3>
      
      <p className="text-sm text-gray-500 mb-2 font-medium w-full text-center truncate" title={servico?.nomeCategoria}>
        {servico?.nomeCategoria || "Categoria"}
      </p>

      <div className="flex flex-col items-center w-full bg-gray-200/50 rounded-lg p-1.5 mb-3">
        <span className="text-xs text-gray-600 truncate w-full text-center" title={servico?.nomeServico}>
          {servico?.nomeServico || "Serviço"}
        </span>
        <span className="text-sm font-bold text-tcc-laranja mt-0.5">
          R$ {servico?.preco || "0,00"}
        </span>
      </div>

      <div className="flex gap-0.5 mt-auto">
        {[...Array(5)].map((_, index) => {
          const estrelaNumero = index + 1;

          if (avaliacao >= estrelaNumero) {
            return <Star key={index} size={16} className="fill-amber-400 stroke-amber-400 shrink-0" />;
          } 
          
          if (avaliacao > index && avaliacao < estrelaNumero) {
            return <StarHalf key={index} size={16} className="fill-amber-400 stroke-amber-400 shrink-0" />;
          }

          return <Star key={index} size={16} className="stroke-gray-300 shrink-0" />;
        })}
      </div>
    </div>
  );
}