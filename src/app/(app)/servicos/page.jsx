export const metadata = { title: 'Buscar serviços' };

export const dynamic = 'force-dynamic';

import { eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios, categorias } from '@/db/schema';
import ServicosClient from './ServicosClient';
import { comEstatisticas } from '@/lib/avaliacoes';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';
import { listarIdsFavoritos } from '@/app/actions/favoritos.actions';
import { listarCategorias } from '@/app/actions/servicos.actions';
import { imagemPublica } from '@/lib/imagemPublica';
import { getSession } from '@/app/actions/auth.actions';
import { coordenadaAproximada } from '@/lib/geo';

export default async function ServicosPage() {
  const [dadosBrutos, listaCategorias, favoritos, usuario] = await Promise.all([
    db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      descricao: servicos.descricao,
      preco: servicos.preco,
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      duracaoEstimada: servicos.duracaoEstimada,
      endereco: servicos.enderecoTexto,
      prestadorId: servicos.prestadorId,
      prestadorSlug: usuarios.slug,
      nomeProfissional: usuarios.nome,
      categoriaId: servicos.categoriaId,
      nomeCategoria: categorias.nome,
      prestadorLatitude: usuarios.latitude,
      prestadorLongitude: usuarios.longitude,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(isNull(servicos.desativadoEm)),
    listarCategorias(),
    listarIdsFavoritos(),
    getSession(),
  ]);

  const [comEstat, proximosHorarios] = await Promise.all([
    comEstatisticas(dadosBrutos),
    calcularProximosHorariosLivres(dadosBrutos.map((s) => s.id)),
  ]);
  const favoritosSet = new Set(favoritos.servicos);
  const listaServicos = comEstat.map((s) => ({
    ...s,
    prestadorLatitude: coordenadaAproximada(s.prestadorLatitude),
    prestadorLongitude: coordenadaAproximada(s.prestadorLongitude),
    proximoHorario: proximosHorarios[s.id] ?? null,
    favoritoInicial: favoritosSet.has(s.id),
  }));

  // endereco salvo nas configuracoes e a origem do "perto de mim"
  const minhaLocalizacao =
    usuario?.latitude != null && usuario?.longitude != null
      ? { lat: usuario.latitude, lng: usuario.longitude }
      : null;

  return <ServicosClient servicos={listaServicos} categorias={listaCategorias} minhaLocalizacao={minhaLocalizacao} />;
}
