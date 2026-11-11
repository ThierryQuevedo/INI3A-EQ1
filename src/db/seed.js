// abre a propria conexao pois o node nao resolve o import sem extensao
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categorias } from "./schema.ts";
import { CATEGORIAS_PADRAO } from "../lib/categorias.js";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada no .env");
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("Populando o banco de dados com categorias padrão...");

  // nome e unico entao nao duplica
  const inseridas = await db
    .insert(categorias)
    .values(CATEGORIAS_PADRAO.map((nome) => ({ nome })))
    .onConflictDoNothing({ target: categorias.nome })
    .returning({ id: categorias.id });

  console.log(`Banco de dados populado com sucesso! (${inseridas.length} nova(s) categoria(s))`);
  await client.end();
}

main().catch((err) => {
  console.error("Erro ao rodar o seed:", err);
  process.exit(1);
});
