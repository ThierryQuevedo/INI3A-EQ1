'use client';

import "./globals.css";
import { CAMINHO_BASE } from "@/lib/caminhoBase";

// so aparece quando o layout raiz falha
export default function ErroGlobal({ reset }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-background text-foreground">
        <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <p className="text-body-sm font-semibold text-primary">Erro 500</p>
          <h1 className="text-h4 font-bold">O Marca Aí está com um problema agora</h1>
          <p className="text-body text-muted-foreground max-w-md">
            Não foi culpa sua e nada do que você fez foi perdido. Tente de novo em instantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer"
            >
              Tentar de novo
            </button>
            {/* a e nao link pois o roteador pode ter falhado */}
            <a href={`${CAMINHO_BASE}/`} className="h-12 px-6 rounded-lg border border-border inline-flex items-center justify-center font-semibold">
              Ir para o início
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
