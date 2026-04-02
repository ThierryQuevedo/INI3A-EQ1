import Image from "next/image";
import { User } from "lucide-react";
import { db } from "../../db/index"; 
import { users } from "../../db/schema.js"; 
import { eq } from "drizzle-orm";

export default async function PaginaUsuario() {
  const listaUsuarios = await db.select().from(users).where(eq(users.id, 2));
  const usuario = listaUsuarios[0];

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
          <div className="bg-amber-300 h-20 w-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
            <User size={40} className="text-amber-900" />
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
    </div>
  );
}