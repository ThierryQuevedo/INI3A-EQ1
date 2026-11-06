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

/**
 * A-08: lê (sem consumir) o destino guardado por /api/auth/entrar. Se for a
 * tela de agendar, busca o nome do serviço e do profissional para o login
 * mostrar o pedido em andamento. Qualquer coisa inesperada → login comum.
 */
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
  // Quem já entrou não tem o que fazer aqui (ex.: voltou pelo histórico do navegador).
  // O formulário é quem navega: esta página também é renderizada de novo logo após
  // o login, e um redirect() aqui passaria na frente do destino que a action devolveu.
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
