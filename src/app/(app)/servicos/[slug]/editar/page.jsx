import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { categorias as tabelaCategorias, servicos } from '@/db/schema';
import { requireSession } from '@/app/actions/auth.actions';
import { atualizarServico, listarCategorias } from '@/app/actions/servicos.actions';
import { imagemPublica } from '@/lib/imagemPublica';
import ServicoForm from '../../ServicoForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Editar serviço',
};

export default async function EditarServicoPage({ params }) {
  const usuario = await requireSession();
  const { slug } = await params;

  const [servico] = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      prestadorId: servicos.prestadorId,
      nome: servicos.nome,
      descricao: servicos.descricao,
      preco: servicos.preco,
      duracaoEstimada: servicos.duracaoEstimada,
      urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id),
      categoriaId: servicos.categoriaId,
      categoriaNome: tabelaCategorias.nome,
    })
    .from(servicos)
    .leftJoin(tabelaCategorias, eq(servicos.categoriaId, tabelaCategorias.id))
    .where(eq(servicos.slug, slug))
    .limit(1);

  if (!servico) notFound();
  if (servico.prestadorId !== usuario.id) redirect(`/servicos/${slug}`);

  const categoriasPadrao = await listarCategorias();

  // Serviço em categoria criada em "Outro": ela fica na lista para não ser
  // trocada sem querer ao salvar outro campo.
  const categorias = categoriasPadrao.some((c) => c.id === servico.categoriaId)
    ? categoriasPadrao
    : [...categoriasPadrao, { id: servico.categoriaId, nome: servico.categoriaNome }];

  const { prestadorId, categoriaNome, ...dadosDoFormulario } = servico;

  return (
    <ServicoForm
      categorias={categorias}
      action={atualizarServico}
      nomePrestador={usuario.nome}
      servico={dadosDoFormulario}
    />
  );
}
