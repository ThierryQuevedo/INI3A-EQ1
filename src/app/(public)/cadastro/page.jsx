"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cadastrar } from "@/app/actions/auth.actions";
import Link from 'next/link';
import Image from "next/image";
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png"
import { Eye, EyeOff } from 'lucide-react';
import GoogleIcon from "../../components/Icons/GoogleIcons";
import { formatarTelefone as mascararTelefone } from "@/lib/formatarTelefone";
import { Button } from "@/app/components/ui/button";
import PageContainer from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import FormField from "@/app/components/ui/FormField";
import { Input } from "@/app/components/ui/input";

const estadoInicial = { erro: null };

// Regex de validação
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCampos({ nome, email, cel, senha }) {
  const erros = {};

  const nomeTrim = nome.trim();
  if (!nomeTrim) {
    erros.nome = "Informe seu nome completo.";
  } else if (nomeTrim.split(/\s+/).length < 2) {
    erros.nome = "Informe nome e sobrenome.";
  } else if (nomeTrim.length < 3) {
    erros.nome = "Nome muito curto.";
  }

  if (!email.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (!REGEX_EMAIL.test(email.trim())) {
    erros.email = "E-mail inválido.";
  }

  const celDigitos = cel.replace(/\D/g, "");
  if (!celDigitos) {
    erros.cel = "Informe seu telefone.";
  } else if (celDigitos.length < 10 || celDigitos.length > 11) {
    erros.cel = "Telefone inválido. Ex: (11) 91234-5678";
  }

  if (!senha) {
    erros.senha = "Crie uma senha.";
  } else if (senha.length < 6) {
    erros.senha = "A senha deve ter pelo menos 6 caracteres.";
  }

  return erros;
}

export default function CadastrarPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [categoria, setCategoria] = useState("cliente");
  const [state, formAction, isPending] = useActionState(cadastrar, estadoInicial);

  const [campos, setCampos] = useState({ nome: "", email: "", cel: "", senha: "" });
  const [erros, setErros] = useState({});

  useEffect(() => {
    if (state?.sucesso && state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  function handleChange(e) {
    const { name, value } = e.target;
    const valorFinal = name === "cel" ? mascararTelefone(value) : value;

    setCampos((prev) => ({ ...prev, [name]: valorFinal }));
    setErros((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }

  function handleSubmit(e) {
    const novosErros = validarCampos(campos);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      e.preventDefault();
    }
  }

  return (
    <PageContainer size="sm" className="min-h-screen flex flex-col items-center justify-center py-16">
      <Link href="/" className="w-56 mb-10"><Image src={logotipo} alt="Marca Aí — página inicial"/></Link>
      <Card className="w-full shadow-elevated p-8 md:p-12">

        <h1 className="text-h6 font-bold text-center text-foreground mb-8 tracking-wide">
          Criar conta Marca Aí
        </h1>

        {state?.erro && (
          <div role="alert" className="mb-4 p-3 bg-destructive/10 border border-destructive/40 text-destructive text-body-sm rounded-lg text-center">
            {state.erro}
          </div>
        )}

        <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">

          <input type="hidden" name="tipo" value={categoria} />

          <FormField id="nome" label="Nome Completo" error={erros.nome}>
            <Input
              id="nome"
              type="text"
              name="nome"
              value={campos.nome}
              onChange={handleChange}
              aria-invalid={!!erros.nome}
              placeholder="Ex: Maria da Silva"
            />
          </FormField>

          <FormField id="email" label="E-mail" error={erros.email}>
            <Input
              id="email"
              type="email"
              name="email"
              value={campos.email}
              onChange={handleChange}
              aria-invalid={!!erros.email}
              placeholder="seuemail@exemplo.com"
            />
          </FormField>

          <FormField id="cel" label="Telefone" error={erros.cel}>
            <Input
              id="cel"
              type="text"
              name="cel"
              inputMode="numeric"
              value={campos.cel}
              onChange={handleChange}
              onKeyDown={(e) => {
                const permitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", "Enter"];
                if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              aria-invalid={!!erros.cel}
              placeholder="(11) 91234-5678"
              maxLength={15}
            />
          </FormField>

          <FormField id="senha" label="Senha" error={erros.senha}>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={campos.senha}
                onChange={handleChange}
                aria-invalid={!!erros.senha}
                placeholder="Crie uma senha"
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

          <div className="pt-2">
            <span className="block text-foreground text-body-sm font-semibold mb-3">
              Qual categoria você se enquadra?
            </span>

            <div className="flex justify-center gap-3" role="group" aria-label="Categoria de conta">
              <Button
                type="button"
                variant={categoria === "cliente" ? "default" : "outline"}
                size="lg"
                onClick={() => setCategoria("cliente")}
                aria-pressed={categoria === "cliente"}
                className="flex-1 max-w-40"
              >
                Cliente
              </Button>

              <Button
                type="button"
                variant={categoria === "prestador" ? "default" : "outline"}
                size="lg"
                onClick={() => setCategoria("prestador")}
                aria-pressed={categoria === "prestador"}
                className="flex-1 max-w-40"
              >
                Prestador
              </Button>
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <Button asChild variant="outline" size="lg" className="w-full mt-4">
          <Link href="/api/auth/google">
            <GoogleIcon size={20} />
            <span>Entrar com Google</span>
          </Link>
        </Button>

        <div className="text-center mt-6">
          <Link href="/login" className="text-body-sm text-primary hover:underline font-medium">
            Já tem uma conta? Faça login
          </Link>
        </div>

      </Card>
    </PageContainer>
  );
}
