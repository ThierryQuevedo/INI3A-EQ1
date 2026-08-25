"use client";

export default function BotaoExcluirConfirm({ mensagem = "Tem certeza que deseja excluir?", children = "Excluir" }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(mensagem)) {
          e.preventDefault();
        }
      }}
      className="bg-destructive/10 hover:bg-destructive hover:text-white text-destructive text-caption font-bold px-4 h-10 rounded-full transition-colors duration-200 cursor-pointer"
    >
      {children}
    </button>
  );
}
