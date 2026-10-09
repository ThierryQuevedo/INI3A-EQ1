"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useMounted } from "@/app/hooks/useMounted";
import { cn } from "@/lib/utils";

// Nota: nunca combinar "hidden"/"flex"/"inline-flex" sem escopo com uma variante
// responsiva (ex. "md:flex") no mesmo elemento — há um bug de ordenação do Tailwind
// v4 + Turbopack neste projeto em que a camada base não-escopada pode vencer de um
// utilitário responsivo. Por isso `display` fica inteiramente a cargo do `className`
// (ex. "max-md:hidden md:inline-flex"), nunca com um valor base aqui.
export default function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <span className={cn("h-11 w-11", className)} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={isDark}
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full text-current/80 hover:bg-muted hover:text-current transition-colors duration-200 cursor-pointer",
        className
      )}
    >
      {isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
    </button>
  );
}
