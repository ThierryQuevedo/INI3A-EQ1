import { User, Menu } from 'lucide-react';
import Link from "next/link";
import Image from "next/image"
import Navbar from './MenuNavBar';
import logotipo from '../../../public/images/Identidade visual marca ai/logotipo.png'
import { logoutAction } from "../../app/actions/action_login";
import { getSession } from "../../app/actions/action_sessao";

export default async function Header() {
    const user = await getSession();

    return (
        /* Usando o azul escuro para autoridade e texto claro para contraste */
        <header className="bg-tcc-azul-darker flex items-center justify-between px-10 h-16 shrink-0 text-tcc-azul-lightest shadow-md">
            
                <Link 
                    href={user ? "/usuario" : "/usuario/login"} 
                    className="bg-tcc-azul text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner">
                    <Menu size={22} className='text-tcc-neutro-100'/>    
                </Link>

            {/* Logo Central: Usando o Laranja para destaque máximo no nome da marca */}
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
                <Image src={logotipo} className='w-45
                '/>
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
                    className="bg-tcc-azul text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner">
                    <User size={22} className='text-tcc-neutro-100'/>    
                </Link>
            </div>
        </header>
    );
}