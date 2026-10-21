import { CalendarCheck, Zap, Star } from "lucide-react";
import PageContainer from "@/app/components/ui/PageContainer";

export const metadata = { title: 'Sobre nós' };

const PILARES = [
  {
    icon: CalendarCheck,
    titulo: "Agenda real",
    texto: "Você vê os horários livres de cada profissional, sem precisar perguntar.",
  },
  {
    icon: Zap,
    titulo: "Confirmação na hora",
    texto: "Escolhe o horário e confirma — sem ida e volta de mensagens no WhatsApp.",
  },
  {
    icon: Star,
    titulo: "Reputação real",
    texto: "Lembretes reduzem faltas e as avaliações constroem a reputação de quem atende.",
  },
];

export default function SobrePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% -30%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 55%)",
          }}
        />
        <PageContainer size="md" className="pt-16 pb-12">
          <span className="text-caption font-bold text-primary">Sobre nós</span>
          <h1 className="text-h4 lg:text-h3 font-black tracking-tight text-foreground mt-2 text-balance">
            Agendar um serviço não devia ser complicado
          </h1>
        </PageContainer>
      </section>

      <PageContainer size="md" className="py-12">
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {PILARES.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Icon size={17} className="text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-body-sm font-bold text-foreground mb-1">{titulo}</h2>
              <p className="text-caption text-muted-foreground leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>

        <div className="space-y-5 text-body text-muted-foreground leading-relaxed max-w-prose">
          <p>
            O Marca Aí nasceu de um problema simples: marcar um horário com um barbeiro, uma manicure,
            um professor particular ou um mecânico normalmente significa trocar mensagens no WhatsApp,
            esperar resposta e torcer para o profissional não esquecer o combinado.
          </p>
          <p>
            A plataforma reúne prestadores de serviço locais em um único lugar. Você vê a agenda real
            de cada profissional, escolhe um horário que já está livre e confirma o agendamento na hora
            — sem ida e volta de mensagens.
          </p>
          <p>
            Para quem presta o serviço, o Marca Aí organiza a agenda, reduz faltas com lembretes
            automáticos e ajuda a construir uma reputação através das avaliações de quem já foi atendido.
          </p>
          <p>
            Ainda estamos no começo. Se você tem sugestões sobre o que poderia funcionar melhor, fale
            com a gente pela página de{' '}
            <a href="/suporte" className="text-primary font-semibold hover:underline">suporte</a>.
          </p>
        </div>
      </PageContainer>
    </>
  );
}
