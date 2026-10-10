import PageContainer from "@/app/components/ui/PageContainer";

export const metadata = { title: 'Termos de uso' };

const SECOES = [
  {
    titulo: '1. O que é o Marca Aí',
    paragrafos: [
      'O Marca Aí é uma plataforma de agendamento que conecta clientes a prestadores de serviço locais (como barbeiros, manicures, professores e mecânicos), permitindo visualizar horários disponíveis e confirmar atendimentos diretamente pelo site.',
      'A plataforma é um espaço de intermediação: o contrato de prestação do serviço em si é feito entre cliente e prestador, sendo cada um responsável pelos combinados e pela qualidade do atendimento.',
    ],
  },
  {
    titulo: '2. Cadastro e conta',
    paragrafos: [
      'Para agendar ou oferecer serviços é necessário criar uma conta, com e-mail e senha ou com login Google. As informações cadastradas devem ser verdadeiras e mantidas atualizadas.',
      'Você é responsável por manter sua senha em sigilo e por qualquer atividade realizada através da sua conta.',
    ],
  },
  {
    titulo: '3. Agendamentos e cancelamentos',
    paragrafos: [
      'Um agendamento é confirmado quando o horário escolhido ainda está livre na agenda do prestador no momento da confirmação. Cliente e prestador podem cancelar um agendamento antes da data marcada diretamente pela plataforma.',
      'Faltas e cancelamentos recorrentes podem afetar a reputação de clientes e prestadores, visível através do histórico de avaliações.',
    ],
  },
  {
    titulo: '4. Avaliações',
    paragrafos: [
      'Após um atendimento concluído, cliente e prestador podem avaliar um ao outro. As avaliações devem refletir a experiência real do atendimento e não podem conter ofensas, dados pessoais de terceiros ou conteúdo enganoso.',
    ],
  },
  {
    titulo: '5. Uso adequado da plataforma',
    paragrafos: [
      'Não é permitido usar o Marca Aí para fins ilegais, para divulgar conteúdo falso ou para contornar as regras de agendamento e avaliação da plataforma.',
    ],
  },
  {
    titulo: '6. Alterações destes termos',
    paragrafos: [
      'Estes termos podem ser atualizados periodicamente para refletir mudanças na plataforma. Mudanças relevantes serão comunicadas através do próprio site.',
    ],
  },
];

export default function TermosPage() {
  return (
    <PageContainer size="md" className="py-16">
      <span className="text-caption font-bold text-primary">Legal</span>
      <h1 className="text-h4 lg:text-h3 font-black tracking-tight text-foreground mt-2 mb-2">
        Termos de uso
      </h1>
      <p className="text-body-sm text-muted-foreground mb-8">Última atualização: outubro de 2026</p>

      <div className="space-y-8">
        {SECOES.map((secao) => (
          <section key={secao.titulo}>
            <h2 className="text-body-lg font-bold text-foreground mb-2">{secao.titulo}</h2>
            <div className="space-y-3">
              {secao.paragrafos.map((p, i) => (
                <p key={i} className="text-body text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
