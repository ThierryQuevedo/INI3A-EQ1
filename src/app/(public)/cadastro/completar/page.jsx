import { cookies } from "next/headers";
import { requireSession } from "@/app/actions/auth.actions";
import { COMPLETAR_CADASTRO_COOKIE } from "@/lib/session";
import { destinoPadrao } from "@/lib/usuarios";
import CompletarCadastroForm from "./CompletarCadastroForm";

export const metadata = {
  title: "Concluir cadastro",
};

// ultima etapa do cadastro google sem redirect aqui
export default async function CompletarCadastroPage() {
  const usuario = await requireSession();

  const cookieStore = await cookies();
  const destinoSemPergunta = cookieStore.has(COMPLETAR_CADASTRO_COOKIE) ? null : destinoPadrao(usuario.tipo);

  return <CompletarCadastroForm nome={usuario.nome} destinoSemPergunta={destinoSemPergunta} />;
}
