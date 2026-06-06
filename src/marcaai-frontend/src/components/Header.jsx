import { User } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import MenuWrapper from '../components/menu/MenuSlideWrapper';
import logotipo from '../../public/images/Identidade visual marca ai/logotipo.png';
import { logoutAction } from "../app/actions/action_login";
import { getSession } from "../app/actions/action_sessao";

export default async function Header() {
    const user = await getSession();

    return (
        <header className="bg-tcc-azul-darker flex relative items-center justify-between px-10 h-16 shrink-0 text-tcc-azul-lightest shadow-md">
            
            <MenuWrapper />

       
            <Link 
                href="/" 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight z-10"
            >
                <Image src={logotipo} className='w-45' alt='logotipo marcaai'/>
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

                <Link 
                    href={user ? "/usuario" : "/usuario/login"} 
                    className="bg-tcc-azul text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner">
                    <User size={22} className='text-tcc-neutro-100'/>    
                </Link>
            </div>
        </header>
    );
}