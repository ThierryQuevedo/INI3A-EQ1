import { createUploadthing } from "uploadthing/next";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/actions/auth.actions";

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
        try {
            const usuario = await getSession();
            if (!usuario) throw new Error("Sessão não encontrada");

            return { userId: usuario.id };
        } catch (error) {
            console.error("Erro no middleware (profilePicture):", error);
            throw error;
        }
    })
    .onUploadComplete(async ({ metadata, file }) => {
        try {
            const fileUrl = file.ufsUrl || file.url;

            await db
                .update(usuarios)
                .set({ urlImagem: fileUrl })
                .where(eq(usuarios.id, metadata.userId));

            console.log("Foto de perfil atualizada no DB com sucesso:", fileUrl);
            return { uploadedBy: metadata.userId };
        } catch (error) {
            console.error("Erro no callback (profilePicture):", error);
            throw error; 
        }
    }),

    // --- BANNER ---
    bannerImage: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1
        }
    })
    .middleware(async () => {
        try {
            const usuario = await getSession();
            if (!usuario) throw new Error("Sessão não encontrada");

            return { userId: usuario.id };
        } catch (error) {
            console.error("Erro no middleware (bannerImage):", error);
            throw error;
        }
    })
    .onUploadComplete(async ({ metadata, file }) => {
        try {
            const fileUrl = file.ufsUrl || file.url;

            await db
                .update(usuarios)
                .set({ urlBanner: fileUrl })
                .where(eq(usuarios.id, metadata.userId));

            console.log("Banner atualizado no DB com sucesso:", fileUrl);
            return { uploadedBy: metadata.userId };
        } catch (error) {
            console.error("Erro no callback (bannerImage):", error);
            throw error;
        }
    })
};