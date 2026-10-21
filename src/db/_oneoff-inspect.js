import { db } from "./index.ts";
import { categorias, servicos } from "./schema.ts";

async function main() {
  const cats = await db.select().from(categorias);
  console.log("categorias:", cats);

  const servs = await db.select({
    id: servicos.id,
    nome: servicos.nome,
    preco: servicos.preco,
    categoriaId: servicos.categoriaId,
  }).from(servicos);
  console.log("servicos (preco desc):", servs.sort((a, b) => Number(b.preco) - Number(a.preco)).slice(0, 5));

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
