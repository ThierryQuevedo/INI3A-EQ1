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

const estadoInicial = { erro: null };

// Regex de validação
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aplica máscara (XX) XXXXX-XXXX (ou XXXX-XXXX se for fixo) enquanto o usuário digita
function mascararTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 2) {
    return digitos.replace(/^(\d*)/, "($1");
  }
  if (digitos.length <= 6) {
    return digitos.replace(/^(\d{2})(\d*)/, "($1) $2");
  }
  if (digitos.length <= 10) {
    // fixo: (XX) XXXX-XXXX
    return digitos.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  }
  // celular: (XX) XXXXX-XXXX
  return digitos.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3");
}

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

        <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">

          <input type="hidden" name="tipo" value={categoria} />

          <div>
            <label htmlFor="nome" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              value={campos.nome}
              onChange={handleChange}
              aria-invalid={!!erros.nome}
              aria-describedby={erros.nome ? "nome-erro" : undefined}
              placeholder="Ex: Maria da Silva"
              className={`w-full h-12 bg-background border rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200 ${
                erros.nome ? "border-destructive" : "border-input"
              }`}
            />
            {erros.nome && (
              <p id="nome-erro" className="mt-1 text-body-sm text-destructive">{erros.nome}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={campos.email}
              onChange={handleChange}
              aria-invalid={!!erros.email}
              aria-describedby={erros.email ? "email-erro" : undefined}
              placeholder="seuemail@exemplo.com"
              className={`w-full h-12 bg-background border rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200 ${
                erros.email ? "border-destructive" : "border-input"
              }`}
            />
            {erros.email && (
              <p id="email-erro" className="mt-1 text-body-sm text-destructive">{erros.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="cel" className="block text-muted-foreground text-body-sm font-medium mb-1.5">
              Telefone
            </label>
            <input
              id="cel"
              type="text"
              name="cel"
              inputMode="numeric"
              value={campos.cel}
              onChange={handleChange}
              aria-invalid={!!erros.cel}
              aria-describedby={erros.cel ? "cel-erro" : undefined}
              placeholder="(11) 91234-5678"
              maxLength={15}
              className={`w-full h-12 bg-background border rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200 ${
                erros.cel ? "border-destructive" : "border-input"
              }`}
            />
            {erros.cel && (
              <p id="cel-erro" className="mt-1 text-body-sm text-destructive">{erros.cel}</p>
            )}
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
                value={campos.senha}
                onChange={handleChange}
                aria-invalid={!!erros.senha}
                aria-describedby={erros.senha ? "senha-erro" : undefined}
                placeholder="Crie uma senha"
                className={`w-full h-12 bg-background border rounded-xl px-4 pr-12 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200 ${
                  erros.senha ? "border-destructive" : "border-input"
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
            {erros.senha && (
              <p id="senha-erro" className="mt-1 text-body-sm text-destructive">{erros.senha}</p>
            )}
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
                className={`w-36 h-14 rounded-2xl font-bold text-xl border-2 transition-all duration-200 ease-apple cursor-pointer text-center ${
                  categoria === "cliente"
                    ? "border-tcc-azul bg-secondary text-shadow-tcc-azul-medium shadow-soft"
                    : "border-input bg-card text-muted-foreground hover:border-tcc-neutro-300"
                }`}
              >
                Cliente
              </button>

              <button
                type="button"
                onClick={() => setCategoria("prestador")}
                aria-pressed={categoria === "prestador"}
                className={`w-36 h-14 rounded-2xl font-bold text-xl border-2 transition-all duration-200 ease-apple cursor-pointer text-center ${
                  categoria === "prestador"
                    ? "border-tcc-azul bg-secondary text-shadow-tcc-azul-medium shadow-soft"
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

        <Link
          href="/api/auth/google"
          className="w-full h-13 mt-4 flex items-center justify-center gap-2 rounded-2xl font-bold border-2 border-input bg-card text-muted-foreground hover:border-tcc-neutro-300 transition-all duration-200 ease-apple cursor-pointer text-center"
        >
          <GoogleIcon/>
          <span>Entrar com Google</span>
        </Link>

        <div className="text-center mt-6">
          <Link href="/login" className="text-body-sm text-tcc-azul hover:underline font-medium">
            Já tem uma conta? Faça login
          </Link>
        </div>

      </div>
    </div>
  );
}