"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

/**
 * Mostra um toast de sucesso depois de um redirect de server action
 * (ex.: `/dashboard?servico=criado`) e tira o parâmetro da URL, para o aviso
 * não voltar ao recarregar a página. A página decide a mensagem; sem mensagem, não faz nada.
 * `tipo="erro"` mostra o toast de erro (ex.: exclusão recusada no admin).
 */
export default function ToastDeRetorno({ mensagem, tipo = "sucesso" }) {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const jaMostrou = useRef(false);

  useEffect(() => {
    if (!mensagem || jaMostrou.current) return;
    jaMostrou.current = true;
    if (tipo === "erro") toast.error(mensagem);
    else toast.success(mensagem);
    router.replace(pathname, { scroll: false });
  }, [mensagem, tipo, pathname, router, toast]);

  return null;
}
