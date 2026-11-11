import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import TelaStatus from "@/app/components/ui/TelaStatus";

export const metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  return (
    <TelaStatus
      codigo={404}
      Icone={SearchX}
      titulo="Página não encontrada"
      acoes={
        <>
          <Button asChild size="lg">
            <Link href="/servicos">Buscar serviços</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Ir para o início</Link>
          </Button>
        </>
      }
    >
      <p>O endereço pode ter mudado ou o serviço não está mais disponível.</p>
    </TelaStatus>
  );
}
