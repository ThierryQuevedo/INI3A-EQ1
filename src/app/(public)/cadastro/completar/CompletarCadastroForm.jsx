"use client";

import { useActionState, useState } from "react";
import { CalendarSearch, BriefcaseBusiness } from "lucide-react";
import { concluirCadastroGoogle } from "@/app/actions/auth.actions";
import { useIrAposEntrar } from "@/lib/useIrAposEntrar";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

const OPCOES = [
  {
    valor: "cliente",
    Icon: CalendarSearch,
    titulo: "Quero agendar serviços",
    descricao: "Encontre profissionais e marque um horário na hora.",
  },
  {
    valor: "prestador",
    Icon: BriefcaseBusiness,
    titulo: "Quero oferecer serviços",
    descricao: "Divulgue seu trabalho e receba agendamentos. Você também pode agendar com outros profissionais.",
  },
];

export default function CompletarCadastroForm({ nome, destinoSemPergunta = null }) {
  const [tipo, setTipo] = useState("cliente");
  const [estado, formAction, enviando] = useActionState(concluirCadastroGoogle, {});
  const destino = estado?.destino ?? destinoSemPergunta;
  useIrAposEntrar(destino);
  const salvando = enviando || !!destino;
  const primeiroNome = nome?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 min-h-[calc(100dvh-4rem)]">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-h5 font-bold text-center text-foreground">
          Falta pouco{primeiroNome ? `, ${primeiroNome}` : ""}!
        </h1>
        <p className="text-body-sm text-muted-foreground text-center mt-2">
          Como você quer usar o Marca Aí?
        </p>

        <form action={formAction} className="mt-6">
          <fieldset>
            <legend className="sr-only">Tipo de conta</legend>
            <div className="space-y-3">
              {OPCOES.map(({ valor, Icon, titulo, descricao }) => (
                <label
                  key={valor}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    tipo === valor ? "border-primary bg-secondary" : "border-border hover:bg-muted"
                  )}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={valor}
                    checked={tipo === valor}
                    onChange={() => setTipo(valor)}
                    className="sr-only"
                  />
                  <Icon size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-body font-semibold text-foreground">{titulo}</span>
                    <span className="block text-body-sm text-muted-foreground mt-0.5">{descricao}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" size="lg" className="w-full mt-6" disabled={salvando}>
            {salvando ? "Salvando..." : "Concluir cadastro"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
