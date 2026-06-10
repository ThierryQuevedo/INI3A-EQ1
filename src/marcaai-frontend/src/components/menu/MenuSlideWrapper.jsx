'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import MenuSlide from './MenuSlide';

// 💡 CORREÇÃO: Passamos a desestruturar a prop { usuario } que vem lá do Header
export default function MenuWrapper({ usuario }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div>
            <button 
                onClick={toggleMenu}
                aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                className={`bg-tcc-azul text-tcc-azul-deep rounded-full size-9 flex items-center justify-center hover:bg-tcc-azul-medium hover:scale-110 transition-all duration-200 shadow-inner focus:outline-none ${
                    isOpen ? "fixed left-10 top-3.5 z-50" : "relative z-30"
                }`}
            >
                {isOpen ? (
                    <X size={22} className='text-tcc-neutro-100 shrink-0'/>
                ) : (
                    <Menu size={22} className='text-tcc-neutro-100 shrink-0'/>
                )}
            </button>

            {/* 💡 CORREÇÃO: Repassando a propriedade 'usuario' para o MenuSlide interno */}
            <MenuSlide isOpen={isOpen} onClose={toggleMenu} usuario={usuario} />
        </div>
    );
}