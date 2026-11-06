// Separa os slugs de serviço repetidos: o serviço mais antigo fica com o slug
// (as URLs já divulgadas continuam valendo) e os demais ganham o id no final.
//
//   npm run db:slugs:servicos              mostra o que mudaria, sem gravar
//   npm run db:slugs:servicos -- --aplicar grava as mudanças
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL não configurada no .env');
  process.exit(1);
}

const aplicar = process.argv.includes('--aplicar');
const sql = postgres(connectionString);

async function main() {
  const linhas = await sql`
    SELECT id, nome, slug FROM servicos
    WHERE slug IN (SELECT slug FROM servicos GROUP BY slug HAVING count(*) > 1)
    ORDER BY slug, id;
  `;

  if (linhas.length === 0) {
    console.log('Nenhum slug de serviço repetido.');
    return;
  }

  let slugAnterior = null;
  for (const servico of linhas) {
    if (servico.slug !== slugAnterior) {
      console.log(`Serviço #${servico.id} (${servico.nome}) mantém: ${servico.slug}`);
      slugAnterior = servico.slug;
      continue;
    }

    const novoSlug = `${servico.slug}-${servico.id}`;
    console.log(`Serviço #${servico.id} (${servico.nome}) -> ${novoSlug}`);
    if (aplicar) {
      await sql`UPDATE servicos SET slug = ${novoSlug} WHERE id = ${servico.id};`;
    }
  }

  console.log(aplicar ? 'Slugs atualizados.' : 'Nada foi gravado. Use --aplicar para gravar.');
}

main()
  .catch((err) => {
    console.error('Erro ao corrigir slugs:', err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
