"use client";
import { useState, useRef, useEffect, useId } from "react";
import { User, LogOut, UserRound, Heart, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth.actions";
import { useMounted } from "@/app/hooks/useMounted";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

export default function PerfilDropdown({ user }) {
    const [aberto, setAberto] = useState(false);
    const [confirmandoSaida, setConfirmandoSaida] = useState(false);
    const menuRef = useRef(null);
    const botaoRef = useRef(null);
    const idPainel = useId();
    const mounted = useMounted();

    useEffect(() => {
        function handleClickFora(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setAberto(false);
            }
        }
        // esc fecha e devolve o foco ao botao
        function handleKeyDown(event) {
            if (event.key !== "Escape") return;
            setAberto((estavaAberto) => {
                if (estavaAberto) botaoRef.current?.focus();
                return false;
            });
        }
        document.addEventListener("mousedown", handleClickFora);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickFora);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (!mounted) {
        return <span className="inline-block h-11 w-11" aria-hidden="true" />;
    }

    function pedirConfirmacaoSaida() {
        setAberto(false);
        setConfirmandoSaida(true);
    }

    async function confirmarSaida() {
        await logout();
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                ref={botaoRef}
                type="button"
                onClick={() => setAberto((prev) => !prev)}
                className="bg-primary text-primary-foreground h-11 w-11 rounded-full p-0.5 hover:bg-primary-hover transition shadow-inner cursor-pointer overflow-hidden flex items-center justify-center"
                aria-label="Menu do perfil"
                aria-expanded={aberto}
                aria-controls={aberto ? idPainel : undefined}
            >
                {user?.urlImagem ? (
                    <Image
                        src={user.urlImagem}
                        className="w-full h-full aspect-square rounded-full object-cover"
                        width={44}
                        height={44}
                        alt=""
                    />
                ) : (
                    <UserRound size={22} className="text-primary-foreground" aria-hidden="true" />
                )}
            </button>

            {aberto && (
                <nav
                    id={idPainel}
                    aria-label="Conta"
                    className="absolute right-0 top-full mt-3 w-56 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50"
                >
                    <Link
                        href="/configuracoes"
                        onClick={() => setAberto(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors"
                    >
                        <UserRound size={18} className="text-muted-foreground" aria-hidden="true" />
                        <span className="text-body-sm font-semibold">Configurações</span>
                    </Link>
                    {user?.id && (
                        <Link
                            href={user.tipo === 'prestador' ? `/prestador/${user.slug || user.id}` : `/cliente/${user.slug || user.id}`}
                            onClick={() => setAberto(false)}
                            className="flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors"
                        >
                            <User size={18} className="text-muted-foreground" aria-hidden="true" />
                            <span className="text-body-sm font-semibold">Perfil Público</span>
                        </Link>
                    )}
                    <Link
                        href="/favoritos"
                        onClick={() => setAberto(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors"
                    >
                        <Heart size={18} className="text-muted-foreground" aria-hidden="true" />
                        <span className="text-body-sm font-semibold">Favoritos</span>
                    </Link>
                    {user?.tipo === 'cliente' && (
                        <Link
                            href="/configuracoes#virar-prestador"
                            onClick={() => setAberto(false)}
                            className="flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors"
                        >
                            <Briefcase size={18} className="text-muted-foreground" aria-hidden="true" />
                            <span className="text-body-sm font-semibold">Oferecer serviços</span>
                        </Link>
                    )}
                    <ThemeToggle variant="menuitem" onNavigate={() => setAberto(false)} />
                    <button
                        type="button"
                        onClick={pedirConfirmacaoSaida}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-destructive hover:bg-muted transition-colors cursor-pointer"
                    >
                        <LogOut size={18} aria-hidden="true" />
                        <span className="text-body-sm font-bold">Sair</span>
                    </button>
                </nav>
            )}

            <ConfirmDialog
                open={confirmandoSaida}
                onOpenChange={setConfirmandoSaida}
                title="Sair da conta?"
                description="Você precisará entrar novamente para acessar sua conta."
                confirmLabel="Sair"
                onConfirm={confirmarSaida}
            />
        </div>
    );
}