import Link from "next/link";
import logotipo from "../../public/images/Identidade visual marca ai/logotipo.png";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-tcc-azul-dark border-t border-tcc-azul-darker/60 text-tcc-neutro-300 font-sans text-xs transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
   
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-urbanist font-black text-sm tracking-tight text-white">
            <Image className="w-18" src={logotipo}/>
          </span>
          <span className="hidden sm:inline text-tcc-azul-darker/60">|</span>
          <p className="text-tcc-neutro-300/80">
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
        <nav className="flex items-center gap-6 font-medium">
          <Link 
            href="/sobre" 
            className="hover:text-white text-tcc-azul-lightest transition-colors cursor-pointer"
          >
            Sobre nós
          </Link>
          <Link 
            href="/termos" 
            className="hover:text-white text-tcc-azul-lightest transition-colors cursor-pointer"
          >
            Termos de uso
          </Link>
          <Link 
            href="/suporte" 
            className="hover:text-white text-tcc-azul-lightest transition-colors cursor-pointer"
          >
            Suporte
          </Link>
        </nav>

      </div>
    </footer>
  );
}