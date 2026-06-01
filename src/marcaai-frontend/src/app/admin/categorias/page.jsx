import { db } from '../../../db';
import { categorias } from '../../../db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export default async function page(){
    const listaCategorias = await db.select().from(categorias);
    async function criarCategoria(formData) {
        'use server';
        const nome = formData.get('nome');
        if(!nome) return;
        await db.insert(categorias).values({nome});
        revalidatePath('/categorias');
        
    };
    async function deletarCategoria(formData) {
        'use server';
        const id = formData.get('id');
        if(!id) return;
        await db.delete(categorias).where(eq(categorias.id, Number(id)));
        revalidatePath('/categorias');
    }
return (
        <div className='flex' style={{ flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h1 className='text-center font-bold'>CRUD USUÁRIOS</h1>
            <form action={criarCategoria}>
                <input type="text" name="nome" placeholder='Nome' required />
                <button type='submit'>Adicionar</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Nome</th>
                    </tr>
                </thead>
                <tbody>
                    {listaCategorias.map((categoria) => (
                        <tr key={categoria.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{categoria.id}</td>
                            <td style={{ padding: '10px' }}>{categoria.nome}</td>
                            <td style={{ padding: '10px' }}>
                                <form action={deletarCategoria} style={{ margin: 0 }}>
                                    <input type="hidden" name='id' value={categoria.id} />
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