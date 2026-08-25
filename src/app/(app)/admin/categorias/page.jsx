import { db } from '@/db';
import { categorias } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';

export default async function page(){
    await requireAdmin();
    const listaCategorias = await db.select().from(categorias);
    async function criarCategoria(formData) {
        'use server';
        const nome = formData.get('nome');
        if(!nome) return;
        await db.insert(categorias).values({nome});
        revalidatePath('/admin/categorias');

    };
    async function deletarCategoria(formData) {
        'use server';
        const id = formData.get('id');
        if(!id) return;
        await db.delete(categorias).where(eq(categorias.id, Number(id)));
        revalidatePath('/admin/categorias');
    }
return (
        <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <h1 className="text-h4 font-bold text-foreground">Categorias</h1>

                <form action={criarCategoria} className="bg-card rounded-2xl border border-border shadow-soft p-4 flex flex-col sm:flex-row gap-3">
                    <label htmlFor="nome-categoria" className="sr-only-status">Nome da categoria</label>
                    <input
                        id="nome-categoria"
                        type="text"
                        name="nome"
                        placeholder="Nome da nova categoria"
                        required
                        className="flex-1 h-11 bg-background border border-input rounded-xl px-4 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
                    />
                    <button type="submit" className="h-11 px-6 rounded-full bg-tcc-azul-dark hover:bg-tcc-azul-darker text-white font-bold text-body-sm transition-colors duration-200 cursor-pointer">
                        Adicionar
                    </button>
                </form>

                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">ID</th>
                                <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Nome</th>
                                <th scope="col" className="p-4"><span className="sr-only-status">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaCategorias.map((categoria) => (
                                <tr key={categoria.id} className="border-b border-border last:border-0">
                                    <td className="p-4 text-body-sm text-muted-foreground">{categoria.id}</td>
                                    <td className="p-4 text-body text-foreground font-medium">{categoria.nome}</td>
                                    <td className="p-4 text-right">
                                        <form action={deletarCategoria} className="inline">
                                            <input type="hidden" name="id" value={categoria.id} />
                                            <BotaoExcluirConfirm mensagem={`Excluir a categoria "${categoria.nome}"?`}>Excluir</BotaoExcluirConfirm>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
