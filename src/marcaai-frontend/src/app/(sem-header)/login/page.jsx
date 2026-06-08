import { executarLogin } from "../../actions/auth";
import Link from 'next/link';
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden font-sans">
      <div className="hidden md:flex w-1/2 bg-tcc-azul-dark p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-tcc-laranja-deep opacity-15"></div>
        <div className="absolute top-20 -left-10 w-48 h-48 rounded-full bg-white opacity-5"></div>



        <div className="relative z-10 max-w-sm">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
            Conecte-se a quem<br />você precisa.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Agende serviços de qualquer tipo, em qualquer lugar, de forma rápida e confiável.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-tcc-laranja/20 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FD953A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-white/90 text-sm">Cadastro gratuito para clientes e prestadores</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-tcc-laranja/20 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FD953A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-white/90 text-sm">Agendamentos em tempo real</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © 2026 MarcaAí · Todos os direitos reservados
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="max-w-sm w-full">
          <h1 className="text-3xl font-extrabold text-tcc-neutro-700 mb-2">Entrar na sua conta</h1>
          <div className="text-sm text-tcc-neutro-400 mb-8">
            Não tem conta? <Link href="cadastro" className="text-tcc-azul-dark font-bold hover:underline">Criar conta grátis</Link>
          </div>

          <button className="w-full border border-tcc-neutro-100 rounded-xl p-3.5 flex gap-3 items-center justify-center mb-6 hover:bg-tcc-neutro-100/30 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm text-tcc-neutro-600 font-semibold">Continuar com Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-tcc-neutro-100"></div>
            <span className="text-[10px] text-tcc-neutro-300 uppercase tracking-widest font-bold">ou e-mail</span>
            <div className="flex-1 h-px bg-tcc-neutro-100"></div>
          </div>

          <form action={executarLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-tcc-neutro-500 block mb-2">E-mail</label>
              <div className="border-2 border-tcc-azul-dark rounded-xl px-4 py-3 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B4F98" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" name="email" placeholder="seu@email.com" className="w-full text-sm outline-none bg-transparent text-tcc-neutro-700" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-tcc-neutro-500 block mb-2">Senha</label>
              <div className="border border-tcc-neutro-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94979E" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" name="senha" placeholder="••••••••" className="w-full text-sm outline-none bg-transparent text-tcc-neutro-700" />
                </div>
                <button type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94979E" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/recuperar" className="text-xs text-tcc-azul-dark font-bold hover:underline">Esqueci minha senha</Link>
            </div>

            <button type="submit" className="w-full bg-tcc-azul-dark text-white rounded-xl py-4 text-sm font-bold shadow-lg shadow-tcc-azul-dark/20 hover:bg-tcc-azul-dark/90 transition-all active:scale-[0.98]">
              Entrar
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2 py-3 bg-tcc-neutro-100/40 rounded-lg justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94979E" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[11px] text-tcc-neutro-400 font-medium">Ambiente 100% seguro e criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );
}