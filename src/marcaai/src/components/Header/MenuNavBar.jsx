"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from "next/link";
import ThemeToggle from './ThemeSwitch';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-700 text-white rounded-full p-2 hover:bg-red-500 hover:scale-105 transition-all duration-200"
      >
        <Menu size={24} />
      </button>

      {/* Container Principal - Controla a visibilidade total */}
      <div 
        className={`fixed inset-0 z-50 flex transition-all duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Overlay Escuro com fade */}
        <div 
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`} 
          onClick={() => setIsOpen(false)} 
        />

        {/* Menu Lateral com Slide */}
        <nav 
          className={`relative w-64 bg-white h-full p-5 shadow-xl transition-transform duration-300 ease-in-out transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button 
            onClick={() => setIsOpen(false)} 
            className="mb-5 p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
          
          <ThemeToggle/>

          <ul className="space-y-4 font-medium">
            <li onClick={() => setIsOpen(false)}>
              <Link href="/" className="block p-2 hover:bg-gray-200 rounded transition-all duration-200">Início</Link>
            </li>
            <li onClick={() => setIsOpen(false)}>
              <Link href="/agenda" className="block p-2 hover:bg-gray-200 rounded transition-all duration-200">Agenda</Link>
            </li>
            <li onClick={() => setIsOpen(false)}>
              <Link href="/usuario" className="block p-2 hover:bg-gray-200 rounded transition-all duration-200">Meu Usuário</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}