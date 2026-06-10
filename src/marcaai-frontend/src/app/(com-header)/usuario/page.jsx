import Image from "next/image";
import { User, ArrowRight, Pencil, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { db } from "../../../db/index"; 
import { users } from "../../../db/schema.js"; 
import { eq } from "drizzle-orm";
import { getSession, decodeJwtPayload } from "../../actions/auth";

export default async function PaginaUsuario() {

  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  
  if (!usuario) {
    return (
      <div className="min-h-screen bg-tcc-azul-deep flex items-center justify-center p-10 font-sans">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
          <p className="text-red-500 font-semibold text-lg mb-2">Acesso Negado</p>
          <p className="text-gray-600 text-sm">Usuário não encontrado ou sessão expirada.</p>
        </div>
      </div>
    );
  }

  const dataCriacao = usuario.criadoEm 
    ? new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' }) 
    : "xx/xx/xxxx";

  // Pega a inicial do nome para criar um avatar amigável
  const inicialNome = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-tcc-azul-deep font-sans flex flex-col antialiased selection:bg-tcc-laranja/30">
      
      {/* Seção do Topo / Header do Perfil */}
      <section className="bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep pt-16 pb-28 flex flex-col items-center justify-center relative">
        <div className="bg-gradient-to-tr from-tcc-laranja to-amber-400 w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-tcc-azul-deep relative group transition-transform duration-300 hover:scale-105">
          <span className="text-white text-4xl font-bold tracking-wider font-urbanist drop-shadow-md">
            {inicialNome}
          </span>
          <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200">
            <User size={16} className="text-tcc-azul-darker" />
          </div>
        </div>
        
        <h1 className="text-white text-3xl font-bold tracking-wide font-urbanist drop-shadow-sm">
          {usuario.nome}
        </h1>
        
        <span className="mt-2 px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold rounded-full uppercase tracking-wider border border-white/10">
          {usuario.tipo || "Usuário"}
        </span>
      </section>

      {/* Bloco de Informações Principal */}
      <main className="flex-1 flex justify-center px-4 -mt-16 mb-16 z-10">
        <div className="bg-white rounded-2xl p-6 md:p-10 w-full max-w-2xl shadow-2xl flex flex-col border border-gray-100">
          
          <div className="flex items-center justify-between border-b pb-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Meus Dados Cadastrais
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">Gerencie seu perfil</p>
          </div>

          {/* Lista de Informações Amigáveis */}
          <div className="space-y-6 flex-1">
            <LinhaPontilhada 
              label="Nome completo" 
              valor={usuario.nome} 
              isButton={true} 
              icon={<User size={18} className="text-gray-400" />}
            />
            <LinhaPontilhada 
              label="E-mail principal" 
              valor={usuario.email} 
              isButton={true} 
              icon={<Mail size={18} className="text-gray-400" />}
            />
            <LinhaPontilhada 
              label="Senha de acesso" 
              valor="••••••••••••" 
              isButton={true} 
              icon={<ShieldCheck size={18} className="text-gray-400" />}
            />
            <LinhaPontilhada 
              label="Telefone / WhatsApp" 
              valor={usuario.telefone || "Não cadastrado"} 
              isButton={true} 
              icon={<Phone size={18} className="text-gray-400" />}
            />
            <LinhaPontilhada 
              label="Nível de Acesso" 
              valor={usuario.tipo === 'prestador' ? 'Prestador de Serviços' : 'Cliente da Plataforma'} 
              isButton={false} 
              icon={<ShieldCheck size={18} className="text-gray-400" />}
            />
          </div>

          {/* Rodapé do Card e Ações adicionais */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium Order-2 sm:order-1">
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


function LinhaPontilhada({ label, valor, isButton, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end w-full gap-2 group">
      
      {/* Label com Ícone */}
      <div className="flex items-center gap-2 min-w-[160px]">
        {icon}
        <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">
          {label}
        </span>
      </div>
      
      {/* Divisor Visual Pontilhado */}
      <div className="hidden sm:block flex-grow border-b-2 border-dashed border-gray-200 mb-1 opacity-70 group-hover:border-gray-300 transition-colors"></div>
      
      {/* Área do Valor Real / Botão de Edição */}
      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
        <span className={`text-base font-medium ${valor === "Não cadastrado" ? "text-gray-400 italic" : "text-gray-800"}`}>
          {valor}
        </span>
        
        {isButton && (
          <button className="bg-gray-50 hover:bg-tcc-laranja hover:text-white p-2 rounded-lg text-gray-500 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 flex items-center justify-center" title={`Editar ${label}`}>
            <Pencil size={14} />
          </button>
        )}
      </div>
    </div>
  );
}