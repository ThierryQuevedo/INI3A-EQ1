"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth.actions";
import AvatarUpload from "@/app/components/layout/AvatarUpload";
import BannerUpload from "..";

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
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
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
                className="bg-tcc-azul text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner cursor-pointer"
                title="Meu Perfil"
            >
                {/* <AvatarUpload> */}
            </button>

            {aberto && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-lg border border-tcc-neutro-100/30 overflow-hidden z-50">
                    <Link
                        href="/configuracoes"
                        onClick={() => setAberto(false)}
                        className="flex items-center gap-3 px-5 py-3 text-tcc-neutro-700 hover:bg-tcc-neutro-100/40 transition-colors"
                    >
                        <UserRound size={18} className="text-tcc-azul-dark" />
                        <span className="text-sm font-semibold">Perfil</span>
                    </Link>

                    <button
                        type="button"
                        onClick={pedirConfirmacaoSaida}
                        className="w-full flex items-center gap-3 px-5 py-3 text-tcc-laranja hover:bg-tcc-neutro-100/40 transition-colors cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-bold">Sair</span>
                    </button>
                </div>
            )}

            {confirmandoSaida && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-base font-extrabold text-tcc-neutro-700 mb-2">Sair da conta?</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Você precisará entrar novamente para acessar sua conta.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelarSaida}
                                disabled={saindo}
                                className="flex-1 rounded-xl py-3 text-sm font-bold text-tcc-neutro-700 bg-tcc-neutro-100/40 hover:bg-tcc-neutro-100/70 transition-colors disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarSaida}
                                disabled={saindo}
                                className="flex-1 rounded-xl py-3 text-sm font-bold text-white bg-tcc-laranja hover:bg-tcc-laranja-dark transition-colors disabled:opacity-60"
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
