"use server"

import { db } from "../../db/index";
import { usuarios } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { getSession, decodeJwtPayload } from "./auth";
import { revalidatePath } from "next/cache";

export async function atualizarFotoPerfil(urlImagem) {
  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);

  if (!usuario || !usuario.id) {
    throw new Error("Não autorizado");
  }

  await db.update(usuarios)
    .set({ urlImagem })
    .where(eq(usuarios.id, usuario.id));

  revalidatePath("/usuario"); 
}