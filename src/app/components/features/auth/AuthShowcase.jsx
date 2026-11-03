import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import logotipo from "../../../../public/images/Identidade visual marca ai/logotipo.png";

const FUNCIONALIDADES = [
  {
    icon: CalendarCheck,
    texto: "Veja a agenda real de cada profissional, sem precisar perguntar se tem horário.",
  },
  {
    icon: Zap,
    texto: "Confirme o horário na hora, sem trocar mensagem indo e voltando.",
  },
  {
    icon: Star,
    texto: "Avalie e seja avaliado — construa uma reputação de verdade.",
  },
];

/**
 * Painel exibido ao lado dos formulários de login/cadastro em telas largas
 * (lg+). Superfície sólida dos tokens semânticos — nada de gradiente ou
 * textura — para conversar com o formulário em vez de competir com ele.
 * Em telas estreitas o form ocupa a tela toda sozinho.
 */
export default function AuthShowcase({ title, className }) {
  return (
    <aside
      className={cn(
        "flex-col justify-between bg-secondary text-secondary-foreground border-r border-border p-12 xl:p-16",
        className
      )}
    >
      <Link href="/" className="w-fit rounded-lg">
        <Image src={logotipo} alt="Marca Aí — página inicial" className="w-32 h-auto" priority />
      </Link>

      <div className="mt-auto max-w-md">
        <h2 className="text-h3 font-bold leading-[1.1] mb-8 text-balance">{title}</h2>

        <ul className="space-y-5">
          {FUNCIONALIDADES.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-start gap-3">
              <span className="shrink-0 size-9 rounded-lg bg-card text-primary inline-flex items-center justify-center">
                <Icon size={18} className="shrink-0" aria-hidden="true" />
              </span>
              <p className="text-body-sm leading-relaxed pt-1.5">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
