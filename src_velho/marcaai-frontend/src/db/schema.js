import { pgTable, serial, text, timestamp, integer, decimal, boolean } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').unique(),
  senha: text("senha").notNull(), 
  tipo: text('tipo').notNull(), 
  admin: boolean('admin').default(false).notNull(), // Campo adicionado aqui
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

export const sessoes = pgTable('sessoes', {
  id: text('id').primaryKey(), 
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
});


export const prestadores = pgTable('prestadores', {
  usuarioId: integer('usuario_id')
    .primaryKey()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  biografia: text('biografia'),
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
    .references(() => usuarios.id),
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