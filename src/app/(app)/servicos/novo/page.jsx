import { requireSession } from '@/app/actions/auth.actions';
import { cadastrarServico, listarCategorias } from '@/app/actions/servicos.actions';
import NovoServicoForm from './NovoServicoForm';

export default async function CadastroServicoPage() {
  const usuario = await requireSession();
  const categorias = await listarCategorias();

  return <NovoServicoForm categorias={categorias} action={cadastrarServico} nomePrestador={usuario.nome} />;
}
