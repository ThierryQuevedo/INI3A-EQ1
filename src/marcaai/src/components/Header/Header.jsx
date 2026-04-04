import { User, Menu } from 'lucide-react';
import Link from "next/link";
import Navbar from './MenuNavBar';
import { encerrarSessao } from "../../app/usuario/login/actions";
import { cookies } from "next/headers";

export default async function Header() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session_token");

    // Se o cookie existe, o destino é o perfil, senão é o login
    const destinoIcone = session ? "/usuario" : "/usuario/login";

  return (
    <header className="bg-blue-300 flex items-center justify-between px-10 h-16 shrink-0">
      
      {/* Aqui entra o seu componente de Menu */}
      <div className="flex items-center">
        <Navbar />
      </div>

      {/* Logo Central */}
      <Link href="/" className="text-2xl font-bold">
        <p className="bg-yellow-200 rounded-md p-2 hover:bg-yellow-300 transition-colors">
          Marca Ai
        </p>
      </Link>

      {/* Link de Usuário */}

      <form action={encerrarSessao}>
            <button type="submit" className="text-red-500 hover:underline">
                Sair da conta
            </button>
            </form>

      <Link 
        href={destinoIcone} 
        className="bg-green-700 text-white rounded-full p-2 hover:bg-red-500 hover:scale-105 transition-all duration-200"
      >
        <User size={24} />    
      </Link>
      
    </header>
  );
}