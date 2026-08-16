import { createUploadthing } from "uploadthing/next";
import { revalidatePath } from "next/cache";
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
        const usuario = await getSession();
        if (!usuario) throw new Error("Sessão não encontrada");

        return { userEmail: usuario.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const fileUrl = file.ufsUrl || file.url;

        await db
            .update(usuarios)
            .set({ urlImagem: fileUrl })
            .where(eq(usuarios.email, metadata.userEmail));

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
        const usuario = await getSession();
        if (!usuario) throw new Error("Sessão não encontrada");

        return { userEmail: usuario.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const fileUrl = file.ufsUrl || file.url;

        await db
            .update(usuarios)
            .set({ urlBanner: fileUrl })
            .where(eq(usuarios.email, metadata.userEmail));

        revalidatePath("/configuracoes");
    })
};
