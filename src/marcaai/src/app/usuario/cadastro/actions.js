'use server' // Essencial para rodar no servidor

import { db } from "../../../db/index";
import { users } from "../../../db/schema.js";
import { redirect } from 'next/navigation';

export async function cadastrarUsuario(formData) {
  // 1. Captura os dados dos inputs através do atributo 'name'
  const nome = formData.get("nome");
  const email = formData.get("email");
  const senha = formData.get("password");

  // DICA DE TCC: No futuro, use uma lib como 'bcrypt' para criptografar a senha!
  // Por enquanto, vamos salvar o que vem do input.

  try {
    // 2. Insere no banco usando o Drizzle
    await db.insert(users).values({
      name: nome,
      email: email,
      // Se sua tabela no schema.js tiver o campo password, adicione aqui:
      // password: senha, 
    });

    console.log("Usuário cadastrado com sucesso!");

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    // Aqui você poderia tratar erros como "E-mail já cadastrado"
    return { error: "Falha ao criar conta." };
  }

  // 3. Redireciona o usuário após o cadastro
  redirect('/usuario/login'); 
}