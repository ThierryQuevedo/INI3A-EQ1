"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import BadgeNaoLidas from "@/app/components/features/mensagens/BadgeNaoLidas";


// criar e editar nao contam como busca
function estaAtivo(href, pathname) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/servicos") {
    const telaDoPrestador = pathname.startsWith("/servicos/novo") || /\/editar\/?$/.test(pathname);
    return pathname.startsWith(href) && !telaDoPrestador;
  }
  return pathname.startsWith(href);
}

export default function HeaderDesktopNav({ usuario, className }) {
  const pathname = usePathname();

  const itens = [
    { href: "/", label: "Início" },
    { href: "/servicos", label: "Buscar profissionais", labelCurto: "Buscar" },
    ...(usuario
      ? [
          { href: "/agendamentos", label: "Agenda" },
          { href: "/mensagens", label: "Chat" },
        ]
      : []),
  ];

  return (
    <nav aria-label="Navegação principal" className={cn("items-center gap-1", className)}>
      {itens.map(({ href, label, labelCurto }) => {
        const ativo = estaAtivo(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "relative px-3.5 h-11 inline-flex items-center whitespace-nowrap rounded-lg text-body-sm font-semibold transition-colors",
              ativo ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {labelCurto ? (
              <>
                <span className="xl:hidden">{labelCurto}</span>
                <span className="max-xl:hidden">{label}</span>
              </>
            ) : (
              label
            )}
            {href === "/mensagens" && <BadgeNaoLidas className="static ml-1.5 ring-0" />}
          </Link>
        );
      })}
    </nav>
  );
}
