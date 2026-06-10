import Image from "next/image";
import { User, Calendar, BookOpen, Info } from "lucide-react";
import Link from "next/link";

export default function MenuSlide({ isOpen, onClose, usuario }) {
    // 💡 SEGURANÇA: Se 'usuario' for null, evita o quebra utilizando o operador ?.
    // E define valores padrão amigáveis para quem está deslogado.
    const nome = usuario?.nome || "Visitante";
    const email = usuario?.email || "Entre na sua conta";
    const tipo = usuario?.tipo || "visitante";

    return (
        <div>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-45 transition-all transition-opacity duration-300"
                    onClick={onClose}
                />
            )}
            <div className={`fixed top-0 left-0 h-screen w-80 bg-tcc-azul-medium justify-center flex z-45 transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
         
                <div className="px-6 pb-6 pt-20 flex flex-col items-center relative w-full">
                    
                    <div className="py-3 rounded-xl bg-tcc-azul-darker w-70 flex justify-center items-center flex-row">
                        <Image 
                            src="https://picsum.photos/200/200?random=2" 
                            width={80} 
                            height={80} 
                            alt="Avatar"
                            className="rounded-full mr-2"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-2xl text-white">{nome}</h1>
                            <h2 className="text-xs text-tcc-azul-light">{email}</h2>
                        </div>
                    </div>

                    <div className="flex mt-15 flex-col relative gap-2 flex-1 w-full items-center">
                        {/* Se estiver deslogado, manda para o login, se não, para o perfil */}
                        <Link href={usuario ? "/usuario" : "/login"} className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row hover:brightness-110 transition-all">
                            <User size={50} className="text-white"/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl text-white">Perfil</h1>
                        </Link>
                        
                        <Link href="/agenda" className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row hover:brightness-110 transition-all">
                            <Calendar size={50} className="text-white"/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl text-white">Agenda</h1>
                        </Link>
                        
                        <Link href="/catalogo" className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row hover:brightness-110 transition-all">
                            <BookOpen size={50} className="text-white"/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl text-white">Catálogo</h1>
                        </Link>
                        
                        {/* 💡 Agora sim! Se for null, 'tipo' vira 'visitante' e não renderiza o botão do prestador nem quebra o app */}
                        {tipo === "prestador" && (
                            <Link href="/dashboard" className="py-3 px-5 rounded-xl bg-tcc-laranja w-70 flex justify-start items-center flex-row hover:brightness-110 transition-all">
                                <User size={50} className="text-white"/>
                                <h1 className="font-urbanist font-bold px-2 text-3xl text-white">Painel</h1>
                            </Link>
                        )}

                        <div className="mt-auto mb-10 py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row cursor-pointer hover:brightness-110 transition-all">
                            <Info size={50} className="text-white"/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl text-white">Sobre nós</h1>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}