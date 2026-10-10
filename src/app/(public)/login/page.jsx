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
import PageContainer from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import FormField from "@/app/components/ui/FormField";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

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
    <PageContainer size="sm" className="min-h-screen flex flex-col items-center justify-center py-16">
      <Link href="/" className="w-56 mb-10">
        <Image src={logotipo} alt="Marca Aí — página inicial" priority />
      </Link>

      <Card className="w-full shadow-elevated p-8 md:p-12">
        <h1 className="text-h6 font-bold text-center text-foreground mb-8 tracking-wide">
          Entrar na conta Marca Aí
        </h1>

        {mensagemErro && (
          <div role="alert" className="mb-4 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
            {mensagemErro}
          </div>
        )}

        <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField id="email" label="E-mail" error={erroEmail}>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errosLocais.email) setErrosLocais((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="seuemail@exemplo.com"
              aria-invalid={erroEmail ? "true" : "false"}
            />
          </FormField>

          <FormField id="senha" label="Senha" error={erroSenha}>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (errosLocais.senha) setErrosLocais((prev) => ({ ...prev, senha: undefined }));
                }}
                placeholder="Sua senha"
                aria-invalid={erroSenha ? "true" : "false"}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-fast cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                )}
              </button>
            </div>
          </FormField>

          <Button type="submit" variant="accent" size="lg" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button asChild variant="outline" size="lg" className="w-full mt-4">
          <Link href="/api/auth/google">
            <GoogleIcon size={20} />
            <span>Entrar com Google</span>
          </Link>
        </Button>

        <div className="text-center mt-6">
          <Link href="/cadastro" className="text-body-sm text-primary hover:underline font-medium">
            Ainda não tem uma conta? Cadastre-se
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
