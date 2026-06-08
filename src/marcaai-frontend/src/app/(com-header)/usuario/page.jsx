import Image from "next/image";
import Calendario from "../../../components/calendario/Calendario";
import { User } from "lucide-react";
import { db } from "../../../db/index"; 
import { users } from "../../../db/schema.js"; 
import { eq } from "drizzle-orm";
//import { getSession } from "../../actions/action_sessao";
import { getSession } from "../../actions/auth";

export default async function PaginaUsuario() {
  const usuario = await getSession();

  if (!usuario) {
    return <div className="text-center p-10">Usuário não encontrado.</div>;
  }

  return (
    <div>
      <section className="relative flex flex-col items-center">
        <div className="relative w-full h-48 overflow-hidden"> 
            <Image src="https://picsum.photos/800/300" alt="Capa do usuário" fill className="object-cover" priority/>
        </div>

      <div className="absolute -bottom-10 flex justify-center w-full">
        <div className="bg-amber-300 h-20 w-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
          {/* Removido o <User /> e mantida apenas a Image */}
          {/* <User size={40} className="text-amber-900" /> */}
          <Image 
            src="https://picsum.photos/seed/picsum/200/200" 
            alt="Foto de Perfil" 
            width={200} 
            height={200} 
            className="object-cover w-full h-full" 
            priority
          />
        </div>
      </div>
      </section>

      <div className="h-14"></div>
      
      <div>
        {/* 2. Substituímos o texto estático pelos dados do banco */}
        <h1 className="text-center text-xl font-bold">
          {usuario.name}
        </h1>
        <h2 className="text-center text-lg font-medium text-gray-500">
          {usuario.email}
        </h2>
        {/* Se você tiver o campo 'profissao' no seu schema.js: */}
        {/* <h2 className="text-center text-lg font-medium">{usuario.profissao}</h2> */}
      </div>
      <main className="bg-red-200 flex-row">
        <div className="bg-gray-200 flex">
          {/*calendario*/}
          <Calendario/>
          <section className="bg-fuchsia-300 w-100">
            <h1 className="text-center">Detalhes</h1>
            <div>
              <p>Telefone: {usuario.telefone}</p>
              <p>Endereço: </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}