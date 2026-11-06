import { cookies } from "next/headers";
import { getSession } from "@/app/actions/auth.actions";
import { PROXIMO_COOKIE, caminhoInternoSeguro } from "@/lib/session";
import { destinoPadrao } from "@/lib/usuarios";
import CadastroForm from "./CadastroForm";

export const metadata = {
  title: "Criar conta",
};

/**
 * Quem já entrou não tem o que fazer aqui (ex.: voltou pelo histórico do navegador).
 * O formulário é quem navega: esta página também é renderizada de novo logo após
 * o cadastro, e um redirect() aqui passaria na frente do destino que a action devolveu.
 */
export default async function CadastroPage() {
  const usuario = await getSession();
  const cookieStore = await cookies();
  const destinoSessao = usuario
    ? caminhoInternoSeguro(cookieStore.get(PROXIMO_COOKIE)?.value) ?? destinoPadrao(usuario.tipo)
    : null;

  return <CadastroForm destinoSessao={destinoSessao} />;
}
