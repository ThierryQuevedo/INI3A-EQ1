import Image from "next/image";
import { cn } from "@/lib/utils";

function iniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const TAMANHOS = {
  sm: "h-8 w-8 text-caption",
  md: "h-11 w-11 text-body-sm",
  lg: "h-14 w-14 text-body-lg",
};

/** Avatar simples de exibição: foto quando existe, senão as iniciais do nome. */
export default function Avatar({ nome, urlImagem, size = "md", className }) {
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full overflow-hidden bg-secondary text-secondary-foreground flex items-center justify-center font-bold",
        TAMANHOS[size],
        className
      )}
    >
      {urlImagem ? (
        <Image src={urlImagem} alt="" fill sizes="56px" className="object-cover" />
      ) : (
        <span aria-hidden="true">{iniciais(nome)}</span>
      )}
    </div>
  );
}
