import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import ToastDeRetorno from '@/app/components/ui/ToastDeRetorno';
import { requireAdmin } from '@/app/actions/auth.actions';
import BotaoExcluirConfirm from '@/app/components/ui/BotaoExcluirConfirm';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import { FUSO } from '@/lib/formatoData';

export const metadata = { title: 'Usuários · Admin' };

// Retorno da exclusão: a action redireciona com ?aviso= e o toast explica.
const AVISOS = {
    excluido: { tipo: 'sucesso', mensagem: 'Usuário excluído.' },
    vinculado: {
        tipo: 'erro',
        mensagem: 'Este usuário tem agendamentos no histórico (como cliente ou nos serviços dele) e não pode ser excluído.',
    },
    proprio: { tipo: 'erro', mensagem: 'Você não pode excluir a sua própria conta por aqui.' },
};

export default async function page({ searchParams }) {
    await requireAdmin();
    const aviso = AVISOS[(await searchParams)?.aviso];
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
        // A action é um endpoint próprio: checar de novo, não basta a página ter checado.
        const admin = await requireAdmin();
        const id = Number(formData.get('id'));
        if (!id) return;
        if (id === admin.id) redirect('/admin/usuarios?aviso=proprio');

        let resultado = 'excluido';
        try {
            await db.delete(usuarios).where(eq(usuarios.id, id));
        } catch (erro) {
            // Agendamentos não são apagados em cascata (são histórico dos dois
            // lados): a chave estrangeira recusa, e o admin recebe o motivo.
            if (erro?.cause?.code !== '23503' && erro?.code !== '23503') throw erro;
            resultado = 'vinculado';
        }

        revalidatePath('/admin/usuarios');
        redirect(`/admin/usuarios?aviso=${resultado}`);
    }

    return (
        <PageContainer size="xl" className="py-10">
            <ToastDeRetorno mensagem={aviso?.mensagem} tipo={aviso?.tipo} />
            <PageHeader eyebrow="Administração" title="Usuários" />

            {/* relative: o rótulo sr-only (absolute) da coluna Ações precisa ficar preso aqui, senão alarga a página */}
            <Card padding="none" className="relative overflow-x-auto">
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
                                <td className="p-4 text-body-sm text-muted-foreground whitespace-nowrap">{user.criadoEm.toLocaleString('pt-BR', { timeZone: FUSO })}</td>
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
