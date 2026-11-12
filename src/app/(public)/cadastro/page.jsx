import { cookies } from "next/headers";
import { getSession } from "@/app/actions/auth.actions";
import { PROXIMO_COOKIE, caminhoInternoSeguro } from "@/lib/session";
import { destinoPadrao } from "@/lib/usuarios";
import CadastroForm from "./CadastroForm";

export const metadata = {
  title: "Criar conta",
};

// sem redirect pois passaria na frente do destino da action
export default async function CadastroPage() {
  const usuario = await getSession();
  const cookieStore = await cookies();
  const destinoSessao = usuario
    ? caminhoInternoSeguro(cookieStore.get(PROXIMO_COOKIE)?.value) ?? destinoPadrao(usuario.tipo)
    : null;

  return <CadastroForm destinoSessao={destinoSessao} />;
}
