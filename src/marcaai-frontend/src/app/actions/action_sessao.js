
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/index"; 
import { usuarios, sessoes } from "../../db/schema"; 

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_token")?.value;


  if (!sessionId) return null;

  try {
    const [result] = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          telefone: users.telefone,
        },
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId));

    if (!result) return null;

    const agora = new Date();
    if (result.session.expiresAt < agora) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      return null;
    }

    return result.user;
    
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    return null;
  }
}