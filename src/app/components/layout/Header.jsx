import { LayoutDashboard } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import HeaderDesktopNav from './HeaderDesktopNav';
import PerfilDropdown from './MenuPerfilDropdown';
import ThemeToggle from './ThemeToggle';
import logotipo from '../../../public/images/Identidade visual marca ai/logotipo.png';

export default function Header({ usuario }) {
    return (
        <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border h-16 shrink-0 shadow-soft">
            <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">

                <Link href="/" className="shrink-0 p-1 rounded-lg hover:opacity-90 transition-opacity">
                    <Image
                        src={logotipo}
                        className="w-32 sm:w-36 h-auto object-contain"
                        alt="Marca Aí — página inicial"
                        priority
                    />
                </Link>

                <HeaderDesktopNav usuario={usuario} className="max-md:hidden md:flex" />

                <div className="flex items-center gap-1 sm:gap-2">
                    <ThemeToggle className="inline-flex text-muted-foreground hover:text-foreground" />

                    {usuario ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            {usuario.tipo === "prestador" && (
                                <Link
                                    href="/dashboard"
                                    className="max-md:hidden md:flex items-center gap-2 text-body-sm font-semibold bg-secondary hover:bg-secondary/70 text-secondary-foreground px-4 h-11 rounded-full transition-colors duration-200"
                                >
                                    <LayoutDashboard size={16} aria-hidden="true" />
                                    Painel
                                </Link>
                            )}

                            <Link
                                href="/configuracoes"
                                className="text-body-sm font-medium text-muted-foreground hover:text-foreground transition-colors max-lg:hidden lg:inline"
                            >
                                Olá, <span className="text-foreground font-semibold">{usuario.nome}</span>
                            </Link>

                            <PerfilDropdown user={usuario} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href="/login" className="text-body-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 h-11 inline-flex items-center rounded-full">
                                Entrar
                            </Link>
                            <Link
                                href="/cadastro"
                                className="text-body-sm font-bold bg-accent hover:bg-accent-hover text-accent-foreground px-4 h-11 inline-flex items-center rounded-full transition-all duration-200"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
