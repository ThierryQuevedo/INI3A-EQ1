"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import MenuSlide from "./MenuSlide";

export default function MenuSlideWrapper({ usuario }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center">
            {/* Ícone de Hambúrguer visível no Header */}
            <button
                onClick={() => setIsOpen(true)}
                className="h-11 w-11 flex items-center justify-center rounded-full text-white hover:bg-white/10 hover:text-tcc-azul-light transition-colors duration-200 cursor-pointer"
                aria-label="Abrir menu"
                aria-expanded={isOpen}
            >
                <Menu size={26} aria-hidden="true" />
            </button>

            {/* Componente da gaveta lateral */}
            <MenuSlide
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                usuario={usuario}
            />
        </div>
    );
}
