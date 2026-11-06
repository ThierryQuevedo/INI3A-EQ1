"use client";

import { useEffect } from "react";
import { CAMINHO_BASE } from "./caminhoBase.js";

/**
 * Leva ao destino assim que login/cadastro devolvem `destino`.
 *
 * É uma navegação completa de propósito: a página nasce do zero já com o cookie
 * de sessão, sem depender do roteador do cliente, e o `replace` tira a tela de
 * login do botão "voltar". O `redirect()` do servidor não serve aqui: enviado
 * antes da hidratação, o Next responde com um endereço sem o basePath e a pessoa
 * cai fora da aplicação.
 */
export function useIrAposEntrar(destino) {
  useEffect(() => {
    if (destino) window.location.replace(`${CAMINHO_BASE}${destino}`);
  }, [destino]);
}
