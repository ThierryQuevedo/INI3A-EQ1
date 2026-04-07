"use server";

import bcrypt from "bcryptjs";
import { db } from "../../db/index"; 
import { users } from "../../db/schema";
import { redirect } from "next/navigation"; // Importação correta

export async function cadastrarAction(formData) {
  const nome = formData.get("nome");
  const email = formData.get("email");
  const cel = formData.get("cel");
  const rawPassword = formData.get("password");

  if (!nome || !email || !cel || !rawPassword) {
    return { error: "Dados inválidos" };
  }

  // Variável para controlar se o cadastro deu certo
  let cadastrouComSucesso = false;

  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // No Postgres, o .returning() funciona e você pode pegar o ID gerado
    const [newUser] = await db.insert(users).values({
      name: nome,      
      email: email,
      telefone: cel,   
      senha: hashedPassword, 
    }).returning({ id: users.id });

    if (newUser) cadastrouComSucesso = true;

  } catch (error) {
    console.error("ERRO NO BANCO:", error);
    return { error: "E-mail já cadastrado ou erro na conexão." };
  }

  // O REDIRECT PRECISA FICAR FORA DO TRY/CATCH
  if (cadastrouComSucesso) {
    redirect("/usuario/login");
  }
}