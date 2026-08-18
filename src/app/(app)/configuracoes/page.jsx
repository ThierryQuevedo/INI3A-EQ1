import { ArrowRight, Calendar } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import AvatarUpload from "@/app/components/layout/AvatarUpload";
import BannerUpload from "./BannerUpload";
import DadosPerfilClient from "./DadosPerfilClient";

export const dynamic = 'force-dynamic';

export default async function PaginaConfiguracoes() {
  const usuario = await requireSession();

  const dataCriacao = usuario.criadoEm
    ? new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })
    : "xx/xx/xxxx";

  const inicialNome = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-tcc-azul-deep font-sans flex flex-col antialiased selection:bg-tcc-laranja/30">
      <section className="bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep pt-16 pb-28 flex flex-col items-center justify-center relative">

        <AvatarUpload usuario={usuario} inicialNome={inicialNome} />

        <h1 className="text-white text-3xl font-bold tracking-wide font-urbanist drop-shadow-sm">
          {usuario.nome}
        </h1>

        <span className="mt-2 px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold rounded-full uppercase tracking-wider border border-white/10">
          {usuario.tipo || "Usuário"}
        </span>
      </section>

      <main className="flex-1 flex justify-center px-4 -mt-16 mb-16 z-10">
        <div className="bg-white rounded-2xl p-6 md:p-10 w-full max-w-2xl shadow-2xl flex flex-col border border-gray-100">

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight mb-3">Banner do perfil</h2>
            <BannerUpload usuario={usuario} />
          </div>

          <div className="flex items-center justify-between border-b pb-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Meus Dados
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">Gerencie seu perfil</p>
          </div>
          <DadosPerfilClient usuario={usuario} />

          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium order-2 sm:order-1">
              <Calendar size={16} className="text-gray-400" />
              <span>Membro desde {dataCriacao}</span>
            </div>

            <button className="bg-tcc-laranja hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl w-full sm:w-auto sm:min-w-[200px] flex justify-between items-center transition-all shadow-md shadow-tcc-laranja/20 hover:shadow-lg active:scale-95 cursor-pointer order-1 sm:order-2 text-sm">
              <span>Ver Histórico</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
