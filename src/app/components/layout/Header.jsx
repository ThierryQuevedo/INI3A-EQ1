import { LayoutDashboard } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import MenuWrapper from './MenuSlideWrapper';
import PerfilDropdown from './MenuPerfilDropdown';
import ThemeToggle from './ThemeToggle';
import logotipo from '../../../public/images/Identidade visual marca ai/logotipo.png';

import { getSession } from "@/app/actions/auth.actions";

export const dynamic = 'force-dynamic';

export default async function Header() {
    const user = await getSession();

    return (
        <header className="sticky top-0 z-50 w-full bg-tcc-azul-darker/90 backdrop-blur-md h-16 shrink-0 text-tcc-azul-lightest shadow-soft">
            <div className="relative w-full h-full">

                <div className="absolute inset-0 flex items-center justify-center">
                    <Link href="/" className="z-30 p-1 rounded-lg hover:opacity-90 transition-opacity">
                        <Image
                            src={logotipo}
                            className="w-32 sm:w-40 h-auto object-contain"
                            alt="Marca Aí — página inicial"
                            priority
                        />
                    </Link>
                </div>
                <div className="relative z-20 flex items-center justify-between h-full px-4 sm:px-6 lg:px-10 pointer-events-none">

                    <div className="flex items-center pointer-events-auto">
                        <MenuWrapper usuario={user} />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
                        <ThemeToggle className="text-tcc-azul-lightest" />

                        {user ? (
                            <div className="flex items-center gap-3 sm:gap-4">
                                {user.tipo === "prestador" && (
                                    <Link
                                        href="/dashboard"
                                        className="hidden sm:flex items-center gap-2 text-body-sm font-semibold bg-tcc-azul-medium/40 hover:bg-tcc-azul-medium/70 text-white px-4 h-11 rounded-full border border-tcc-azul-medium hover:border-tcc-azul-light transition-all duration-200"
                                    >
                                        <LayoutDashboard size={16} aria-hidden="true" />
                                        Dashboard
                                    </Link>
                                )}

                                <Link
                                    href="/configuracoes"
                                    className="text-body-sm font-medium text-tcc-azul-light hover:text-white transition-colors hidden sm:inline"
                                >
                                    Olá, <span className="text-white font-semibold">{user.nome}</span>
                                </Link>

                                <PerfilDropdown user={user} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link href="/login" className="text-body-sm font-semibold text-tcc-azul-light hover:text-white transition-colors px-3 h-11 inline-flex items-center rounded-full">
                                    Entrar
                                </Link>
                                <Link
                                    href="/cadastro"
                                    className="text-body-sm font-bold bg-tcc-laranja hover:bg-tcc-laranja-dark text-white px-4 h-11 inline-flex items-center rounded-full transition-all duration-200"
                                >
                                    Criar Conta
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}
