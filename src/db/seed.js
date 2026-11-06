// src/db/seed.js
import { db } from "./index.ts";
import { categorias } from "./schema.ts";
import { CATEGORIAS_PADRAO } from "../lib/categorias.js";

async function main() {
  console.log("Populando o banco de dados com categorias padrão...");

  await db.insert(categorias).values(CATEGORIAS_PADRAO.map((nome) => ({ nome })));

  console.log("Banco de dados populado com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao rodar o seed:", err);
  process.exit(1);
});
