import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, decimal, boolean, varchar, doublePrecision, uniqueIndex, index } from 'drizzle-orm/pg-core';

// espelha o banco: colunas, tabelas e indices criados direto nele estao aqui para o push nao apagar

export const usuarios = pgTable(
  'usuarios',
  {
    id: serial('id').primaryKey(),
    nome: text('nome').notNull(),
    slug: varchar('slug', { length: 255 }),
    email: text('email').notNull().unique(),
    telefone: text('telefone').unique(),
    urlImagem: text('url_imagem'),
    urlBanner: text('url_banner'),
    imagemVersao: varchar('imagem_versao', { length: 12 }),
    bannerVersao: varchar('banner_versao', { length: 12 }),
    senha: text('senha').notNull(),
    senhaDefinida: boolean('senha_definida').default(true).notNull(),
    emailVerificado: boolean('email_verificado').default(false).notNull(),
    tipo: text('tipo').notNull(),
    admin: boolean('admin').default(false).notNull(),
    // endereco do usuario (manual ou pelo gps); privado, so serve para o "perto de mim"
    enderecoTexto: text('endereco_texto'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (tabela) => [index('usuarios_slug_idx').on(tabela.slug)]
);

export const sessoes = pgTable(
  'sessoes',
  {
    id: text('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  },
  (tabela) => [index('sessoes_usuario_idx').on(tabela.usuarioId)]
);

export const prestadores = pgTable('prestadores', {
  usuarioId: integer('usuario_id')
    .primaryKey()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  biografia: text('biografia'),
  documento: text('documento'),
  raioAtendimentoKm: integer('raio_atendimento_km'),
  // legado: o endereco agora fica em usuarios; mantidas para o push nao apagar os dados
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  enderecoTexto: text('endereco_texto'),
  subcontaId: text('subconta_id'),
});

export const categorias = pgTable('categorias', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(),
});

export const servicos = pgTable(
  'servicos',
  {
    id: serial('id').primaryKey(),
    prestadorId: integer('prestador_id')
      .notNull()
      .references(() => prestadores.usuarioId, { onDelete: 'cascade' }),
    categoriaId: integer('categoria_id')
      .notNull()
      .references(() => categorias.id),
    nome: text('nome').notNull(),
    urlImagem: text('url_imagem'),
    imagemVersao: varchar('imagem_versao', { length: 12 }),
    slug: varchar('slug', { length: 255 }),
    descricao: text('descricao'),
    preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
    duracaoEstimada: integer('duracao_estimada').notNull(),
    // preenchido quer dizer desativado
    desativadoEm: timestamp('desativado_em'),
    localAtendimento: text('local_atendimento').default('perfil').notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    // endereco do atendimento: obrigatorio no formulario mas nulo nos servicos antigos
    enderecoTexto: text('endereco_texto'),
  },
  (tabela) => [
    index('servicos_categoria_idx').on(tabela.categoriaId),
    index('servicos_prestador_idx').on(tabela.prestadorId),
    index('servicos_slug_idx').on(tabela.slug),
  ]
);

export const disponibilidades = pgTable(
  'disponibilidades',
  {
    id: serial('id').primaryKey(),
    prestadorId: integer('prestador_id')
      .notNull()
      .references(() => prestadores.usuarioId, { onDelete: 'cascade' }),
    servicoId: integer('servico_id')
      .notNull()
      .references(() => servicos.id, { onDelete: 'cascade' }),
    diaSemana: integer('dia_semana').notNull(),
    horaInicio: text('hora_inicio').notNull(),
    horaFim: text('hora_fim').notNull(),
  },
  (tabela) => [
    index('disp_prestador_idx').on(tabela.prestadorId),
    index('disp_servico_dia_idx').on(tabela.servicoId, tabela.diaSemana),
  ]
);

export const agendamentos = pgTable(
  'agendamentos',
  {
    id: serial('id').primaryKey(),
    clienteId: integer('cliente_id')
      .notNull()
      .references(() => usuarios.id),
    servicoId: integer('servico_id')
      .notNull()
      .references(() => servicos.id),
    dataHora: timestamp('data_hora').notNull(),
    status: text('status').default('pendente').notNull(),
  },
  (tabela) => [
    index('agend_cliente_data_idx').on(tabela.clienteId, tabela.dataHora),
    index('agend_servico_data_idx').on(tabela.servicoId, tabela.dataHora),
  ]
);

// tabela antiga de pagamentos que ficou no banco: o codigo usa cobrancas
export const pagamentos = pgTable(
  'pagamentos',
  {
    id: serial('id').primaryKey(),
    agendamentoId: integer('agendamento_id')
      .notNull()
      .references(() => agendamentos.id, { onDelete: 'cascade' }),
    abacateId: text('abacate_id').notNull().unique(),
    metodo: text('metodo').default('PIX').notNull(),
    valorCentavos: integer('valor_centavos').notNull(),
    status: text('status').default('pendente').notNull(),
    brCode: text('br_code'),
    brCodeBase64: text('br_code_base64'),
    devMode: boolean('dev_mode').default(false).notNull(),
    expiraEm: timestamp('expira_em', { withTimezone: true }),
    pagoEm: timestamp('pago_em', { withTimezone: true }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
    subcontaId: text('subconta_id'),
    repassePrestadorCentavos: integer('repasse_prestador_centavos'),
    comissaoCentavos: integer('comissao_centavos'),
    taxaGatewayCentavos: integer('taxa_gateway_centavos'),
  },
  (tabela) => [index('pagamentos_agendamento_idx').on(tabela.agendamentoId)]
);

// uma linha por tentativa sem cascade
export const cobrancas = pgTable(
  'cobrancas',
  {
    id: serial('id').primaryKey(),
    agendamentoId: integer('agendamento_id')
      .notNull()
      .references(() => agendamentos.id),
    // vazio ate a abacatepay responder
    provedorId: text('provedor_id').unique(),
    metodo: text('metodo').notNull(),
    // valores em lib statuspagamento
    status: text('status').default('criando').notNull(),
    valorCentavos: integer('valor_centavos').notNull(),
    taxaCentavos: integer('taxa_centavos'),
    pixCopiaECola: text('pix_copia_e_cola'),
    pixQrCode: text('pix_qr_code'),
    boletoLinhaDigitavel: text('boleto_linha_digitavel'),
    boletoUrl: text('boleto_url'),
    comprovanteUrl: text('comprovante_url'),
    cartaoBandeira: text('cartao_bandeira'),
    cartaoFinal: text('cartao_final'),
    modoTeste: boolean('modo_teste'),
    erro: text('erro'),
    expiraEm: timestamp('expira_em'),
    pagoEm: timestamp('pago_em'),
    reembolsadoEm: timestamp('reembolsado_em'),
    sincronizadoEm: timestamp('sincronizado_em'),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
  },
  (tabela) => [
    // impede duas cobrancas ativas
    uniqueIndex('cobrancas_uma_ativa_por_agendamento')
      .on(tabela.agendamentoId)
      .where(sql`${tabela.status} in ('criando', 'pendente', 'pago')`),
  ]
);

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

export const mensagens = pgTable(
  'mensagens',
  {
    id: serial('id').primaryKey(),
    agendamentoId: integer('agendamento_id')
      .notNull()
      .references(() => agendamentos.id, { onDelete: 'cascade' }),
    remetenteId: integer('remetente_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    texto: text('texto').notNull(),
    lidaEm: timestamp('lida_em'),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (tabela) => [index('msg_agend_id_idx').on(tabela.agendamentoId, tabela.id)]
);

export const favoritos = pgTable(
  'favoritos',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    // so um dos dois e preenchido
    servicoId: integer('servico_id').references(() => servicos.id, { onDelete: 'cascade' }),
    prestadorId: integer('prestador_id').references(() => usuarios.id, { onDelete: 'cascade' }),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (tabela) => [index('fav_usuario_idx').on(tabela.usuarioId)]
);

export const notificacoes = pgTable(
  'notificacoes',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    titulo: text('titulo').notNull(),
    mensagem: text('mensagem').notNull(),
    link: text('link'),
    emailDestino: text('email_destino').notNull(),
    enviado: boolean('enviado').default(false).notNull(),
    erro: text('erro'),
    lidaEm: timestamp('lida_em'),
    criadoEm: timestamp('criado_em').defaultNow().notNull(),
  },
  (tabela) => [index('notif_usuario_criado_idx').on(tabela.usuarioId, tabela.criadoEm)]
);

// existe no banco mas o limite de tentativas do codigo fica em memoria
export const tentativas = pgTable(
  'tentativas',
  {
    id: serial('id').primaryKey(),
    chave: text('chave').notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (tabela) => [index('tentativas_chave_idx').on(tabela.chave, tabela.criadoEm)]
);
