import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Caminho para onde você criou o seu arquivo de tabelas
  schema: './src/db/schema.js', 
  
  // Pasta onde o Drizzle vai salvar o histórico de mudanças do banco
  out: './drizzle',
  
  // Dialeto do banco de dados
  dialect: 'postgresql',
  
  // Dados de conexão que estão no seu arquivo .env
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});