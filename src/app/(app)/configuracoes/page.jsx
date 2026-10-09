import { User, ShieldCheck, Mail, Phone, Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { requireSession, atualizarNome, atualizarEmail, atualizarTelefone } from "@/app/actions/auth.actions";
import { atualizarEnderecoTextoAction } from "@/app/actions/prestadores.actions";
import ProfileAvatar from "@/app/components/features/perfil/ProfileAvatar";
import UserBannerUpload from "@/app/components/features/perfil/UserBannerUpload";
import LocationButton from "@/app/components/features/perfil/LocationButton";
import { Button } from "@/app/components/ui/button";
import CampoEditavel from "./CampoEditavel";
import CampoSenha from "./CampoSenha";
import LinhaCampo from "./LinhaCampo";

export const dynamic = 'force-dynamic';

const TIPO_LABEL = { prestador: 'Prestador de serviços', cliente: 'Cliente' };

export default async function PaginaConfiguracoes() {
  const usuario = await requireSession();

  const dataCriacao = usuario.criadoEm
    ? new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const inicialNome = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U";
  const ehPrestador = usuario.tipo === 'prestador';

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col antialiased">
      <section className="bg-surface pt-16 pb-28 flex flex-col items-center justify-center relative border-b border-border">
        <ProfileAvatar usuario={usuario} inicialNome={inicialNome} />

        <h1 className="text-foreground text-h4 font-bold font-display tracking-tight mt-4">
          {usuario.nome}
        </h1>

        <span className="mt-2 px-3 h-7 inline-flex items-center bg-muted text-muted-foreground text-caption font-semibold rounded-full">
          {TIPO_LABEL[usuario.tipo] || "Usuário"}
        </span>
      </section>

      <main className="flex-1 flex justify-center px-4 -mt-16 mb-16 z-10">
        <div className="bg-card rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-elevated flex flex-col border border-border">

          <div className="mb-8">
            <h2 className="text-h6 font-bold text-foreground tracking-tight mb-3">Banner do perfil</h2>
            <UserBannerUpload usuario={usuario} />
          </div>

          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h2 className="text-h6 font-bold text-foreground tracking-tight">
              Meus dados
            </h2>
            <p className="text-caption text-muted-foreground max-sm:hidden sm:block">Gerencie seu perfil</p>
          </div>
          <div className="space-y-5 flex-1">
            <CampoEditavel
              label="Nome completo"
              name="nome"
              valor={usuario.nome}
              action={atualizarNome}
              icon={<User size={16} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoEditavel
              label="E-mail principal"
              name="email"
              type="email"
              valor={usuario.email}
              action={atualizarEmail}
              icon={<Mail size={16} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoSenha
              label="Senha de acesso"
              icon={<ShieldCheck size={16} className="text-muted-foreground" aria-hidden="true" />}
            />
            <CampoEditavel
              label="Telefone / WhatsApp"
              name="telefone"
              valor={usuario.telefone}
              action={atualizarTelefone}
              icon={<Phone size={16} className="text-muted-foreground" aria-hidden="true" />}
            />
            <LinhaCampo
              icon={<ShieldCheck size={16} className="text-muted-foreground" aria-hidden="true" />}
              label="Nível de acesso"
              valor={TIPO_LABEL[usuario.tipo] || usuario.tipo}
            />
          </div>

          {ehPrestador && (
            <div className="mt-10 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h6 font-bold text-foreground tracking-tight">Localização do perfil público</h2>
              </div>
              <div className="space-y-5">
                <CampoEditavel
                  label="Endereço exibido no perfil"
                  name="enderecoTexto"
                  valor={usuario.enderecoTexto}
                  action={atualizarEnderecoTextoAction}
                  icon={<MapPin size={16} className="text-muted-foreground" aria-hidden="true" />}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-body-sm text-muted-foreground max-w-sm">
                    Usada para mostrar distância e a seção &quot;Perto de você&quot; para clientes.
                  </p>
                  <LocationButton />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {dataCriacao && (
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground font-medium">
                <Calendar size={16} className="text-muted-foreground" aria-hidden="true" />
                <span>Membro desde {dataCriacao}</span>
              </div>
            )}

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/${ehPrestador ? 'prestador' : 'cliente'}/${usuario.slug || usuario.id}`}>
                Ver perfil público <ExternalLink size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
