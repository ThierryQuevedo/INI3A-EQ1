"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cadastrar } from "@/app/actions/auth.actions";
import Link from 'next/link';
import Image from "next/image";
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png"
import { Eye, EyeOff } from 'lucide-react';

const estadoInicial = { erro: null };

export default function CadastrarPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [categoria, setCategoria] = useState("cliente");
  const [state, formAction, isPending] = useActionState(cadastrar, estadoInicial);

  useEffect(() => {
    if (state?.sucesso && state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-tcc-azul-deep flex flex-col items-center justify-center p-4 font-sans">
      <Link href="/" className="w-56 mb-10"><Image src={logotipo} alt="Marca Aí — página inicial"/></Link>
      <div className="bg-card rounded-2xl shadow-elevated max-w-xl w-full p-8 md:p-12 border border-border">

        <h1 className="text-h6 font-bold text-center text-foreground mb-8 tracking-wide">
          Criar conta Marca Aí
        </h1>

        {state?.erro && (
          <div role="alert" className="mb-4 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
            {state.erro}
          </div>
        )}

        <form action={formAction} className="space-y-5">

          <input type="hidden" name="tipo" value={categoria} />

          <div>
            <label htmlFor="nome" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              required
              placeholder="Ex: Maria da Silva"
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="seuemail@exemplo.com"
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="cel" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Telefone
            </label>
            <input
              id="cel"
              type="text"
              name="cel"
              required
              placeholder="(11) 91234-5678"
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                required
                placeholder="Crie uma senha"
                className="w-full h-12 bg-background border border-input rounded-xl px-4 pr-12 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-foreground text-body-sm font-semibold mb-3">
              Qual categoria você se enquadra?
            </span>

            <div className="flex justify-center gap-4" role="group" aria-label="Categoria de conta">
              <button
                type="button"
                onClick={() => setCategoria("cliente")}
                aria-pressed={categoria === "cliente"}
                className={`w-36 h-14 rounded-2xl font-bold text-body-lg border-2 transition-all duration-200 ease-apple cursor-pointer text-center ${
                  categoria === "cliente"
                    ? "border-tcc-azul bg-secondary text-tcc-azul-dark shadow-soft"
                    : "border-input bg-card text-muted-foreground hover:border-tcc-neutro-300"
                }`}
              >
                Cliente
              </button>

              <button
                type="button"
                onClick={() => setCategoria("prestador")}
                aria-pressed={categoria === "prestador"}
                className={`w-36 h-14 rounded-2xl font-bold text-body-lg border-2 transition-all duration-200 ease-apple cursor-pointer text-center ${
                  categoria === "prestador"
                    ? "border-tcc-azul bg-secondary text-tcc-azul-dark shadow-soft"
                    : "border-input bg-card text-muted-foreground hover:border-tcc-neutro-300"
                }`}
              >
                Prestador
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-13 bg-tcc-laranja hover:bg-tcc-laranja-dark text-white rounded-full py-3 text-body-lg font-bold transition-all duration-200 ease-apple active:scale-[0.98] mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-soft"
          >
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-body-sm text-tcc-azul hover:underline font-medium">
            Já tem uma conta? Faça login
          </Link>
        </div>

      </div>
    </div>
  );
}
