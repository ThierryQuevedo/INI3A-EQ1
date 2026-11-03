import Image from "next/image";
import Link from "next/link";
import BotaoVoltar from "@/app/components/ui/BotaoVoltar";
import Avatar from "@/app/components/ui/Avatar";
import EstrelasNota from "@/app/components/ui/EstrelasNota";
import { Card } from "@/app/components/ui/card";

/**
 * Peças compartilhadas dos perfis públicos (/prestador/[slug] e
 * /cliente/[slug]): banner baixo, coluna de resumo que acompanha a rolagem
 * e cartão compacto de avaliação.
 */

export function PerfilBanner({ urlBanner, fallbackHref }) {
  // Sem banner próprio não desenhamos uma faixa vazia: só o "Voltar".
  if (!urlBanner) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <BotaoVoltar fallbackHref={fallbackHref} />
      </div>
    );
  }
  return (
    <div className="relative h-28 sm:h-40 w-full overflow-hidden bg-secondary">
      <Image src={urlBanner} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute top-4 left-4 sm:left-6">
        <BotaoVoltar fallbackHref={fallbackHref} variant="sobreposto" />
      </div>
    </div>
  );
}

/** Coluna de identidade: avatar, nome, nota, ações, números e bio. */
export function PerfilResumo({ usuario, eyebrow, detalhe, nota, totalAvaliacoes, rotuloAvaliacoes, acoes, estatisticas, biografia }) {
  return (
    <Card className="lg:sticky lg:top-20">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <Avatar nome={usuario.nome} urlImagem={usuario.urlImagem} className="size-16 lg:size-20 text-h6" />
        <div className="min-w-0">
          {eyebrow && <p className="text-caption font-semibold text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-h5 font-bold text-foreground break-words">{usuario.nome}</h1>
          {detalhe}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {nota > 0 ? (
          <>
            <span className="text-body-sm font-bold text-foreground">{nota.toFixed(1)}</span>
            <EstrelasNota nota={nota} tamanho={14} />
          </>
        ) : (
          <span className="text-body-sm font-semibold text-foreground">Novo</span>
        )}
        <span className="text-body-sm text-muted-foreground">
          ({totalAvaliacoes} {rotuloAvaliacoes})
        </span>
      </div>

      {acoes && <div className="flex items-center gap-2 mt-4">{acoes}</div>}

      {estatisticas?.length > 0 && (
        <dl className="grid grid-cols-3 lg:grid-cols-1 gap-3 mt-5 pt-5 border-t border-border">
          {estatisticas.map(({ Icon, rotulo, valor }) => (
            <div key={rotulo} className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 min-w-0">
              <Icon size={16} className="shrink-0 text-muted-foreground max-lg:hidden" aria-hidden="true" />
              <dt className="text-caption text-muted-foreground lg:flex-1 order-2 lg:order-none">{rotulo}</dt>
              <dd className="text-body-sm font-bold text-foreground break-words order-1 lg:order-none">{valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {biografia && (
        <div className="mt-5 pt-5 border-t border-border">
          <h2 className="text-body-sm font-bold text-foreground mb-1">Sobre</h2>
          <p className="text-body-sm text-muted-foreground leading-relaxed whitespace-pre-line">{biografia}</p>
        </div>
      )}
    </Card>
  );
}

/** Avaliação compacta, pensada para grid de 2 colunas. */
export function CardAvaliacao({ nome, urlImagem, href, nota, contexto, comentario }) {
  const classeNome = "block text-body-sm font-semibold text-foreground truncate";
  return (
    <li>
      <Card padding="sm" className="h-full">
        <div className="flex items-center gap-3">
          <Avatar nome={nome} urlImagem={urlImagem} size="sm" />
          <div className="min-w-0 flex-1">
            {href ? (
              <Link href={href} className={`${classeNome} hover:underline`}>{nome}</Link>
            ) : (
              <p className={classeNome}>{nome}</p>
            )}
            {contexto && <p className="text-caption text-muted-foreground truncate">{contexto}</p>}
          </div>
          <span className="shrink-0">
            <span className="sr-only">Nota {nota} de 5</span>
            <EstrelasNota nota={nota || 0} tamanho={13} />
          </span>
        </div>
        {comentario && <p className="text-body-sm text-foreground mt-2 line-clamp-4">{comentario}</p>}
      </Card>
    </li>
  );
}
