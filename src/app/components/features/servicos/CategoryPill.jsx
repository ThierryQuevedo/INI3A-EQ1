import Link from "next/link";
import CategoryIcon from "./CategoryIcon";

export default function CategoryPill({ id, nome, href }) {
  return (
    <Link
      href={href ?? `/servicos?categoria=${id}`}
      className="shrink-0 whitespace-nowrap bg-muted hover:bg-accent hover:text-accent-foreground text-foreground font-medium text-body-sm px-4 h-11 inline-flex items-center gap-2 rounded-full border border-border transition-all duration-200 ease-apple cursor-pointer"
    >
      <CategoryIcon nome={nome} size={16} />
      {nome}
    </Link>
  );
}
