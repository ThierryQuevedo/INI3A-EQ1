import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';

export default async function page() {
    await requireAdmin();
    const listaUsuarios = await db.select().from(usuarios);

    async function deleteUser(formData) {
        'use server';
        const id = formData.get('id');
        if (!id) return;

        await db.delete(usuarios).where(eq(usuarios.id, Number(id)));

        revalidatePath('/admin/usuarios');
    }

    return (
        <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                <h1 className="text-h4 font-bold text-foreground">Usuários</h1>

                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-x-auto">
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
                </div>
            </div>
        </div>
    );
}
