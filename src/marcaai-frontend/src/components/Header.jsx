// 1. Força o Next.js a ler este componente de forma dinâmica a cada requisição
export const dynamic = 'force-dynamic';

import { User } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import MenuWrapper from '../components/menu/MenuSlideWrapper';
import logotipo from '../../public/images/Identidade visual marca ai/logotipo.png';
import { logoutAction } from "../app/actions/auth";

// Importando as funções do seu auth correto para decodificar o JWT
import { getSession, decodeJwtPayload } from "../app/actions/auth";

export default async function Header() {
    // 2. Buscamos o token e decodificamos os dados reais do usuário atualizado no servidor
    const token = await getSession();
    const user = await decodeJwtPayload(token); 

    return (
        <header className="bg-tcc-azul-darker flex relative items-center justify-between px-10 h-16 shrink-0 text-tcc-azul-lightest shadow-md">
            
            {/* 3. Passamos os dados do usuário para o Wrapper do Menu (mesmo se for null) */}
            <MenuWrapper usuario={user} />

            <Link 
                href="/" 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight z-10"
            >
                <Image src={logotipo} className='w-45' alt='logotipo marcaai'/>
            </Link>

            <div className="flex items-center gap-6">
                {/* LOGICA CONDICIONAL DE AUTENTICAÇÃO */}
                {user ? (
                    // Se o usuário ESTIVER LOGADO, mostra o nome dele e o botão de Sair
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-tcc-azul-light">
                            Olá, <span className="text-white">{user.nome || user.name}</span>
                        </span>
                        <form action={logoutAction}>
                            <button 
                                type="submit" 
                                className="text-xs uppercase tracking-wider text-tcc-laranja-pale hover:text-tcc-laranja transition-colors font-bold cursor-pointer"
                            >
                                Sair
                            </button>
                        </form>
                    </div>
                ) : (
                    // Se NÃO TIVER USUÁRIO LOGADO, mostra os links de Login/Cadastro
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/login" 
                            className="text-sm font-semibold text-tcc-azul-light hover:text-white transition-colors"
                        >
                            Entrar
                        </Link>
                        <span className="text-tcc-azul-medium text-sm">|</span>
                        <Link 
                            href="/cadastrar" 
                            className="text-sm font-bold bg-tcc-laranja hover:bg-tcc-laranja-dark text-white px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                            Criar Conta
                        </Link>
                    </div>
                )}

                {/* Ícone de perfil redondo tradicional */}
                <Link 
                    href={user ? "/usuario" : "/login"} 
                    className="bg-tcc-azul text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner"
                    title={user ? "Meu Perfil" : "Fazer Login"}
                >
                    <User size={22} className='text-tcc-neutro-100'/>    
                </Link>
            </div>
        </header>
    );
}