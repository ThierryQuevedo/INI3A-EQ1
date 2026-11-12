import Link from "next/link";
import Image from "next/image";
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png";

// tela dos erros 404 e 403
export default function TelaStatus({ codigo, Icone, titulo, children, acoes }) {
  return (
    // section pois o appshell ja tem o main
    <section
      aria-labelledby="titulo-status"
      className="min-h-dvh [body:has(header)_&]:min-h-[70dvh] flex flex-col items-center justify-center gap-6 px-4 py-12 text-center"
    >
      <Link href="/" className="inline-flex p-1 rounded-lg hover:opacity-90 transition-opacity [body:has(header)_&]:hidden">
        <Image src={logotipo} alt="Marca Aí — página inicial" className="w-36 h-auto" priority />
      </Link>

      <div className="size-16 rounded-2xl bg-secondary text-primary flex items-center justify-center">
        <Icone size={28} aria-hidden="true" />
      </div>

      <div className="max-w-md">
        <p className="text-body-sm font-semibold text-primary mb-1">Erro {codigo}</p>
        <h1 id="titulo-status" className="text-h4 font-bold text-foreground">{titulo}</h1>
        <div className="text-body text-muted-foreground mt-2 space-y-2">{children}</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">{acoes}</div>

      <Link href="/suporte" className="inline-flex items-center min-h-toque px-2 text-body-sm font-semibold text-primary hover:underline underline-offset-4">
        Precisa de ajuda?
      </Link>
    </section>
  );
}
