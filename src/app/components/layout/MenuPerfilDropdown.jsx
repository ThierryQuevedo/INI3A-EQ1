"use client";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth.actions";

export default function PerfilDropdown({ user }) {
    const [aberto, setAberto] = useState(false);
    const [confirmandoSaida, setConfirmandoSaida] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const menuRef = useRef(null);


    useEffect(() => {
        function handleClickFora(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setAberto(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") setAberto(false);
        }
        document.addEventListener("mousedown", handleClickFora);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickFora);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function pedirConfirmacaoSaida() {
        setAberto(false);
        setConfirmandoSaida(true);
    }

    function cancelarSaida() {
        setConfirmandoSaida(false);
    }

    async function confirmarSaida() {
        setSaindo(true);
        try {
            await logout();
        } finally {
            setSaindo(false);
            setConfirmandoSaida(false);
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setAberto((prev) => !prev)}
                className="bg-tcc-azul text-tcc-azul-deep h-11 w-11 rounded-full p-0.5 hover:bg-tcc-azul-medium transition-all duration-200 shadow-inner cursor-pointer overflow-hidden flex items-center justify-center"
                aria-label="Menu do perfil"
                aria-haspopup="menu"
                aria-expanded={aberto}
            >
                {user?.urlImagem ? (
                    <img src={user.urlImagem} className="w-full h-full aspect-square rounded-full object-cover" width={44} height={44} alt="" />
                ) : (
                    <UserRound size={22} className="text-white" aria-hidden="true" />
                )}
            </button>

            {aberto && (
                <div role="menu" className="absolute right-0 top-full mt-3 w-56 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50">
                    <Link
                        href="/configuracoes"
                        role="menuitem"
                        onClick={() => setAberto(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors"
                    >
                        <UserRound size={18} className="text-tcc-azul-dark" aria-hidden="true" />
                        <span className="text-body-sm font-semibold">Perfil</span>
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={pedirConfirmacaoSaida}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-tcc-laranja hover:bg-muted transition-colors cursor-pointer"
                    >
                        <LogOut size={18} aria-hidden="true" />
                        <span className="text-body-sm font-bold">Sair</span>
                    </button>
                </div>
            )}

            {confirmandoSaida && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
                    <div role="alertdialog" aria-modal="true" aria-labelledby="sair-titulo" className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full">
                        <h2 id="sair-titulo" className="text-base font-extrabold text-foreground mb-2">Sair da conta?</h2>
                        <p className="text-body-sm text-muted-foreground mb-6">
                            Você precisará entrar novamente para acessar sua conta.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelarSaida}
                                disabled={saindo}
                                className="flex-1 rounded-xl h-11 text-body-sm font-bold text-foreground bg-muted hover:bg-muted/70 transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarSaida}
                                disabled={saindo}
                                className="flex-1 rounded-xl h-11 text-body-sm font-bold text-white bg-tcc-laranja hover:bg-tcc-laranja-dark transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                {saindo ? "Saindo..." : "Sair"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
