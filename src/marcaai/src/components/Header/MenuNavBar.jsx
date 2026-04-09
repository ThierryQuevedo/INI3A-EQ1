"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from "next/link";
import ThemeToggle from './ThemeSwitch';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Botão Hambúrguer: Azul médio para destacar no Header escuro */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-tcc-azul-medium text-tcc-azul-deep rounded-full p-2 hover:bg-tcc-azul-light hover:scale-105 transition-all duration-200 shadow-sm"
      >
        <Menu size={24} />
      </button>

      {/* Container Principal */}
      <div 
        className={`fixed inset-0 z-50 flex transition-all duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Overlay Escuro: Usando um tom vindo do azul profundo para harmonia */}
        <div 
          className={`fixed inset-0 bg-tcc-azul-deep/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`} 
          onClick={() => setIsOpen(false)} 
        />

        {/* Menu Lateral */}
        <nav 
          className={`relative w-72 bg-white h-full p-6 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 rounded-full bg-tcc-neutro-100 text-tcc-neutro-600 hover:bg-tcc-azul-lightest hover:text-tcc-azul-dark transition-colors"
            >
              <X size={20} />
            </button>
            
            <ThemeToggle/>
          </div>

          <p className="text-xs font-bold text-tcc-neutro-400 uppercase tracking-widest mb-4 px-2">
            Navegação
          </p>
          
          <ul className="space-y-2 font-medium text-tcc-neutro-700">
            <li onClick={() => setIsOpen(false)}>
              <Link 
                href="/" 
                className="block p-3 text-tcc-azul-darker hover:bg-tcc-azul-lightest hover:text-tcc-azul-dark rounded-lg transition-all duration-200"
              >
                Início
              </Link>
            </li>
            <li onClick={() => setIsOpen(false)}>
              <Link 
                href="/agenda" 
                className="block p-3 text-tcc-azul-darker hover:bg-tcc-azul-lightest hover:text-tcc-azul-dark rounded-lg transition-all duration-200"
              >
                Agenda de Serviços
              </Link>
            </li>
            <li onClick={() => setIsOpen(false)}>
              <Link 
                href="/usuario" 
                className="block p-3 text-tcc-azul-darker hover:bg-tcc-azul-lightest hover:text-tcc-azul-dark rounded-lg transition-all duration-200"
              >
                Meu Perfil
              </Link>
            </li>
          </ul>
          
        </nav>
      </div>
    </div>
  );
}