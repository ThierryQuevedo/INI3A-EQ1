import Image from "next/image";
import { User, Calendar, BookOpen, Info } from "lucide-react";
import Link from "next/link";

export default function MenuSlide({ isOpen, onClose }) {
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
                            <h1 className="text-2xl text-white">Hugo Santos</h1>
                            <h2 className="text-xs text-tcc-azul-light">hugosantos@gmail.com</h2>
                        </div>
                    </div>

                    <div className="flex mt-15 flex-col relative gap-2 flex-1 w-full items-center">
                        <Link href="/usuario" className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row">
                            <User size={50}/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl">Perfil</h1>
                        </Link>
                        <Link href="/agenda" className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row">
                            <Calendar size={50}/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl">Agenda</h1>
                        </Link>
                        <Link href={'/catalogo'} className="py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row">
                            <BookOpen size={50}/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl">Catálogo</h1>
                        </Link>
                        <div className="mt-auto mb-10 py-3 px-5 rounded-xl bg-tcc-azul-dark w-70 flex justify-start items-center flex-row">
                            <Info size={50}/>
                            <h1 className="font-urbanist font-bold px-2 text-3xl">Sobre nós</h1>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}