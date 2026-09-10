"use client";

import { useState, useEffect, Suspense } from "react";
import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth.actions";
import Link from 'next/link';
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png";
import Image from "next/image";
import { Eye, EyeOff } from 'lucide-react';
import GoogleIcon from "../../components/Icons/GoogleIcons";

const estadoInicial = { erro: null, errosCampos: {} };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, estadoInicial);

  // Estados locais para os valores e validação do cliente
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errosLocais, setErrosLocais] = useState({});

  const erroGoogle = searchParams.get("erro") === "google";
  const mensagemErro = state?.erro || (erroGoogle ? "Falha ao autenticar com o Google." : null);

  // Unifica os erros do cliente (errosLocais) e do servidor (state)
  const erroEmail = errosLocais.email || state?.errosCampos?.email;
  const erroSenha = errosLocais.senha || state?.errosCampos?.senha;

  useEffect(() => {
    if (state?.sucesso && state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const validarCampos = () => {
    const novosErros = {};

    if (!email) {
      novosErros.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = "Insira um e-mail válido.";
    }

    if (!senha) {
      novosErros.senha = "Informe a senha.";
    } else if (senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    setErrosLocais(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    if (!validarCampos()) {
      e.preventDefault(); // Impede a execução do Server Action se houver erros no client
    }
  };

  return (
    <div className="min-h-screen bg-tcc-azul-deep flex flex-col items-center justify-center p-4 font-sans">
      <Link href="/" className="w-56 mb-10">
        <Image src={logotipo} alt="Marca Aí — página inicial" priority />
      </Link>

      <div className="bg-card rounded-2xl shadow-elevated max-w-xl w-full p-8 md:p-12 border border-border">
        <h1 className="text-h6 font-bold text-center text-foreground mb-8 tracking-wide">
          Entrar na conta Marca Aí
        </h1>

        {mensagemErro && (
          <div role="alert" className="mb-4 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
            {mensagemErro}
          </div>
        )}

        <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* CAMPO DE E-MAIL */}
          <div>
            <label htmlFor="email" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errosLocais.email) setErrosLocais((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="seuemail@exemplo.com"
              className={`w-full h-12 bg-background border rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 transition-all duration-200 ${
                erroEmail
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input focus-visible:ring-ring focus-visible:border-transparent"
              }`}
            />
            {erroEmail && (
              <p className="mt-1.5 text-body-sm text-destructive font-medium">
                {erroEmail}
              </p>
            )}
          </div>

          {/* CAMPO DE SENHA */}
          <div>
            <label htmlFor="senha" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (errosLocais.senha) setErrosLocais((prev) => ({ ...prev, senha: undefined }));
                }}
                placeholder="Sua senha"
                className={`w-full h-12 bg-background border rounded-xl px-4 pr-12 text-body text-foreground outline-none focus-visible:ring-2 transition-all duration-200 ${
                  erroSenha
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input focus-visible:ring-ring focus-visible:border-transparent"
                }`}
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
            {erroSenha && (
              <p className="mt-1.5 text-body-sm text-destructive font-medium">
                {erroSenha}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-13 bg-tcc-laranja hover:bg-tcc-laranja-dark text-white rounded-full py-3 text-body-lg font-bold transition-all duration-200 ease-apple active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-soft"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          href="/api/auth/google"
          className="w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-2xl font-bold border-2 border-input bg-card text-muted-foreground hover:border-tcc-neutro-300 transition-all duration-200 ease-apple cursor-pointer text-center"
        >
          <GoogleIcon size={20} />
          <span>Entrar com Google</span>
        </Link>

        <div className="text-center mt-6">
          <Link href="/cadastro" className="text-body-sm text-tcc-azul hover:underline font-medium">
            Ainda não tem uma conta? Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}