export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js'; 
import { servicos, usuarios, categorias } from '../../../db/schema.js'; 
import CatalogoClient from './CatalogoClient';

export default async function CataloguePage() {
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

    return <CatalogoClient servicos={dadosBrutos} />;
}