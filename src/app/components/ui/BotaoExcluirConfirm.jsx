"use client";

import { useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

/** Para usar dentro de um <form action={...}> com um input hidden de id. */
export default function BotaoExcluirConfirm({ mensagem = "Tem certeza que deseja excluir?", children = "Excluir" }) {
  const [aberto, setAberto] = useState(false);
  const botaoRef = useRef(null);

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto(true)}
        className="bg-destructive/10 hover:bg-destructive hover:text-white text-destructive text-caption font-bold px-4 h-10 rounded-full transition-colors duration-200 cursor-pointer"
      >
        {children}
      </button>
      <ConfirmDialog
        open={aberto}
        onOpenChange={setAberto}
        title="Confirmar exclusão"
        description={mensagem}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={() => botaoRef.current?.form?.requestSubmit()}
      />
    </>
  );
}
