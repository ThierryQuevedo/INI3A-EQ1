ALTER TABLE "clientes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "clientes" CASCADE;--> statement-breakpoint
ALTER TABLE "prestadores" DROP CONSTRAINT "prestadores_documento_unique";--> statement-breakpoint
ALTER TABLE "agendamentos" DROP CONSTRAINT "agendamentos_cliente_id_clientes_usuario_id_fk";
--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_cliente_id_usuarios_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestadores" DROP COLUMN "documento";--> statement-breakpoint
ALTER TABLE "prestadores" DROP COLUMN "raio_atendimento_km";