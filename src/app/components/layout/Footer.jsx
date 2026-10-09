import Link from "next/link";
import logotipo from "../../../public/images/Identidade visual marca ai/logotipo.png";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border text-muted-foreground font-sans text-body-sm transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <Image className="w-18" src={logotipo} alt="Marca Aí" />
          <span className="max-sm:hidden sm:inline text-border">|</span>
          <p>
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
        <nav className="flex items-center gap-6 font-medium" aria-label="Links institucionais">
          <Link
            href="/sobre"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Sobre nós
          </Link>
          <Link
            href="/termos"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Termos de uso
          </Link>
          <Link
            href="/suporte"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Suporte
          </Link>
        </nav>

      </div>
    </footer>
  );
}
