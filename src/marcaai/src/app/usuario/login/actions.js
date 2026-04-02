"use server";
import { redirect } from 'next/navigation';

export async function cadastrarUsuario(formData) {
  const email = formData.get("email");

  console.log("Salvo com sucesso:", { email });
  
  // Remova o 'return { success: true }'
  // Se quiser redirecionar após salvar (como no Laravel):
  redirect('/usuario'); 
}