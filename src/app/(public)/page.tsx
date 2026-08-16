import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep text-tcc-neutro-100 font-sans antialiased">
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
            <Link href="/cadastro">
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
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10 border-t border-tcc-azul-darker/20">
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-tcc-azul-light font-urbanist">Categorias em Alta</h2>
          <p className="text-lg font-bold text-white mt-1">O que você está procurando hoje?</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {["Barbearia & Cabelo", "Estética & Manicure", "Aulas Particulares", "Manutenção & Mecânica", "Saúde & Bem-estar", "Consultorias"].map((category, idx) => (
            <Link href="/cadastro"
              key={idx}
              className="bg-tcc-azul-darker/20 hover:bg-white hover:text-tcc-azul-deep text-tcc-neutro-200 font-medium text-xs px-4 py-2.5 rounded-lg border border-tcc-azul-darker/60 transition-all cursor-pointer"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
