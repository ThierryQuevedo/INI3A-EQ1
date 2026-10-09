import {
  Laptop,
  GraduationCap,
  HeartPulse,
  Wrench,
  Scissors,
  Sparkles,
  Dumbbell,
  Car,
} from "lucide-react";

const MAPA = [
  { teste: /design|tecnologia|tech|programa/i, Icon: Laptop },
  { teste: /aula|consultoria|educa|professor/i, Icon: GraduationCap },
  { teste: /sa[úu]de|bem-estar|est[ée]tica|beleza/i, Icon: HeartPulse },
  { teste: /manuten[çc][ãa]o|reforma|conserto/i, Icon: Wrench },
  { teste: /barbearia|cabelo|manicure/i, Icon: Scissors },
  { teste: /academia|fitness|personal/i, Icon: Dumbbell },
  { teste: /mec[âa]nica|autom[óo]vel|carro/i, Icon: Car },
];

export function getCategoryIcon(nomeCategoria) {
  const nome = String(nomeCategoria || "");
  const encontrado = MAPA.find(({ teste }) => teste.test(nome));
  return encontrado?.Icon ?? Sparkles;
}

export default function CategoryIcon({ nome, size = 16, className, ...props }) {
  const Icon = getCategoryIcon(nome);
  // eslint-disable-next-line react-hooks/static-components -- seleção entre um conjunto fixo de ícones importados, não criação dinâmica de componente
  return <Icon size={size} className={className} aria-hidden="true" {...props} />;
}
