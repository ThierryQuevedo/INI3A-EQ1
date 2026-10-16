/** "agora" / "5 min" / "3 h" / "2 d" / dd/mm — usado em listas de notificações. */
export function formatarTempoRelativo(data) {
  const diffMs = Date.now() - new Date(data).getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;

  const horas = Math.floor(min / 60);
  if (horas < 24) return `${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias} d`;

  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
