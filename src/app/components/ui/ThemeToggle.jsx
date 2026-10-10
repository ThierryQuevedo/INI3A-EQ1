"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/app/hooks/useMounted";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className, variant = "icon", onNavigate }) {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return <span className={cn("inline-block h-11 w-11", className)} aria-hidden="true" />;
  }

  const temaEscuro = resolvedTheme === "dark";

  function alternarTema() {
    setTheme(temaEscuro ? "light" : "dark");
    onNavigate?.();
  }

  if (variant === "menuitem") {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={alternarTema}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        {temaEscuro ? (
          <Sun size={18} className="text-primary" aria-hidden="true" />
        ) : (
          <Moon size={18} className="text-primary" aria-hidden="true" />
        )}
        <span className="text-body-sm font-semibold">{temaEscuro ? "Modo claro" : "Modo escuro"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={temaEscuro ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={cn(
        "h-11 w-11 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-fast ease-apple cursor-pointer",
        className
      )}
    >
      {temaEscuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
