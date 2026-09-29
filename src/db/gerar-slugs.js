import postgres from 'postgres';
import { gerarSlug } from '../lib/slug.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL não configurada no .env');
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  console.log('Verificando usuários sem slug...');
  const usuariosSemSlug = await sql`SELECT id, nome, slug FROM usuarios WHERE slug IS NULL OR slug = '';`;

  if (usuariosSemSlug.length === 0) {
    console.log('Todos os usuários já possuem slug válido!');
    await sql.end();
    return;
  }

  for (const u of usuariosSemSlug) {
    let baseSlug = gerarSlug(u.nome || 'usuario');
    if (!baseSlug) baseSlug = `usuario-${u.id}`;
    let finalSlug = baseSlug;

    const [existente] = await sql`SELECT id FROM usuarios WHERE slug = ${finalSlug} AND id != ${u.id};`;
    if (existente) {
      finalSlug = `${baseSlug}-${u.id}`;
    }

    await sql`UPDATE usuarios SET slug = ${finalSlug} WHERE id = ${u.id};`;
    console.log(`Usuário #${u.id} (${u.nome}) -> slug atribuído: ${finalSlug}`);
  }

  console.log('Slugs atualizados com sucesso!');
  await sql.end();
}

main().catch((err) => {
  console.error('Erro ao gerar slugs:', err);
  process.exit(1);
});
