import { db } from '@/db';
import { categorias } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

export default async function page({ searchParams }){
    await requireAdmin();
    const { erro } = await searchParams;
    const listaCategorias = await db.select().from(categorias);
    async function criarCategoria(formData) {
        'use server';
        // A action é um endpoint próprio: o requireAdmin() da página não a protege.
        await requireAdmin();
        const nome = String(formData.get('nome') ?? '').trim().slice(0, 60);
        if(!nome) return;
        await db.insert(categorias).values({nome}).onConflictDoNothing();
        revalidatePath('/admin/categorias');

    };
    async function deletarCategoria(formData) {
        'use server';
        await requireAdmin();
        const id = Number(formData.get('id'));
        if(!Number.isInteger(id) || id <= 0) return;
        try {
            await db.delete(categorias).where(eq(categorias.id, id));
        } catch (error) {
            // Categoria em uso por algum serviço: a chave estrangeira impede a exclusão.
            if (error?.cause?.code === '23503' || error?.code === '23503') redirect('/admin/categorias?erro=em-uso');
            throw error;
        }
        revalidatePath('/admin/categorias');
    }
return (
        <PageContainer size="md" className="py-10">
            <PageHeader eyebrow="Administração" title="Categorias" />

            {erro === 'em-uso' && (
                <p role="alert" className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-body-sm text-foreground">
                    Esta categoria está em uso por algum serviço e não pode ser excluída.
                </p>
            )}

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
