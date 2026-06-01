"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect garante que o código só rode no navegador, evitando erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-5"></div>; // Espaço reservado enquanto carrega
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition-all duration-200"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400" size={20} />
      ) : (
        <Moon className="text-blue-600" size={20} />
      )}
    </button>
  );
}