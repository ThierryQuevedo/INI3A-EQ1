export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js'; // Verifique se o caminho para o db está correto
import { servicos, usuarios, categorias } from '../../../db/schema.js'; // Importe as 3 tabelas
import CatalogoClient from './CatalogoClient';

export default async function CataloguePage() {
    // Busca os serviços mesclando com o nome do profissional e categoria
    const dadosBrutos = await db
        .select({
            id: servicos.id,
            nomeServico: servicos.nome,
            preco: servicos.preco,
            duracao: servicos.duracaoEstimada,
            nomeProfissional: usuarios.nome, 
            nomeCategoria: categorias.nome,  
        })
        .from(servicos)
        .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
        .leftJoin(categorias, eq(servicos.categoriaId, categorias.id));

    // Repassa os dados para o componente visual
    return <CatalogoClient servicos={dadosBrutos} />;
}