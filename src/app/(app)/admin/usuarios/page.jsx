import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';

export default async function page({ searchParams }) {
    await requireAdmin();
    const { erro } = await searchParams;
    // Só as colunas da tabela: select() trazia hash de senha e as fotos em base64 de todos.
    const listaUsuarios = await db
        .select({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            telefone: usuarios.telefone,
            tipo: usuarios.tipo,
            criadoEm: usuarios.criadoEm,
        })
        .from(usuarios);

    async function deleteUser(formData) {
        'use server';
        // A action é um endpoint próprio: o requireAdmin() da página não a protege.
        const admin = await requireAdmin();
        const id = Number(formData.get('id'));
        if (!Number.isInteger(id) || id <= 0 || id === admin.id) return;

        try {
            await db.delete(usuarios).where(eq(usuarios.id, id));
        } catch (error) {
            // Usuário com agendamentos: a chave estrangeira impede a exclusão.
            if (error?.cause?.code === '23503' || error?.code === '23503') redirect('/admin/usuarios?erro=em-uso');
            throw error;
        }

        revalidatePath('/admin/usuarios');
    }

    return (
        <PageContainer size="xl" className="py-10">
            <PageHeader eyebrow="Administração" title="Usuários" />

            {erro === 'em-uso' && (
                <p role="alert" className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-body-sm text-foreground">
                    Este usuário tem agendamentos e não pode ser excluído.
                </p>
            )}

            <Card padding="none" className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">ID</th>
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Nome</th>
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Email</th>
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Telefone</th>
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Tipo</th>
                            <th scope="col" className="p-4 text-caption font-bold uppercase tracking-wide text-muted-foreground">Criado em</th>
                            <th scope="col" className="p-4"><span className="sr-only-status">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaUsuarios.map((user) => (
                            <tr key={user.id} className="border-b border-border last:border-0">
                                <td className="p-4 text-body-sm text-muted-foreground">{user.id}</td>
                                <td className="p-4 text-body-sm text-foreground font-medium">{user.nome}</td>
                                <td className="p-4 text-body-sm text-foreground">{user.email}</td>
                                <td className="p-4 text-body-sm text-foreground">{user.telefone}</td>
                                <td className="p-4 text-body-sm text-foreground capitalize">{user.tipo}</td>
                                <td className="p-4 text-body-sm text-muted-foreground whitespace-nowrap">{user.criadoEm.toLocaleString('pt-BR')}</td>
                                <td className="p-4 text-right">
                                    <form action={deleteUser} className="inline">
                                        <input type="hidden" name="id" value={user.id} />
                                        <BotaoExcluirConfirm mensagem={`Excluir o usuário "${user.nome}"? Esta ação não pode ser desfeita.`}>Excluir</BotaoExcluirConfirm>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </PageContainer>
    );
}
