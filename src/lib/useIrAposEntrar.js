"use client";

import { useEffect } from "react";
import { CAMINHO_BASE } from "./caminhoBase.js";

// navegacao completa ate o destino apos login
export function useIrAposEntrar(destino) {
  useEffect(() => {
    if (destino) window.location.replace(`${CAMINHO_BASE}${destino}`);
  }, [destino]);
}
