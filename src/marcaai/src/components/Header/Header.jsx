import { User } from 'lucide-react';
import Link from "next/link";
import Navbar from './MenuNavBar';
import { logoutAction } from "../../app/actions/action_login";
import { getSession } from "../../app/actions/action_sessao"; // Importe sua função de validar sessão

export default async function Header() {
    // 1. Em vez de só olhar o cookie, pegamos a sessão real
    const user = await getSession();

    return (
        <header className="bg-blue-300 flex items-center justify-between px-10 h-16 shrink-0">
            
            <div className="flex items-center">
                <Navbar />
            </div>

            {/* Logo Central */}
            <Link href="/" className="text-2xl font-bold">
                <p className="bg-yellow-200 rounded-md p-2 hover:bg-yellow-300 transition-colors">
                    Marca Ai
                </p>
            </Link>

            <div className="flex items-center gap-4">
                {/* 2. Renderização Condicional: Só mostra o botão "Sair" se houver usuário */}
                {user ? (
                    <>
                        <span className="text-sm font-medium">Olá, {user.name}</span>
                        <form action={logoutAction}>
                            <button type="submit" className="text-red-600 font-bold hover:underline">
                                Sair
                            </button>
                        </form>
                    </>
                ) : (
                    <h1></h1>
                )}

                {/* 3. Ícone de Usuário: Destino dinâmico */}
                <Link 
                    href={user ? "/usuario" : "/usuario/login"} 
                    className="bg-green-700 text-white rounded-full p-2 hover:bg-green-800 hover:scale-105 transition-all duration-200"
                >
                    <User size={24} />    
                </Link>
            </div>
        </header>
    );
}