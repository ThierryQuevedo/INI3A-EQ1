"use server";

export async function cadastrarUsuario(formData) {
  const nome = formData.get("nome");
  const email = formData.get("email");

  console.log("Salvo com sucesso:", { nome, email });
  
  // Remova o 'return { success: true }'
  // Se quiser redirecionar após salvar (como no Laravel):
  // redirect('/usuarios/lista'); 
}