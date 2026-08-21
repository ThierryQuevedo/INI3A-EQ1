import { LayoutDashboard } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import MenuWrapper from './MenuSlideWrapper';
import PerfilDropdown from './MenuPerfilDropdown';
import logotipo from '../../../public/images/Identidade visual marca ai/logotipo.png';

import { getSession } from "@/app/actions/auth.actions";

export const dynamic = 'force-dynamic';

export default async function Header() {
    const user = await getSession();

    return (
        <header className="bg-tcc-azul-darker sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 h-16 shrink-0 text-tcc-azul-lightest shadow-md">

            <MenuWrapper usuario={user} />

            <Link
                href="/"
                className="absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight z-10"
            >
                <Image src={logotipo} className='w-45' alt='logotipo marcaai' />
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <div className="flex items-center gap-4">
                        {user.tipo === "prestador" && (
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 text-sm font-semibold bg-tcc-azul-medium/40 hover:bg-tcc-azul-medium/70 text-white px-3 py-1.5 rounded-lg border border-tcc-azul-medium hover:border-tcc-azul-light transition-all duration-200"
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                        )}

                        <Link
                            href="/configuracoes"
                            className="text-sm font-medium text-tcc-azul-light hover:text-white transition-colors hidden sm:inline"
                        >
                            Olá, <span className="text-white font-semibold">{user.nome}</span>
                        </Link>

                        <PerfilDropdown user={user} />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-semibold text-tcc-azul-light hover:text-white transition-colors">
                            Entrar
                        </Link>
                        <span className="text-tcc-azul-medium text-sm">|</span>
                        <Link
                            href="/cadastro"
                            className="text-sm font-bold bg-tcc-laranja hover:bg-tcc-laranja-dark text-white px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                            Criar Conta
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
