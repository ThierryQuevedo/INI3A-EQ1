"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Navegação horizontal no desktop (≥md) — substitui o hambúrguer. */
export default function HeaderDesktopNav({ usuario, className }) {
  const pathname = usePathname();
  const ehPrestador = usuario?.tipo === "prestador";

  const itens = [
    { href: "/", label: "Início" },
    { href: "/servicos", label: "Buscar profissionais" },
    ...(ehPrestador
      ? [
          { href: "/agendamentos", label: "Agenda" },
        ]
      : []),
  ];

  return (
    <nav aria-label="Navegação principal" className={cn("items-center gap-1", className)}>
      {itens.map(({ href, label }) => {
        const ativo = href === "/" ? pathname === "/" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              
              "px-3.5 h-11 inline-flex items-center rounded-full text-body-sm font-semibold transition-colors",
              ativo ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
