import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import TelaStatus from "@/app/components/ui/TelaStatus";

export const metadata = { title: "Acesso restrito" };

// forbidden() de uma página: a pessoa está logada, mas a página é de outra
// conta (ex.: editar o serviço de outro prestador) ou exige administrador.
export default function AcessoRestrito() {
  return (
    <TelaStatus
      codigo={403}
      Icone={ShieldX}
      titulo="Você não tem acesso a esta página"
      acoes={
        <>
          <Button asChild size="lg">
            <Link href="/dashboard">Ir para o meu painel</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Ir para o início</Link>
          </Button>
        </>
      }
    >
      <p>Ela pertence a outra conta ou é restrita à administração do Marca Aí.</p>
      <p>Se você usa mais de uma conta, confira se entrou com o e-mail certo.</p>
    </TelaStatus>
  );
}
