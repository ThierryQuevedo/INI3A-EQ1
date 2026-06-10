
"use server";

import { db } from "../../db/index"; 
import { usuarios, sessoes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 

export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("senha");

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  let loginSucesso = false;

  try {

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return { error: "E-mail ou senha incorretos." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha); 
    if (!isPasswordValid) {
      return { error: "E-mail ou senha incorretos." };
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);


    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt: expiresAt,
    });


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


  if (loginSucesso) {
    redirect("/usuario");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_token")?.value;

  if (sessionId) {

    await db.delete(sessions).where(eq(sessions.id, sessionId));

    cookieStore.delete("session_token");
  }

  redirect("/usuario/login");
}
