
import { User, ArrowRight, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { requireSession, atualizarNome, atualizarEmail, atualizarTelefone } from "@/app/actions/auth.actions";
import AvatarUpload from "@/app/components/layout/AvatarUpload";
import BannerUpload from "./BannerUpload";
import CampoEditavel from "./CampoEditavel";
import CampoSenha from "./CampoSenha";

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

        <span className="mt-2 px-3 h-8 inline-flex items-center bg-white/10 backdrop-blur-md text-white/90 text-caption font-semibold rounded-full uppercase tracking-wider border border-white/10">
          {usuario.tipo || "Usuário"}
        </span>
      </section>

      <main className="flex-1 flex justify-center px-4 -mt-16 mb-16 z-10">
        <div className="bg-card rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-elevated flex flex-col border border-border">

          <div className="mb-8">
            <h2 className="text-h6 font-bold text-foreground tracking-tight mb-3">Banner do perfil</h2>
            <BannerUpload usuario={usuario} />
          </div>

          <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
            <h2 className="text-h6 font-bold text-foreground tracking-tight">
              Meus Dados
            </h2>
            <p className="text-caption text-muted-foreground hidden sm:block">Gerencie seu perfil</p>
          </div>
          <div className="space-y-6 flex-1">
            <CampoEditavel
              label="Nome completo"
              name="nome"
              valor={usuario.nome}
              action={atualizarNome}
              icon={<User size={18} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoEditavel
              label="E-mail principal"
              name="email"
              type="email"
              valor={usuario.email}
              action={atualizarEmail}
              icon={<Mail size={18} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoSenha
              label="Senha de acesso"
              icon={<ShieldCheck size={18} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoEditavel
              label="Telefone / WhatsApp"
              name="telefone"
              valor={usuario.telefone}
              action={atualizarTelefone}
              icon={<Phone size={18} className="text-muted-foreground" aria-hidden="true" />}
            />
            <LinhaPontilhada
              label="Nível de Acesso"
              valor={usuario.tipo === 'prestador' ? 'Prestador de Serviços' : 'Cliente da Plataforma'}
              icon={<ShieldCheck size={18} className="text-muted-foreground" aria-hidden="true" />}
            />
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground font-medium order-2 sm:order-1">
              <Calendar size={16} className="text-muted-foreground" aria-hidden="true" />
              <span>Membro desde {dataCriacao}</span>
            </div>

            <button
              disabled
              title="Em breve"
              aria-disabled="true"
              className="bg-tcc-laranja/50 text-white font-bold h-12 px-6 rounded-full w-full sm:w-auto sm:min-w-[200px] flex justify-between items-center order-1 sm:order-2 text-body-sm opacity-60 cursor-not-allowed"
            >
              <span>Ver Histórico</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

function LinhaPontilhada({ label, valor, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end w-full gap-2 group">

      <div className="flex items-center gap-2 min-w-[160px]">
        {icon}
        <span className="text-muted-foreground font-semibold text-body-sm tracking-wide uppercase">
          {label}
        </span>
      </div>

      <div className="hidden sm:block flex-grow border-b-2 border-dashed border-border mb-1 opacity-70 group-hover:border-tcc-neutro-300 transition-colors"></div>

      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
        <span className={`text-body font-medium ${valor === "Não cadastrado" ? "text-muted-foreground italic" : "text-foreground"}`}>
          {valor}
        </span>
      </div>
    </div>
  );
}
