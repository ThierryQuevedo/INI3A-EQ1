import { createUploadthing } from "uploadthing/next";
import { revalidatePath } from "next/cache"; // 👈 IMPORTANTE para atualizar a tela
import { db } from "../../../db/index"; 
import { usuarios } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getSession, decodeJwtPayload } from "../../actions/auth";

const f = createUploadthing();

export const ourFileRouter = { 
    // --- FOTO DE PERFIL ---
    profilePicture: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1    
        }
    })
    .middleware(async () => {
        const cookie = await getSession();
        if (!cookie) throw new Error("Sessão não encontrada");

        const usuario = await decodeJwtPayload(cookie);
        if (!usuario || !usuario.email) throw new Error("Usuário não autorizado");

        return { userEmail: usuario.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const fileUrl = file.ufsUrl || file.url;
        
        await db
            .update(usuarios)
            .set({ urlImagem: fileUrl }) // Coluna da foto de perfil
            .where(eq(usuarios.email, metadata.userEmail));

        // Força a página de configurações a buscar os dados novos do banco
        revalidatePath("/configuracoes"); 
    }),

    // --- BANNER ---
    bannerImage: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1
        }
    })
    .middleware(async () => {
        const cookie = await getSession();
        if (!cookie) throw new Error("Sessão não encontrada");

        const usuario = await decodeJwtPayload(cookie);
        if (!usuario || !usuario.email) throw new Error("Usuário não autorizado");

        return { userEmail: usuario.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const fileUrl = file.ufsUrl || file.url;

        await db
            .update(usuarios)
            // ⚠️ ATENÇÃO: Troque 'urlBanner' pelo nome EXATO da coluna de banner no seu schema.
            // Se no seu schema for outro nome (ex: bannerUrl, url_banner), ajuste abaixo:
            .set({ urlBanner: fileUrl }) 
            .where(eq(usuarios.email, metadata.userEmail));

        // Força a página de configurações a atualizar os dados na tela
        revalidatePath("/configuracoes");
    })
};