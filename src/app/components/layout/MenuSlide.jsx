"use client";

import Image from "next/image";
import { User, Calendar, BookOpen, Info, LayoutDashboard, Home, X } from "lucide-react";
import Link from "next/link";

export default function MenuSlide({ isOpen, onClose, usuario }) {
    const nome = usuario?.nome || "Visitante";
    const email = usuario?.email || "Entre na sua conta";
    const tipo = usuario?.tipo || "visitante";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}


            <div
                className="fixed top-0 left-0 h-screen w-80 bg-tcc-azul-medium flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl"
                style={{
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)"
                }}
            >

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-tcc-azul-light transition-colors p-2 rounded-lg cursor-pointer z-10"
                    aria-label="Fechar menu"
                >
                    <X size={26} />
                </button>

                <div className="px-6 pb-6 pt-14 flex flex-col items-center relative w-full h-full overflow-y-auto">


                    <div className="py-3 px-4 rounded-xl bg-tcc-azul-darker w-full flex justify-start items-center flex-row gap-3 mt-2">
                        
                        {usuario?.urlImagem ? (
                            <Image
                                src={usuario.urlImagem}
                                width={48}
                                height={48}
                                alt="Avatar"
                                className="rounded-full shrink-0"
                            />
                        ) : (
                            <User width={48} height={48} />
                        )}


                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-base font-bold text-white truncate">{nome}</h1>
                            <h2 className="text-xs text-tcc-azul-light truncate">{email}</h2>
                        </div>
                    </div>

                    {/* Links de Navegação */}
                    <div className="flex mt-6 flex-col gap-2.5 w-full items-center">
                        <Link href="/" onClick={onClose} className="py-2.5 px-4 rounded-xl bg-tcc-azul-dark w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                            <Home size={22} className="text-white"/>
                            <span className="font-urbanist font-bold text-lg text-white">Início</span>
                        </Link>

                        <Link href={usuario ? "/configuracoes" : "/login"} onClick={onClose} className="py-2.5 px-4 rounded-xl bg-tcc-azul-dark w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                            <User size={22} className="text-white"/>
                            <span className="font-urbanist font-bold text-lg text-white">Perfil</span>
                        </Link>

                        <Link href="/agendamentos" onClick={onClose} className="py-2.5 px-4 rounded-xl bg-tcc-azul-dark w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                            <Calendar size={22} className="text-white"/>
                            <span className="font-urbanist font-bold text-lg text-white">Agenda</span>
                        </Link>

                        <Link href="/servicos" onClick={onClose} className="py-2.5 px-4 rounded-xl bg-tcc-azul-dark w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                            <BookOpen size={22} className="text-white"/>
                            <span className="font-urbanist font-bold text-lg text-white">Catálogo</span>
                        </Link>

                        {tipo === "prestador" && (
                            <Link href="/dashboard" onClick={onClose} className="py-2.5 px-4 rounded-xl bg-tcc-laranja w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                                <LayoutDashboard size={22} className="text-white"/>
                                <span className="font-urbanist font-bold text-lg text-white">Painel</span>
                            </Link>
                        )}

                        <Link href="/sobre" onClick={onClose} className="mt-4 py-2.5 px-4 rounded-xl bg-tcc-azul-dark w-full flex justify-start items-center flex-row hover:brightness-110 transition-all gap-3">
                            <Info size={22} className="text-white"/>
                            <span className="font-urbanist font-bold text-lg text-white">Sobre nós</span>
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}
