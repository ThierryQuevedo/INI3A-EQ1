import { db } from '@/db';
import { categorias } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

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
        <PageContainer size="md" className="py-10">
            <PageHeader eyebrow="Administração" title="Categorias" />

            <form action={criarCategoria} className="mb-6">
                <Card padding="sm" className="flex flex-col sm:flex-row gap-3">
                    <label htmlFor="nome-categoria" className="sr-only-status">Nome da categoria</label>
                    <Input
                        id="nome-categoria"
                        type="text"
                        name="nome"
                        placeholder="Nome da nova categoria"
                        required
                        className="flex-1 h-11"
                    />
                    <Button type="submit">Adicionar</Button>
                </Card>
            </form>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
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
            </Card>
        </PageContainer>
    );
}
