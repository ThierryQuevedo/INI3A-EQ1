import { db } from '../db/index.js';
import { servicos, categorias } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function buscarServico(req, res) {
  try {
    const { id } = req.params;
    const [servico] = await db.select()
      .from(servicos)
      .where(eq(servicos.id, Number(id)))
      .limit(1);
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado.' });
    return res.json(servico);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao buscar serviço.' });
  }
}

export async function listarServicos(req, res) {
  try {
    const lista = await db.select().from(servicos);
    return res.json(lista);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao listar serviços.' });
  }
}

export async function cadastrarServico(req, res) {
  try {
    const { nome, categoriaId, novaCategoria, preco, duracaoEstimada, descricao, prestadorId } = req.body;

    let idDaCategoriaFinal = categoriaId;

    if (!idDaCategoriaFinal && novaCategoria) {
      const [novaCategoriaCriada] = await db
        .insert(categorias)
        .values({ nome: novaCategoria })
        .returning({ id: categorias.id });
      idDaCategoriaFinal = novaCategoriaCriada.id;
    }

    const [novo] = await db.insert(servicos).values({
      nome,
      descricao,
      preco: preco.toString(),
      duracaoEstimada,
      categoriaId: idDaCategoriaFinal,
      prestadorId,
    }).returning();

    return res.status(201).json(novo);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao cadastrar serviço.' });
  }
}