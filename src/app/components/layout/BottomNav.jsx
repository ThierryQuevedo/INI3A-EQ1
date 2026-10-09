"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User, LayoutDashboard, CalendarClock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS_CLIENTE = [
  { href: "/", label: "Início", Icon: Home },
  { href: "/servicos", label: "Buscar", Icon: Search },
  { href: "/agendamentos", label: "Agenda", Icon: CalendarDays },
];

const ITENS_PRESTADOR = [
  { href: "/dashboard", label: "Painel", Icon: LayoutDashboard },
  { href: "/disponibilidades", label: "Agenda", Icon: CalendarClock },
  { href: "/servicos/novo", label: "Serviços", Icon: Briefcase },
];

/** Navegação principal no mobile (<md). Substitui o menu hambúrguer. */
export default function BottomNav({ usuario }) {
  const pathname = usePathname();
  const ehPrestador = usuario?.tipo === "prestador";

  const itens = [
    ...(ehPrestador ? ITENS_PRESTADOR : ITENS_CLIENTE),
    { href: usuario ? "/configuracoes" : "/login", label: "Perfil", Icon: User },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom,0px)]"
    >
      <ul className="grid grid-cols-4 h-16">
        {itens.map(({ href, label, Icon }) => {
          const ativo = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-caption font-medium transition-colors",
                  ativo ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={22} strokeWidth={ativo ? 2.25 : 2} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
