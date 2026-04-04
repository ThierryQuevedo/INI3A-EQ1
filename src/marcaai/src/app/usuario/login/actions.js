"use server";

import { db } from "../../../db"; 
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function cadastrarUsuario(formData) {
  const email = formData.get("email");

  // 1. Busca o usuário no banco
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    return { error: "Usuário não encontrado" };
  }

  const userId = String(user.id);

  // 2. CORREÇÃO AQUI: Use o await antes de chamar o .set()
  const cookieStore = await cookies(); 
  
  cookieStore.set("session_token", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, 
    path: "/",
  });

  // 3. Redireciona
  redirect("/usuario");
}

export async function encerrarSessao() {
  const cookieStore = await cookies();
  
  // Deleta o "carimbo" que identifica o usuário
  cookieStore.delete("session_token");

  // Manda o cara de volta para o login ou home
  redirect("/usuario/login");
}