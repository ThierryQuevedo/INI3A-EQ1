import { db } from '../../../../db';
import { usuarios } from '../../../../db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export default async function page() {
    const listaUsuarios = await db.select().from(usuarios);

    async function deleteUser(formData) {
        'use server';
        const id = formData.get('id');
        if (!id) return;

        await db.delete(usuarios).where(eq(usuarios.id, Number(id)));
        
        revalidatePath('/usuarios');
    }

    return (
        <div className='flex' style={{ flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h1 className='text-center font-bold'>CRUD USUÁRIOS</h1>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Nome</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Telefone</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Criado em</th>
                    </tr>
                </thead>
                <tbody>
                    {listaUsuarios.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{user.id}</td>
                            <td style={{ padding: '10px' }}>{user.nome}</td>
                            <td style={{ padding: '10px' }}>{user.email}</td>
                            <td style={{ padding: '10px' }}>{user.telefone}</td>
                            <td style={{ padding: '10px' }}>{user.tipo}</td>
                            <td>{user.criadoEm.toLocaleString('pt-BR')}</td>
                            <td style={{ padding: '10px' }}>
                                <form action={deleteUser} style={{ margin: 0 }}>
                                    <input type="hidden" name='id' value={user.id} />
                                    <button type='submit' className='bg-orange-400 px-4 py-2 transition-all rounded-lg hover:bg-orange-500 hover:text-white '>Excluir</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}