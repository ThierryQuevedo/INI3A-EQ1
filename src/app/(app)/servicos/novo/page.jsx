import { requireSession } from '@/app/actions/auth.actions';
import { cadastrarServico, listarCategorias } from '@/app/actions/servicos.actions';
import ServicoForm from '../ServicoForm';

export default async function CadastroServicoPage() {
  const usuario = await requireSession();
  const categorias = await listarCategorias();

  return <ServicoForm categorias={categorias} action={cadastrarServico} nomePrestador={usuario.nome} />;
}
