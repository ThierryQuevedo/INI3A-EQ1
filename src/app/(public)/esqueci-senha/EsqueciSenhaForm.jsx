"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, MailCheck } from "lucide-react";
import { solicitarCodigoSenha, redefinirSenha } from "@/app/actions/recuperarSenha.actions";
import AuthShowcase from "@/app/components/features/auth/AuthShowcase";
import { Card } from "@/app/components/ui/card";
import FormField from "@/app/components/ui/FormField";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

const estadoInicial = { erro: null, errosCampos: {} };

/**
 * Duas etapas na mesma tela: (1) e-mail → código enviado; (2) código + nova
 * senha. Depois de trocar, a pessoa entra de novo pelo login (todas as sessões
 * da conta são encerradas no servidor).
 */
export default function EsqueciSenhaForm() {
  const [pedido, pedirCodigo, pedindo] = useActionState(solicitarCodigoSenha, estadoInicial);
  const [troca, trocarSenha, trocando] = useActionState(redefinirSenha, estadoInicial);

  const [email, setEmail] = useState("");
  const [etapa, setEtapa] = useState("email"); // 'email' | 'codigo'
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aviso, setAviso] = useState(null);
  const campoCodigo = useRef(null);

  // Código pedido com sucesso → segunda etapa. Ajustado durante a renderização
  // (cada resposta nova da action é um objeto novo), sem setState em efeito.
  const [pedidoVisto, setPedidoVisto] = useState(pedido);
  if (pedido !== pedidoVisto) {
    setPedidoVisto(pedido);
    if (pedido?.sucesso) {
      setEtapa("codigo");
      setAviso(`Se existir uma conta com ${pedido.email}, enviamos um código de 6 números para ele. Confira também a caixa de spam.`);
    }
  }

  // O campo do código só existe depois que a etapa troca.
  useEffect(() => {
    if (etapa === "codigo") campoCodigo.current?.focus();
  }, [etapa]);

  const enviarEmail = (e) => {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    dados.set("email", String(dados.get("email") ?? "").trim());
    startTransition(() => pedirCodigo(dados));
  };

  const reenviarCodigo = () => {
    const dados = new FormData();
    dados.set("email", email.trim());
    startTransition(() => pedirCodigo(dados));
  };

  const enviarNovaSenha = (e) => {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    startTransition(() => trocarSenha(dados));
  };

  if (troca?.sucesso) {
    return (
      <Moldura>
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-h5 font-bold text-foreground">Senha redefinida</h1>
          <p className="mt-2 text-body-sm text-muted-foreground" role="status">
            Pronto! Use a nova senha para entrar. Por segurança, encerramos as sessões abertas em outros aparelhos.
          </p>
          <Button asChild size="lg" className="w-full mt-6">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </Moldura>
    );
  }

  const erroEtapa1 = etapa === "email" ? pedido?.erro : null;
  // Na segunda etapa, um reenvio com erro (ex.: limite) também precisa aparecer.
  const erroEtapa2 = etapa === "codigo" ? troca?.erro || (!pedido?.sucesso ? pedido?.erro : null) : null;

  return (
    <Moldura>
      <h1 className="text-h5 font-bold text-center text-foreground">Esqueci minha senha</h1>

      {etapa === "email" ? (
        <>
          <p className="mt-2 text-body-sm text-center text-muted-foreground">
            Informe o e-mail da sua conta. Vamos enviar um código para você criar uma senha nova.
          </p>

          {erroEtapa1 && <Alerta>{erroEtapa1}</Alerta>}

          <form action={pedirCodigo} onSubmit={enviarEmail} noValidate className="mt-6 space-y-5">
            <FormField id="email" label="E-mail" error={pedido?.errosCampos?.email}>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                aria-invalid={pedido?.errosCampos?.email ? "true" : "false"}
                required
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" disabled={pedindo}>
              {pedindo ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
        </>
      ) : (
        <>
          {aviso && (
            <div role="status" className="mt-5 flex items-start gap-3 rounded-xl bg-secondary text-secondary-foreground p-4">
              <MailCheck size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-body-sm">{aviso}</p>
            </div>
          )}

          {erroEtapa2 && <Alerta>{erroEtapa2}</Alerta>}

          <form action={trocarSenha} onSubmit={enviarNovaSenha} noValidate className="mt-6 space-y-5">
            <input type="hidden" name="email" value={email.trim()} />

            <FormField id="codigo" label="Código recebido" error={troca?.errosCampos?.codigo}>
              <Input
                ref={campoCodigo}
                id="codigo"
                name="codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                className="tracking-[0.3em] text-center font-semibold"
                aria-invalid={troca?.errosCampos?.codigo ? "true" : "false"}
                required
              />
            </FormField>

            <FormField id="novaSenha" label="Nova senha" hint="Pelo menos 6 caracteres." error={troca?.errosCampos?.novaSenha}>
              <div className="relative">
                <Input
                  id="novaSenha"
                  name="novaSenha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  className="pr-14"
                  aria-invalid={troca?.errosCampos?.novaSenha ? "true" : "false"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={mostrarSenha}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-toque flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97] transition duracao-rapida cursor-pointer"
                >
                  {mostrarSenha ? (
                    <Eye className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                  ) : (
                    <EyeOff className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <FormField id="confirmarSenha" label="Confirme a nova senha" error={troca?.errosCampos?.confirmarSenha}>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={troca?.errosCampos?.confirmarSenha ? "true" : "false"}
                required
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" disabled={trocando}>
              {trocando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-between gap-2 text-body-sm">
            <button
              type="button"
              onClick={reenviarCodigo}
              disabled={pedindo}
              className="relative area-toque font-semibold text-primary underline underline-offset-4 hover:text-primary-hover disabled:opacity-60 cursor-pointer"
            >
              {pedindo ? "Reenviando..." : "Reenviar código"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEtapa("email");
                setAviso(null);
              }}
              className="relative area-toque font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
            >
              Usar outro e-mail
            </button>
          </div>
        </>
      )}

      <p className="text-center mt-6 text-body-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/login" className="relative area-toque font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
          Voltar ao login
        </Link>
      </p>
    </Moldura>
  );
}

function Moldura({ children }) {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-[calc(100dvh-4rem)]">
      <AuthShowcase title="Recupere o acesso à sua conta." className="max-lg:hidden lg:flex" />
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <Card className="w-full max-w-md p-6 sm:p-8 md:p-10">{children}</Card>
      </div>
    </div>
  );
}

function Alerta({ children }) {
  return (
    <div role="alert" className="mt-5 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
      {children}
    </div>
  );
}
