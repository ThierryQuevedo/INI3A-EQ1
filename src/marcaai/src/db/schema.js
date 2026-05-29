
import { pgTable, serial, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core';



export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').unique(),
  senha: text("password").notNull(), 
  tipo: text('tipo').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), 
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), 
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});



export const clientes = pgTable('clientes', {

  usuarioId: integer('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  cpf: text('cpf').notNull().unique(),
});

export const prestadores = pgTable('prestadores', {
  usuarioId: integer('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  documento: text('documento').notNull().unique(), 
  biografia: text('biografia'),
  raioAtendimentoKm: integer('raio_atendimento_km').default(0).notNull(),
});



export const categorias = pgTable('categorias', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(), 
});

export const servicos = pgTable('servicos', {
  id: serial('id').primaryKey(),
  prestadorId: integer('prestador_id')
    .notNull()
    .references(() => prestadores.usuarioId, { onDelete: 'cascade' }),
  categoriaId: integer('categoria_id')
    .notNull()
    .references(() => categorias.id),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(), 
  duracaoEstimada: integer('duracao_estimada').notNull(), 
});



export const disponibilidades = pgTable('disponibilidades', {
  id: serial('id').primaryKey(),
  prestadorId: integer('prestador_id')
    .notNull()
    .references(() => prestadores.usuarioId, { onDelete: 'cascade' }),
  diaSemana: integer('dia_semana').notNull(), 
  horaInicio: text('hora_inicio').notNull(), 
  horaFim: text('hora_fim').notNull(), 
});

export const agendamentos = pgTable('agendamentos', {
  id: serial('id').primaryKey(),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.usuarioId),
  servicoId: integer('servico_id')
    .notNull()
    .references(() => servicos.id),
  dataHora: timestamp('data_hora').notNull(), 
  status: text('status').default('pendente').notNull(), 
});



export const avaliacoes = pgTable('avaliacoes', {
  id: serial('id').primaryKey(),
  agendamentoId: integer('agendamento_id')
    .notNull()
    .unique()
    .references(() => agendamentos.id, { onDelete: 'cascade' }),
  notaParaPrestador: integer('nota_para_prestador'), 
  comentarioPrestador: text('comentario_prestador'),
  notaParaCliente: integer('nota_para_cliente'), 
  comentarioCliente: text('comentario_cliente'),
});