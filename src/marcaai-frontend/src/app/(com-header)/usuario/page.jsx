import Image from "next/image";
import { User, ArrowRight } from "lucide-react";
// Importações do seu backend mantidas exatamente como você pediu
import { db } from "../../../db/index"; 
import { users } from "../../../db/schema.js"; 
import { eq } from "drizzle-orm";
import { getSession, decodeJwtPayload } from "../../actions/auth";

export default async function PaginaUsuario() {
  // --- LÓGICA DE BACKEND MANTIDA ---
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);
  
  if (!usuario) {
    return <div className="text-center p-10 font-sans text-tcc-azul-darker">Usuário não encontrado.</div>;
  }

  // Tratamento da data (se não vier no JWT, coloca uma genérica no formato do wireframe)
  const dataCriacao = usuario.criadoEm 
    ? new Date(usuario.criadoEm).toLocaleDateString("pt-BR") 
    : "xx/xx/xxxx";

  return (
    <div className="min-h-screen bg-tcc-azul-deep font-sans flex flex-col">
      
      {/* SEÇÃO SUPERIOR (Azul Escuro com Avatar e Nome) */}
      <section className="bg-tcc-azul-darker pt-16 pb-24 flex flex-col items-center justify-center relative">
        {/* Ícone de Perfil igual ao Wireframe (Cinza claro com linha escura) */}
        <div className="bg-[#E5E5E5] w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-gray-300 shadow-md">
          <User size={48} className="text-gray-600" strokeWidth={1.5} />
        </div>
        
        {/* Nome do Usuário */}
        <h1 className="text-white text-3xl font-medium tracking-wide">
          {usuario.nome}
        </h1>
      </section>

      {/* SEÇÃO PRINCIPAL (Fundo Azul Profundo com o Card Sobreposto) */}
      <main className="flex-1 flex justify-center px-4 -mt-10 mb-10 z-10">
        
        {/* O Card Claro */}
        <div className="bg-tcc-azul-lightest rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl flex flex-col">
          
          <h2 className="text-center text-lg font-medium text-tcc-neutro-700 mb-8">
            Informações do usuário
          </h2>

          {/* Lista de Informações (As linhas pontilhadas) */}
          <div className="space-y-5 flex-1 px-2 md:px-6">
            <LinhaPontilhada label="Nome completo" valor="editar" isButton={true} />
            <LinhaPontilhada label="Email" valor="editar" isButton={true} />
            <LinhaPontilhada label="Senha" valor="editar" isButton={true} />
            <LinhaPontilhada label="Telefone" valor="editar" isButton={true} />
            
            {/* O "Lorem" do seu wireframe pode ser o Tipo de usuário ou CPF no banco real */}
            <LinhaPontilhada label="Tipo" valor={usuario.tipo || "ipsum"} isButton={false} />
          </div>

          {/* Rodapé do Card */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-sm text-tcc-neutro-700 font-medium">
              Conta criada em {dataCriacao}
            </p>
            
            <button className="bg-tcc-laranja hover:bg-tcc-laranja-dark text-tcc-neutro-700 font-medium py-2.5 px-6 rounded-md w-full max-w-[280px] flex justify-between items-center transition-all shadow-sm cursor-pointer">
              <span>Histórico</span>
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: Linha Pontilhada
 * Cria a estrutura "Texto ------ Botão" que se adapta à tela automaticamente.
 */
function LinhaPontilhada({ label, valor, isButton }) {
  return (
    <div className="flex items-end w-full gap-2">
      <span className="text-tcc-neutro-600 font-medium whitespace-nowrap text-base pb-0.5">
        {label}
      </span>
      
      {/* A mágica da linha pontilhada acontece aqui */}
      <div className="flex-grow border-b-[2.5px] border-dotted border-tcc-neutro-400 mb-1.5 opacity-60"></div>
      
      {isButton ? (
        <button className="bg-white hover:bg-gray-50 px-3 py-1 rounded text-tcc-neutro-600 text-sm shadow-sm cursor-pointer transition-colors border border-tcc-neutro-100">
          {valor}
        </button>
      ) : (
        <span className="bg-white px-3 py-1 rounded text-tcc-neutro-600 text-sm shadow-sm border border-tcc-neutro-100">
          {valor}
        </span>
      )}
    </div>
  );
}