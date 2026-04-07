"use server";

import { db } from "../../db/index"; 
import { users, sessions } from "../../db/schema"; // Adicione 'sessions' aqui
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // Faltava importar o crypto nativo

export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  let loginSucesso = false;

  try {
    // 1. Busca o usuário
    const [user] = await db.select().from(users).where(eq(users.email, email));

    // 2. Verifica se existe
    if (!user) {
      return { error: "E-mail ou senha incorretos." };
    }

    // 3. Compara a senha (usando 'user.senha' conforme seu schema)
    const isPasswordValid = await bcrypt.compare(password, user.senha); 
    if (!isPasswordValid) {
      return { error: "E-mail ou senha incorretos." };
    }

    // --- SESSÃO REAL ---
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // 4. Salva a sessão no Banco
    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt: expiresAt,
    });

    // 5. Cria o Cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
    });

    loginSucesso = true;

  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Ocorreu um erro interno." };
  }

  // 6. Redireciona fora do try/catch
  if (loginSucesso) {
    redirect("/usuario");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_token")?.value;

  if (sessionId) {
    // Deleta do banco para invalidar de verdade
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    // Limpa o cookie
    cookieStore.delete("session_token");
  }

  redirect("/usuario/login");
}
