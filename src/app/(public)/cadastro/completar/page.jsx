import { cookies } from "next/headers";
import { requireSession } from "@/app/actions/auth.actions";
import { COMPLETAR_CADASTRO_COOKIE } from "@/lib/session";
import { destinoPadrao } from "@/lib/usuarios";
import CompletarCadastroForm from "./CompletarCadastroForm";

export const metadata = {
  title: "Concluir cadastro",
};

/**
 * Última etapa do cadastro pelo Google: o callback só manda para cá quem acabou
 * de criar a conta. Fora disso, o formulário leva a pessoa embora; não é um
 * redirect() aqui porque a página é renderizada de novo logo após responder, e
 * ele passaria na frente do destino que a action devolveu.
 */
export default async function CompletarCadastroPage() {
  const usuario = await requireSession();

  const cookieStore = await cookies();
  const destinoSemPergunta = cookieStore.has(COMPLETAR_CADASTRO_COOKIE) ? null : destinoPadrao(usuario.tipo);

  return <CompletarCadastroForm nome={usuario.nome} destinoSemPergunta={destinoSemPergunta} />;
}
