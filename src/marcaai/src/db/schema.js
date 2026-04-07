// src/db/schema.js
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').unique(),
  senha: text("password", { length: 255 }).notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // O "id_aleatorio" (Token longo e complexo)
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Se o usuário sumir, a sessão some
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});