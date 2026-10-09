export const metadata = { title: 'Sobre nós' };

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <span className="text-caption font-bold text-primary font-display">Sobre nós</span>
        <h1 className="text-h4 lg:text-h3 font-black font-display tracking-tight text-foreground mt-2 mb-6">
          Agendar um serviço não devia ser complicado
        </h1>

        <div className="space-y-5 text-body text-muted-foreground leading-relaxed">
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
      </div>
    </div>
  );
}
