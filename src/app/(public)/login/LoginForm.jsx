"use client";

import { startTransition, useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth.actions";
import { useIrAposEntrar } from "@/lib/useIrAposEntrar";
import Link from 'next/link';
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png";
import Image from "next/image";
import { Eye, EyeOff, CalendarClock } from 'lucide-react';
import GoogleIcon from "../../components/Icons/GoogleIcons";
import AuthShowcase from "@/app/components/features/auth/AuthShowcase";
import { Card } from "@/app/components/ui/card";
import FormField from "@/app/components/ui/FormField";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

const estadoInicial = { erro: null, errosCampos: {} };

/**
 * A-08: quando a pessoa chega aqui vindo de "Agendar"/atalho de horário,
 * `pedido` traz o que ela estava marcando (lido no servidor do cookie de
 * destino, sem consumi-lo). O pedido — com dia e hora — é preservado: o
 * login (e-mail ou Google) e o cadastro voltam para a tela de agendar.
 * Google primeiro (não exige lembrar senha); e-mail logo abaixo.
 */
export default function LoginForm({ pedido = null, destinoSessao = null }) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, estadoInicial);
  const destino = state?.destino ?? destinoSessao;
  useIrAposEntrar(destino);
  // A navegação leva um instante: o botão segue ocupado até a página trocar.
  const entrando = isPending || !!destino;

  // Estados locais para os valores e validação do cliente
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errosLocais, setErrosLocais] = useState({});

  const erroGoogle = searchParams.get("erro") === "google";
  const mensagemErro = state?.erro || (erroGoogle ? "Falha ao autenticar com o Google." : null);

  // Unifica os erros do cliente (errosLocais) e do servidor (state)
  const erroEmail = errosLocais.email || state?.errosCampos?.email;
  const erroSenha = errosLocais.senha || state?.errosCampos?.senha;

  const validarCampos = (emailDigitado, senhaDigitada) => {
    const novosErros = {};

    if (!emailDigitado) {
      novosErros.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDigitado)) {
      novosErros.email = "Insira um e-mail válido.";
    }

    if (!senhaDigitada) {
      novosErros.senha = "Informe a senha.";
    } else if (senhaDigitada.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    setErrosLocais(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Valida o que está de fato no formulário: o preenchimento automático do
  // navegador (que uma guia anônima não tem) nem sempre avisa o estado do React.
  // O envio é manual porque, quando o React executa a `action` do <form>, ele
  // reseta os campos a cada tentativa.
  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const emailDigitado = String(dados.get("email") ?? "").trim();
    const senhaDigitada = String(dados.get("senha") ?? "");

    setEmail(emailDigitado);
    setSenha(senhaDigitada);
    if (!validarCampos(emailDigitado, senhaDigitada)) return;

    dados.set("email", emailDigitado);
    startTransition(() => formAction(dados));
  };

  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-[calc(100dvh-4rem)]">
      <AuthShowcase
        title="Encontre um profissional e agende na hora."
        className="max-lg:hidden lg:flex"
      />

      <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        {!pedido && (
          <Link href="/" className="w-48 mb-8 lg:hidden">
            <Image src={logotipo} alt="Marca Aí — página inicial" priority />
          </Link>
        )}

        <Card className="w-full max-w-md p-6 sm:p-8 md:p-10">
          <h1 className="text-h5 font-bold text-center text-foreground">
            {pedido ? "Entre para marcar seu horário" : "Entrar na conta Marca Aí"}
          </h1>

          {pedido && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-secondary text-secondary-foreground p-4">
              <CalendarClock size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-caption font-semibold">Seu pedido em andamento</p>
                <p className="text-body font-semibold break-words">{pedido.servicoNome}</p>
                <p className="text-body-sm">
                  com {pedido.prestadorNome}
                  {pedido.quando && (
                    <>
                      {" · "}
                      <span className="whitespace-nowrap">{pedido.quando}</span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-body-sm">Depois de entrar, você volta para a tela de marcar{pedido.quando ? ", com o horário já escolhido" : ""}.</p>
              </div>
            </div>
          )}

          {mensagemErro && (
            <div role="alert" className="mt-5 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
              {mensagemErro}
            </div>
          )}

          <Button asChild variant="outline" size="lg" className="w-full mt-6 h-toque-confortavel">
            <a href="/26-marcaai/api/auth/google">
              <GoogleIcon size={20} />
              <span>Entrar com Google</span>
            </a>
          </Button>

          <div className="my-6 flex items-center gap-3" role="separator" aria-label="ou entre com e-mail">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-body-sm text-muted-foreground" aria-hidden="true">ou entre com e-mail</span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>

          <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField id="email" label="E-mail" error={erroEmail}>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
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
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (errosLocais.senha) setErrosLocais((prev) => ({ ...prev, senha: undefined }));
                  }}
                  placeholder="Sua senha"
                  aria-invalid={erroSenha ? "true" : "false"}
                  className="pr-14"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-toque flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97] transition duracao-rapida cursor-pointer"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                  ) : (
                    <EyeOff className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={entrando}>
              {entrando ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-body-sm text-muted-foreground">
              Ainda não tem uma conta?{" "}
              <Link href="/cadastro" className="relative area-toque font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
                Cadastre-se
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
