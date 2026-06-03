import { Star } from 'lucide-react';
import Image from "next/image";


export default function CardServicoCatalogo({avaliacao}) {

  return (
    <div className="w-37 bg-tcc-neutro-100 rounded-2xl shadow-md p-4 flex flex-col items-center border border-gray-100 transition-transform duration-200 hover:scale-102">
      <div className="relative size-24 rounded-2xl overflow-hidden mb-3">
        <Image 
          className="object-cover"
          src="https://picsum.photos/100/100?random=1" 
          alt="Foto de perfil do Fabrício" 
          fill
          sizes="96px"/>
      </div>


      <h3 className="font-semibold text-lg text-gray-800 text-center leading-tight">
        Fabrício
      </h3>
      <p className="text-sm text-gray-500 mb-2 font-medium">
        Cabeleireiro
      </p>

      <div className="flex gap-0.5 mt-auto">
        {[...Array(5)].map((_, index) => (
          <Star 
            key={index} 
            size={16} 
            className={index < avaliacao ? "fill-amber-400 stroke-amber-400" : "stroke-gray-300"} 
          />
        ))}
      </div>
    </div>
  );
}