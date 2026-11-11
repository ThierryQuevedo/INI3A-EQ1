"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

// toast apos redirect que limpa o parametro da url
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
