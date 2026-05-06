import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoriasButton from "../components/CategoriasButton";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../../@/components/ui/button";
import trabalho from "../../public/images/trabalho.jpg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">

      <main className="flex-1">
        <section 
          className="relative overflow-hidden flex flex-col lg:flex-row items-center px-[60px] gap-[60px] min-h-[calc(100vh-70px)] bg-[linear-gradient(135deg,#042F5F_0%,#0B4F98_60%,#185FA5_100%)]"
        >
          <div className="absolute top-[-60px] right-[10%] w-[350px] h-[350px] rounded-full bg-[rgba(249,115,22,0.1)] pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[220px] h-[220px] rounded-full bg-[rgba(255,255,255,0.04)] pointer-events-none" />

          <div className="flex-1 relative z-10 py-10 lg:py-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[rgba(249,115,22,0.15)] border border-[rgba(249,115,22,0.3)] rounded-[30px] px-4 py-1.5 mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#F97316"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-[12px] font-extrabold text-[#F97316] uppercase tracking-wider">Plataforma #1 de Serviços</span>
            </div>
            
            <h1 className="text-[42px] lg:text-[52px] font-extrabold text-white leading-[1.1] mb-5">
              Agende qualquer serviço<br />em <span className="text-[#F97316]">dois cliques</span>
            </h1>
            
            <p className="text-[18px] text-white/80 leading-relaxed mb-10 max-w-[500px] mx-auto lg:mx-0">
              Conectamos você a prestadores verificados em minutos. Sem ligações, sem espera, tudo pelo MarcaAí.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button className="bg-[#F97316] hover:bg-[#ea6a15] text-white h-auto py-3.5 px-8 text-base font-extrabold rounded-[10px] shadow-[0_10px_20px_rgba(249,115,22,0.3)] border-none">
                Agendar agora
              </Button>
              <Button variant="outline" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 h-auto py-3.5 px-8 text-base font-bold rounded-[10px]">
                Sou prestador
              </Button>
            </div>

            <div className="flex gap-12 mt-12 justify-center lg:justify-start">
              <div><div className="text-[28px] font-extrabold text-white">500+</div><div className="text-[13px] text-white/50 mt-1">Profissionais</div></div>
              <div><div className="text-[28px] font-extrabold text-white">4.8★</div><div className="text-[13px] text-white/50 mt-1">Avaliação média</div></div>
              <div><div className="text-[28px] font-extrabold text-white">12k+</div><div className="text-[13px] text-white/50 mt-1">Agendamentos</div></div>
            </div>
          </div>

          <div className="w-full max-w-[380px] shrink-0 relative z-10 self-end">
            <div className="bg-white rounded-t-[20px] p-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
              <div className="text-[15px] font-extrabold mb-[15px]">Destaques em Bauru</div>
              <div className="bg-[#f8f9fa] rounded-[10px] p-3 mb-[10px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#DCE5FE] flex items-center justify-center text-[#0B4F98] font-extrabold">BJ</div>
                <div className="flex-1">
                    <div className="text-[13px] font-bold">Barbearia do João</div>
                    <div className="text-[11px] text-[#888]">Corte e Barba • R$ 45,00</div>
                </div>
                <div className="text-[11px] font-bold text-[#F97316]">⭐ 4.9</div>
              </div>
              <div className="bg-[#f8f9fa] rounded-[10px] p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAF3DE] flex items-center justify-center text-[#3B6D11] font-extrabold">CS</div>
                <div className="flex-1">
                    <div className="text-[13px] font-bold">Clínica Saúde+</div>
                    <div className="text-[11px] text-[#888]">Fisioterapia • R$ 120,00</div>
                </div>
                <div className="text-[11px] font-bold text-[#F97316]">⭐ 5.0</div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-[60px] -mt-[40px] relative z-20">
          <div className="bg-white rounded-[16px] p-3 flex flex-col md:flex-row items-center gap-5 shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex-1 flex items-center gap-3 pl-2.5 w-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="text-[#aaa] text-[15px]">O que você está procurando?</span>
            </div>
            <div className="hidden md:block w-px h-[30px] bg-gray-100" />
            <div className="flex items-center gap-2 w-full md:w-[180px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B4F98" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="font-bold text-[14px]">Bauru, SP</span>
            </div>
            <Button className="bg-[#F97316] hover:bg-[#ea6a15] text-white rounded-[10px] py-3 px-[30px] w-full md:w-auto h-auto border-none font-bold">
              Buscar
            </Button>
          </div>
        </div>

        <section className="px-[60px] py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-[28px] font-extrabold text-[#111]">Explore por categoria</h2>
              <p className="text-[16px] text-[#888] mt-2">Tudo o que você precisa em um só lugar</p>
            </div>
            <span className="text-[#0B4F98] font-bold cursor-pointer hover:underline">Ver todas categorias →</span>
          </div>
          
          <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            <CategoriasButton link="/usuario/cadastro" texto="Beleza" />
            <CategoriasButton link="/usuario/cadastro" texto="Casa" />
            <CategoriasButton link="/usuario/cadastro" texto="Pet" />
            <CategoriasButton link="/usuario/cadastro" texto="TI" />
            <CategoriasButton link="/usuario/cadastro" texto="Saúde" />
            <CategoriasButton link="/usuario/cadastro" texto="Automotivo" />
          </nav>
        </section>

        <section className="bg-[#F8FAFC] px-[60px] py-20">
          <h2 className="text-center text-[32px] font-extrabold mb-[50px]">Como funciona o MarcaAí</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[16px] p-8 text-center border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#0B4F98] text-white text-base font-extrabold flex items-center justify-center mx-auto mb-5">1</div>
              <h3 className="font-bold mb-2.5">Busque o serviço</h3>
              <p className="text-[14px] text-[#666]">Encontre profissionais por categoria ou nome em sua cidade.</p>
            </div>
            <div className="bg-white rounded-[16px] p-8 text-center border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#0B4F98] text-white text-base font-extrabold flex items-center justify-center mx-auto mb-5">2</div>
              <h3 className="font-bold mb-2.5">Escolha a data</h3>
              <p className="text-[14px] text-[#666]">Veja a agenda em tempo real e escolha o melhor horário.</p>
            </div>
            <div className="bg-white rounded-[16px] p-8 text-center border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#0B4F98] text-white text-base font-extrabold flex items-center justify-center mx-auto mb-5">3</div>
              <h3 className="font-bold mb-2.5">Marque Aí</h3>
              <p className="text-[14px] text-[#666]">Confirme sem precisar ligar ou mandar mensagem.</p>
            </div>
            <div className="bg-white rounded-[16px] p-8 text-center border border-[#F97316]">
              <div className="w-10 h-10 rounded-full bg-[#F97316] text-white text-base font-extrabold flex items-center justify-center mx-auto mb-5">4</div>
              <h3 className="font-bold mb-2.5">Avalie</h3>
              <p className="text-[14px] text-[#666]">Diga como foi sua experiência e ajude a comunidade.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#0B4F98] px-[60px] py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-[600px] text-center lg:text-left">
            <h2 className="text-white text-[36px] font-extrabold mb-4">Você é prestador?</h2>
            <p className="text-white/70 text-[18px]">Organize sua agenda, reduza faltas e aumente seus clientes com nossa plataforma completa.</p>
          </div>
          <Button className="bg-white text-[#0B4F98] hover:bg-gray-100 h-auto py-[18px] px-10 text-base font-extrabold rounded-[10px] border-none">
            Começar agora gratuitamente
          </Button>
        </section>
      </main>


    </div>
  );
}