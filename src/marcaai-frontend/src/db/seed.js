// src/db/seed.js
import { db } from "./index.js"; // Ajuste o caminho do seu objeto db
import { categorias } from "./schema.js"; // Ajuste o caminho do seu schema

async function main() {
  console.log("🌱 Populando o banco de dados com categorias padrão...");

  // Inserindo sem passar o "id", deixando o Postgres gerar automaticamente
  await db.insert(categorias).values([
    { nome: 'Design & Tecnologia' },
    { nome: 'Aulas & Consultoria' },
    { nome: 'Saúde & Bem-estar' },
    { nome: 'Manutenção & Reformas' }
  ]);

  console.log("✅ Banco de dados populado com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro ao rodar o seed:", err);
  process.exit(1);
});