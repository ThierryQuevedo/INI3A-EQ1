import { User } from 'lucide-react';
import Link from "next/link";
import Navbar from './MenuNavBar';
import { logoutAction } from "../../app/actions/action_login";
import { getSession } from "../../app/actions/action_sessao";

export default async function Header() {
    const user = await getSession();

    return (
        /* Usando o azul escuro para autoridade e texto claro para contraste */
        <header className="bg-tcc-azul-dark flex items-center justify-between px-10 h-16 shrink-0 text-tcc-azul-lightest shadow-md">
            
            <div className="flex items-center">
                <Navbar />
            </div>

            {/* Logo Central: Usando o Laranja para destaque máximo no nome da marca */}
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
                <p className="bg-tcc-laranja text-tcc-laranja-black rounded-md px-4 py-1 hover:bg-tcc-laranja-dark transition-all duration-300 shadow-sm">
                    Marca Ai
                </p>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-tcc-azul-light">
                            Olá, <span className="text-white">{user.name}</span>
                        </span>
                        <form action={logoutAction}>
                            <button 
                                type="submit" 
                                className="text-xs uppercase tracking-wider text-tcc-laranja-pale hover:text-tcc-laranja transition-colors font-bold"
                            >
                                Sair
                            </button>
                        </form>
                    </div>
                ) : null}

                {/* Ícone de Usuário: Azul médio para não brigar com o logo, mas ainda ser clicável */}
                <Link 
                    href={user ? "/usuario" : "/usuario/login"} 
                    className="bg-tcc-azul-medium text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-light hover:scale-110 transition-all duration-200 shadow-inner"
                >
                    <User size={22} />    
                </Link>
            </div>
        </header>
    );
}