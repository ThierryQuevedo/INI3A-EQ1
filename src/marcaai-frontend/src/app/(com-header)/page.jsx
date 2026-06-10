import CardServicoDestaque from "../../components/cards/CardServicoDestaque";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../../../@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import logoMarcaai from "../../../public/images/Identidade visual marca ai/marca ai resenheiro.png";
import { getSession, decodeJwtPayload } from "../actions/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const token = await getSession();
  const usuario = await decodeJwtPayload(token); 

  return (
    <div className="min-h-screen bg-tcc-azul-deep text-tcc-neutro-100 font-sans antialiased">
      
      <nav className="border-b border-tcc-azul-darker/30 bg-tcc-azul-deep sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center">
            <Image 
              src={logoMarcaai} 
              className="h-12 w-auto object-contain brightness-110" 
              alt="Marca Aí"
              priority
            />
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            {usuario ? (
              <span className="text-tcc-azul-light font-medium">
                Olá, <span className="text-white font-bold">{usuario.nome || usuario.name}</span>
              </span>
            ) : (
              <>
                <Link href="/login" className="text-tcc-neutro-300 hover:text-white transition-colors font-medium">
                  Entrar
                </Link>
                <Link href="/cadastrar">
                  <button className="bg-white text-tcc-azul-deep hover:bg-tcc-neutro-100 font-bold px-4 py-2.5 rounded-xl text-xs transition-all tracking-wide cursor-pointer">
                    Começar agora
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
          <div className="w-fit inline-flex items-center gap-2 bg-tcc-azul-darker/50 border border-tcc-azul-medium/5 px-3 py-1 rounded-full text-xs text-tcc-azul-light font-medium">
            <Sparkles size={12} className="text-tcc-laranja" /> O jeito mais esperto de agendar
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black font-urbanist tracking-tight text-white leading-[1.15]">
            Não perca tempo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcc-azul-medium to-tcc-laranja">
              esperando sua vez.
            </span>
          </h1>
          
          <p className="text-tcc-neutro-300 text-sm md:text-base max-w-xl leading-relaxed font-light">
            Encontre profissionais locais, veja os horários livres na agenda deles e marque seu atendimento instantaneamente. Sem ligações, sem mensagens intermináveis.
          </p>

          <div className="pt-2">
            <Link href="/catalogo">
              <button className="w-full sm:w-auto bg-tcc-laranja hover:bg-tcc-laranja-dark text-white font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-tcc-laranja/10 group cursor-pointer">
                Ver profissionais disponíveis 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 bg-tcc-azul-darker/40 p-8 rounded-2xl border border-tcc-azul-darker/5 relative overflow-hidden h-fit">
          <h3 className="text-white font-bold font-urbanist text-lg mb-2">Por que o Marca Aí?</h3>
          <p className="text-tcc-neutro-300 text-xs leading-relaxed font-light">
            Centralizamos barbeiros, manicures, mecânicos e professores em um único ecossistema. Você escolhe, agenda e recebe notificações automáticas para não esquecer o compromisso.
          </p>
          <div className="mt-6 flex gap-3 text-xs text-tcc-azul-light font-mono">
            <span>+300 Profissionais</span>
            <span>•</span>
            <span>Zero Taxas</span>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10 border-t border-tcc-azul-darker/20">
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-tcc-azul-light font-urbanist">Categorias em Alta</h2>
          <p className="text-lg font-bold text-white mt-1">O que você está procurando hoje?</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {["Barbearia & Cabelo", "Estética & Manicure", "Aulas Particulares", "Manutenção & Mecânica", "Saúde & Bem-estar", "Consultorias"].map((category, idx) => (
            <Link href="/catalogo"
              key={idx} 
              className="bg-tcc-azul-darker/20 hover:bg-white hover:text-tcc-azul-deep text-tcc-neutro-200 font-medium text-xs px-4 py-2.5 rounded-lg border border-tcc-azul-darker/60 transition-all cursor-pointer"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
      
      <section className="max-w-6xl mx-auto px-6 py-10 pb-24">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-tcc-laranja font-urbanist">Recomendados</h2>
            <p className="text-lg font-bold text-white mt-1">Destaques da comunidade</p>
          </div>
          <Link href="/catalogo" className="text-xs font-medium text-tcc-azul-light hover:underline transition-all">
            Ver catálogo completo
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Link key={i} href="/servicos/1">
              <CardServicoDestaque />
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}