import { Mail } from 'lucide-react';
import PageContainer from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";

export const metadata = { title: 'Suporte' };

const PERGUNTAS = [
  {
    pergunta: 'Como eu agendo um horário?',
    resposta:
      'Busque um serviço ou profissional em "Buscar profissionais", abra o perfil ou o serviço desejado, clique em "Agendar" e escolha um dia e horário disponíveis. O agendamento fica confirmado na hora, sem precisar de conversa por fora da plataforma.',
  },
  {
    pergunta: 'Posso cancelar ou remarcar um agendamento?',
    resposta:
      'Sim. Em "Agendamentos" você encontra a lista de horários marcados com a opção de cancelar enquanto o atendimento ainda não aconteceu. Para remarcar, cancele o horário atual e agende um novo.',
  },
  {
    pergunta: 'Como funciona a avaliação?',
    resposta:
      'Depois que um atendimento é marcado como concluído pelo profissional, você recebe a opção de avaliar o serviço em "Agendamentos" ou pelo link enviado por e-mail. A nota e o comentário ficam visíveis no perfil público do prestador.',
  },
  {
    pergunta: 'Sou prestador de serviço. Como cadastro meus horários?',
    resposta:
      'Em "Minha disponibilidade" você define os dias e horários em que atende, por serviço. Só aparecem para os clientes os horários que realmente estão livres na sua agenda.',
  },
  {
    pergunta: 'Esqueci minha senha, e agora?',
    resposta:
      'Na tela de login, entre com sua conta Google se foi assim que você se cadastrou. Caso tenha se cadastrado com e-mail e senha, fale com a gente pelo canal abaixo para recuperar o acesso.',
  },
];

export default function SuportePage() {
  return (
    <PageContainer size="md" className="py-16">
      <span className="text-caption font-bold text-primary">Ajuda</span>
      <h1 className="text-h4 lg:text-h3 font-black tracking-tight text-foreground mt-2 mb-6">
        Suporte
      </h1>

      <div className="space-y-3 mb-10">
        {PERGUNTAS.map((item) => (
          <details key={item.pergunta} className="group bg-card border border-border rounded-2xl p-5 shadow-soft">
            <summary className="font-bold text-foreground cursor-pointer list-none flex items-center justify-between gap-3">
              {item.pergunta}
              <span className="text-muted-foreground text-body-lg group-open:rotate-45 transition-transform shrink-0" aria-hidden="true">+</span>
            </summary>
            <p className="text-body-sm text-muted-foreground leading-relaxed mt-3">{item.resposta}</p>
          </details>
        ))}
      </div>

      <Card padding="default">
        <h2 className="text-body-lg font-bold text-foreground mb-2">Não encontrou o que precisava?</h2>
        <p className="text-body-sm text-muted-foreground mb-4">
          Mande sua dúvida para o nosso e-mail de suporte — respondemos o mais rápido possível.
        </p>
        <a
          href="mailto:contato@marcaai.com.br"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <Mail size={16} aria-hidden="true" />
          contato@marcaai.com.br
        </a>
      </Card>
    </PageContainer>
  );
}
