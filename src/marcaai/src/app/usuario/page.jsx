import Image from "next/image";
import { User } from "lucide-react";

export default function PaginaUsuario() {
  return (
    <div>
      <section className="relative flex flex-col items-center">
        
        <div className="relative w-full h-48 overflow-hidden"> 
            <Image src="https://picsum.photos/800/300" alt="Capa do usuário" fill className="object-cover" priority/>
        </div>

        <div className="absolute -bottom-10 flex justify-center w-full">
          <div className="bg-amber-300 h-20 w-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
            <User size={40} className="text-amber-900" />
          </div>
        </div>
    
      </section>
      <div className="h-14"></div>
      
      <div>
        <h1 className="text-center text-xl font-bold">Nome do Usuário</h1>
        <h2 className="text-center text-lg font-medium">Profissão</h2>
      </div>
    </div>
  );
}