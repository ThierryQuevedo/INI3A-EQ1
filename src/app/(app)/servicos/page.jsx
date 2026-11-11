export const metadata = { title: 'Buscar serviços' };

export const dynamic = 'force-dynamic';

import { eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios, categorias, prestadores } from '@/db/schema';
import ServicosClient from './ServicosClient';
import { comEstatisticas } from '@/lib/avaliacoes';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';
import { listarIdsFavoritos } from '@/app/actions/favoritos.actions';
import { listarCategorias } from '@/app/actions/servicos.actions';
import { imagemPublica } from '@/lib/imagemPublica';

export default async function ServicosPage() {
  // As três consultas não dependem uma da outra: vão juntas ao banco (A-02).
  const [dadosBrutos, listaCategorias, favoritos] = await Promise.all([
    db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      descricao: servicos.descricao,
      preco: servicos.preco,
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      duracaoEstimada: servicos.duracaoEstimada,
      prestadorId: servicos.prestadorId,
      prestadorSlug: usuarios.slug,
      nomeProfissional: usuarios.nome,
      categoriaId: servicos.categoriaId,
      nomeCategoria: categorias.nome,
      prestadorLatitude: prestadores.latitude,
      prestadorLongitude: prestadores.longitude,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .leftJoin(prestadores, eq(prestadores.usuarioId, servicos.prestadorId))
    .where(isNull(servicos.desativadoEm)),
    listarCategorias(),
    listarIdsFavoritos(),
  ]);

  // Estatísticas e próximo horário dependem só dos ids: também em paralelo.
  const [comEstat, proximosHorarios] = await Promise.all([
    comEstatisticas(dadosBrutos),
    calcularProximosHorariosLivres(dadosBrutos.map((s) => s.id)),
  ]);
  const favoritosSet = new Set(favoritos.servicos);
  const listaServicos = comEstat.map((s) => ({
    ...s,
    proximoHorario: proximosHorarios[s.id] ?? null,
    favoritoInicial: favoritosSet.has(s.id),
  }));

  return <ServicosClient servicos={listaServicos} categorias={listaCategorias} />;
}
