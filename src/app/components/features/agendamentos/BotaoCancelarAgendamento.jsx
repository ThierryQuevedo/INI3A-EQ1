"use client";

export default function BotaoCancelarAgendamento({ action }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmado = window.confirm("Tem certeza que deseja cancelar este agendamento?");
        if (!confirmado) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-caption font-bold px-4 h-9 rounded-full transition-colors duration-200 cursor-pointer"
      >
        Cancelar
      </button>
    </form>
  );
}
