CREATE TABLE "agendamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"cliente_id" integer NOT NULL,
	"servico_id" integer NOT NULL,
	"data_hora" timestamp NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avaliacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"agendamento_id" integer NOT NULL,
	"nota_para_prestador" integer,
	"comentario_prestador" text,
	"nota_para_cliente" integer,
	"comentario_cliente" text,
	CONSTRAINT "avaliacoes_agendamento_id_unique" UNIQUE("agendamento_id")
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	CONSTRAINT "categorias_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"usuario_id" integer PRIMARY KEY NOT NULL,
	"cpf" text NOT NULL,
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "disponibilidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"prestador_id" integer NOT NULL,
	"dia_semana" integer NOT NULL,
	"hora_inicio" text NOT NULL,
	"hora_fim" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prestadores" (
	"usuario_id" integer PRIMARY KEY NOT NULL,
	"documento" text NOT NULL,
	"biografia" text,
	"raio_atendimento_km" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "prestadores_documento_unique" UNIQUE("documento")
);
--> statement-breakpoint
CREATE TABLE "servicos" (
	"id" serial PRIMARY KEY NOT NULL,
	"prestador_id" integer NOT NULL,
	"categoria_id" integer NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"preco" numeric(10, 2) NOT NULL,
	"duracao_estimada" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"expira_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text,
	"senha" text NOT NULL,
	"tipo" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "usuarios_telefone_unique" UNIQUE("telefone")
);
--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_cliente_id_clientes_usuario_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("usuario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_agendamento_id_agendamentos_id_fk" FOREIGN KEY ("agendamento_id") REFERENCES "public"."agendamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_prestador_id_prestadores_usuario_id_fk" FOREIGN KEY ("prestador_id") REFERENCES "public"."prestadores"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestadores" ADD CONSTRAINT "prestadores_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_prestador_id_prestadores_usuario_id_fk" FOREIGN KEY ("prestador_id") REFERENCES "public"."prestadores"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;