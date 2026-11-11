import { Suspense } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { servicos, usuarios } from "@/db/schema";
import { getSession } from "@/app/actions/auth.actions";
import { PROXIMO_COOKIE, caminhoInternoSeguro } from "@/lib/session";
import { destinoPadrao } from "@/lib/usuarios";
import { ehChaveDiaValida, ehHoraValida, formatarDiaExtenso, formatarHora } from "@/lib/formatoData";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Entrar",
};

// le o destino sem consumir
async function lerPedidoEmAndamento() {
  const cookieStore = await cookies();
  const destino = caminhoInternoSeguro(cookieStore.get(PROXIMO_COOKIE)?.value);
  if (!destino || !destino.startsWith("/agendamentos/novo")) return null;

  const params = new URL(destino, "http://interno").searchParams;
  const servicoId = Number(params.get("servico"));
  if (!Number.isSafeInteger(servicoId) || servicoId <= 0) return null;

  try {
    const [servico] = await db
      .select({ nome: servicos.nome, prestadorNome: usuarios.nome })
      .from(servicos)
      .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
      .where(eq(servicos.id, servicoId))
      .limit(1);
    if (!servico) return null;

    const data = params.get("data");
    const hora = params.get("hora");
    let quando = null;
    if (ehChaveDiaValida(data)) {
      quando = formatarDiaExtenso(data, { relativo: true });
      if (ehHoraValida(hora)) quando += `, às ${formatarHora(hora)}`;
    }

    return { servicoNome: servico.nome, prestadorNome: servico.prestadorNome, quando };
  } catch {
    return null;
  }
}

export default async function LoginPage() {
  // sem redirect pois passaria na frente do destino da action
  const usuario = await getSession();
  const cookieStore = await cookies();
  const destinoSessao = usuario
    ? caminhoInternoSeguro(cookieStore.get(PROXIMO_COOKIE)?.value) ?? destinoPadrao(usuario.tipo)
    : null;

  const pedido = await lerPedidoEmAndamento();

  return (
    <Suspense>
      <LoginForm pedido={pedido} destinoSessao={destinoSessao} />
    </Suspense>
  );
}
