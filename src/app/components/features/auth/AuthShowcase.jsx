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
 * Painel decorativo exibido ao lado dos formulários de login/cadastro em
 * telas largas (lg+). Em telas estreitas o form ocupa a tela toda sozinho.
 */
export default function AuthShowcase({ title, className }) {
  return (
    <aside
      className={cn(
        "relative isolate flex-col justify-between overflow-hidden p-12 xl:p-16 text-white",
        className
      )}
    >
      <div
        className="absolute inset-0 -z-20 bg-[var(--color-tcc-azul-900)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, var(--color-tcc-azul-400) 0%, transparent 55%), radial-gradient(circle at 85% 90%, var(--color-tcc-laranja-400) 0%, transparent 45%), linear-gradient(160deg, var(--color-tcc-azul-700) 0%, var(--color-tcc-azul-950) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Link href="/" className="relative w-fit bg-white/95 rounded-xl px-4 py-2.5 shadow-soft">
        <Image src={logotipo} alt="Marca Aí — página inicial" className="w-32 h-auto" priority />
      </Link>

      <div className="relative mt-auto">
        <h2 className="text-h3 font-display font-extrabold leading-[1.1] tracking-tight mb-6 text-balance">
          {title}
        </h2>

        <ul className="space-y-4">
          {FUNCIONALIDADES.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-start gap-3">
              <span className="shrink-0 size-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mt-0.5">
                <Icon size={16} aria-hidden="true" />
              </span>
              <p className="text-body-sm text-white/85 leading-relaxed pt-1">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
