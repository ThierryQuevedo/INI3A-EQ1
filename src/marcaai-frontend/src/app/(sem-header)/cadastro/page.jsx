import {executarCadastro} from '../../actions/auth'
import Link from 'next/link';

export default function CadastrarPage() {
  return (
    <div className="flex w-full h-screen overflow-hidden font-sans">
      <div className="hidden min-[900px]:flex w-[40%] bg-[#0B4F98] p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute -bottom-[70px] -right-[70px] w-[300px] h-[300px] rounded-full bg-[#F97316] opacity-15"></div>
        <div className="absolute top-[60px] -left-[50px] w-[200px] h-[200px] rounded-full bg-white opacity-5"></div>

        {/* Logo */}
        <div className="relative z-10">
<svg viewBox="0 0 180 52" width="160" height="46" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26" cy="26" r="22" fill="rgba(255,255,255,0.12)"/>
  <text 
    x="26" 
    y="36" 
    textAnchor="middle" 
    fontFamily="Nunito" 
    fontWeight="800" 
    fontSize="30" 
    fill="white"
  >
    M
  </text>
  <path 
    d="M 44 10 A 20 20 0 1 0 47 16" 
    fill="none" 
    stroke="#F97316" 
    strokeWidth="3" 
    strokeLinecap="round"
  />
  <polygon points="47,7 54,14 42,15" fill="#F97316"/>
  <text 
    x="60" 
    y="30" 
    fontFamily="Nunito" 
    fontWeight="700" 
    fontSize="20" 
    fill="white"
  >
    marca
  </text>
  <text 
    x="115" 
    y="30" 
    fontFamily="Nunito" 
    fontWeight="800" 
    fontSize="20" 
    fill="#F97316"
  >
    Aí
  </text>
</svg>
        </div>

        {/* Conteúdo Central Esquerdo */}
        <div className="relative z-10">
          <h1 className="text-[32px] font-extrabold leading-tight mb-4">Crie sua conta<br />em minutos.</h1>
          <p className="text-white/60 text-base mb-10 leading-relaxed">Preencha o formulário e comece a agendar ou oferecer serviços hoje mesmo.</p>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F97316]/25 text-[#F97316] flex items-center justify-center font-bold shrink-0">1</div>
              <div className="text-sm">
                <strong className="block text-white text-base">Escolha seu perfil</strong>
                <span className="text-white/80">Cliente ou prestador de serviços</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F97316]/25 text-[#F97316] flex items-center justify-center font-bold shrink-0">2</div>
              <div className="text-sm">
                <strong className="block text-white text-base">Seus dados</strong>
                <span className="text-white/80">Nome, e-mail e senha segura</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F97316]/25 text-[#F97316] flex items-center justify-center font-bold shrink-0">3</div>
              <div className="text-sm">
                <strong className="block text-white text-base">Complete o perfil</strong>
                <span className="text-white/80">Localização e preferências</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © 2026 MarcaAí · Todos os direitos reservados
        </div>
      </div>

      {/* PAINEL DIREITO - FORMULÁRIO */}
      <div className="w-full min-[900px]:w-[60%] bg-white p-8 flex flex-col justify-center items-center overflow-y-auto">
        <div className="max-w-[440px] w-full">
          
          {/* Barra de Progresso */}
          <div className="flex items-center w-full mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#0B4F98] text-white flex items-center justify-center text-xs font-bold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-[11px] font-bold text-[#0B4F98] mt-1">Perfil</span>
            </div>
            <div className="flex-1 h-[2px] bg-[#0B4F98] mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-[11px] font-bold text-[#F97316] mt-1">Dados</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-100 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-[11px] font-bold text-gray-400 mt-1">Finalizar</span>
            </div>
          </div>

          <h2 className="text-[26px] font-extrabold text-gray-900 mb-1">Crie sua conta</h2>
          <div className="text-sm text-gray-500 mb-6">
            Já tem conta? <Link href="/usuario/login" className="text-[#0B4F98] font-bold hover:underline">Entrar agora</Link>
          </div>

          {/* Seletor de Perfil */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="border-2 border-[#0B4F98] bg-[#f0f5ff] rounded-xl p-4 cursor-pointer text-center">
              <div className="text-sm font-bold text-[#0B4F98]">Cliente</div>
              <div className="text-[11px] text-gray-400">Quero contratar</div>
            </div>
            <div className="border-2 border-gray-100 rounded-xl p-4 cursor-pointer text-center">
              <div className="text-sm font-bold text-gray-700">Prestador</div>
              <div className="text-[11px] text-gray-400">Quero trabalhar</div>
            </div>
          </div>

          <form action={executarCadastro} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Nome Completo</label>
              <input 
                name="nome"
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#0B4F98] focus:border-2 outline-none"
                placeholder="Ex: Carlos Souza"
                required
              />
            </div>
            <div>
              <input type="text" name="tipo" placeholder="Tipo (cliente/prestador)" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">E-mail</label>
                <input 
                  name="email"
                  type="email" 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#0B4F98] focus:border-2 outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              {/* <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Telefone</label>
                <input 
                  name="cel"
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#0B4F98] focus:border-2 outline-none"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div> */}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Senha</label>
              <input 
                name="senha"
                type="password" 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#0B4F98] focus:border-2 outline-none"
                placeholder="********"
                required
              />
              {/* Indicador de força de senha */}
              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 bg-[#F97316] rounded-full"></div>
                <div className="h-1 flex-1 bg-[#F97316] rounded-full"></div>
                <div className="h-1 flex-1 bg-[#F97316] rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-start gap-3 my-5">
              <div className="w-5 h-5 border-2 border-[#0B4F98] rounded bg-[#0B4F98] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-[12px] text-gray-500 leading-tight">
                Li e aceito os <span className="text-[#0B4F98] font-bold cursor-pointer">Termos de Uso</span> e a <span className="text-[#0B4F98] font-bold cursor-pointer">Política de Privacidade</span>.
              </span>
            </div>

            <button 
              type="submit" 
              className="bg-[#0B4F98] hover:brightness-110 text-white font-extrabold w-full py-4 rounded-lg transition-all shadow-lg active:scale-[0.98]"
            >
              Criar minha conta
            </button>
          </form>

          <div className="flex items-center gap-2 justify-center mt-6 text-gray-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[11px] font-medium">Conexão segura SSL</span>
          </div>

        </div>
      </div>
    </div>
  );
}