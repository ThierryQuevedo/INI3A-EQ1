"use client";

import { useState } from "react";
import { useActionState } from "react";
import { executarCadastro } from "../../actions/auth";
import Link from 'next/link';
import Image from "next/image";
import logotipo from "../../../../public/images/Identidade visual marca ai/logotipo.png"
import { Eye, EyeOff } from 'lucide-react';

const estadoInicial = { erro: null };

export default function CadastrarPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [categoria, setCategoria] = useState("cliente");
  const [state, formAction, isPending] = useActionState(executarCadastro, estadoInicial);

  return (
    <div className="min-h-screen bg-tcc-azul-deep flex flex-col items-center justify-center p-4 font-sans">
      <Link href="/" className="w-100 mb-10"><Image src={logotipo} alt="Logo"/></Link>
      <div className="bg-white rounded-lg shadow-sm max-w-xl w-full p-8 md:p-12 border border-tcc-neutro-100/30">
        
        <h1 className="text-2xl font-bold text-center text-tcc-neutro-700 mb-8 tracking-wide">
          Criar conta Marca Ai
        </h1>

        {state?.erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-md text-center">
            {state.erro}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          
          <input type="hidden" name="tipo" value={categoria} />

          <div>
            <label className="block text-tcc-neutro-500 text-base font-normal mb-1.5">
              Nome Completo
            </label>
            <input 
              type="text" 
              name="nome" 
              required
              className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-4 text-tcc-neutro-700 outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all" 
            />
          </div>

          <div>
            <label className="block text-tcc-neutro-500 text-base font-normal mb-1.5">
              E-mail
            </label>
            <input 
              type="email" 
              name="email" 
              required
              className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-4 text-tcc-neutro-700 outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all" 
            />
          </div>

          <div>
            <label className="block text-tcc-neutro-500 text-base font-normal mb-1.5">
              Telefone
            </label>
            <input 
              type="text" 
              name="cel" 
              required
              className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-4 text-tcc-neutro-700 outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all" 
            />
          </div>

          <div>
            <label className="block text-tcc-neutro-500 text-base font-normal mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="senha" 
                required
                className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-4 pr-12 text-tcc-neutro-700 outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all" 
              />
            
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tcc-neutro-400 hover:text-tcc-neutro-600 focus:outline-none"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 stroke-[1.5]" />
                ) : (
                  <EyeOff className="w-5 h-5 stroke-[1.5]" />
                )}
              </button>
            </div>
            
            <div className="mt-1.5">
              <Link href="/recuperar" className="text-xs text-tcc-azul hover:underline font-medium">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-tcc-neutro-700 text-base font-medium mb-3">
              Qual categoria você se enquadra?
            </label>
            
            <div className="flex justify-center gap-6">
              <button
                type="button"
                onClick={() => setCategoria("cliente")}
                className={`w-36 py-4 rounded-md font-bold text-lg border-2 transition-all cursor-pointer text-center ${
                  categoria === "cliente"
                    ? "border-tcc-azul bg-white text-tcc-azul-dark shadow-sm"
                    : "border-tcc-neutro-300 bg-white text-tcc-azul-dark/80 hover:border-tcc-neutro-400"
                }`}
              >
                Cliente
              </button>

              <button
                type="button"
                onClick={() => setCategoria("prestador")}
                className={`w-36 py-4 rounded-md font-bold text-lg border-2 transition-all cursor-pointer text-center ${
                  categoria === "prestador"
                    ? "border-tcc-azul bg-white text-tcc-azul-dark shadow-sm"
                    : "border-tcc-neutro-300 bg-white text-tcc-azul-dark/80 hover:border-tcc-neutro-400"
                }`}
              >
                Prestador
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-tcc-laranja hover:bg-tcc-laranja-dark text-white rounded-md py-3 text-lg font-bold transition-colors mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-tcc-azul hover:underline font-medium">
            Já tem uma conta? Faça login
          </Link>
        </div>

      </div>
    </div>
  );
}