"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth.actions";
import Link from 'next/link';
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png";
import Image from "next/image";
import { Eye, EyeOff } from 'lucide-react';

const estadoInicial = { erro: null };

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, estadoInicial);

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
          Entrar na conta Marca Aí
        </h1>

        {state?.erro && (
          <div role="alert" className="mb-4 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
            {state.erro}
          </div>
        )}

        <form action={formAction} className="space-y-5">

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
            <label htmlFor="senha" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                required
                placeholder="Sua senha"
                className="w-full h-12 bg-background border border-input rounded-xl px-4 pr-12 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-13 bg-tcc-laranja hover:bg-tcc-laranja-dark text-white rounded-full py-3 text-body-lg font-bold transition-all duration-200 ease-apple active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-soft"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/cadastro" className="text-body-sm text-tcc-azul hover:underline font-medium">
            Ainda não tem uma conta? Cadastre-se
          </Link>
        </div>

      </div>
    </div>
  );
}
