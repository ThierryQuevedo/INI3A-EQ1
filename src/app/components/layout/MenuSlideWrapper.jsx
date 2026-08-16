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
                className="p-2 text-white hover:text-tcc-azul-light transition-colors cursor-pointer"
                aria-label="Abrir Menu"
            >
                <Menu size={28} />
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
