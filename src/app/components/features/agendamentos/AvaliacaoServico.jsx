"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { avaliarServico } from "@/app/actions/avaliacoes.actions";

export default function AvaliacaoServico({ agendamentoId, avaliacaoExistente }) {
  const [enviado, setEnviado] = useState(!!avaliacaoExistente);
  const [nota, setNota] = useState(avaliacaoExistente?.nota || 0);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState(avaliacaoExistente?.comentario || "");
  const [erro, setErro] = useState(null);
  const [pending, startTransition] = useTransition();

  if (enviado) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-caption font-bold text-success uppercase mb-1">Avaliação enviada</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={16}
                className={n <= nota ? "fill-amber-400 stroke-amber-400" : "stroke-muted-foreground"}
              />
            ))}
          </div>
          <span className="text-caption text-muted-foreground">{nota}/5</span>
        </div>
        {comentario && (
          <p className="text-body-sm text-foreground mt-1.5 italic">&ldquo;{comentario}&rdquo;</p>
        )}
      </div>
    );
  }

  const notaExibida = notaHover || nota;

  const enviarAvaliacao = () => {
    if (nota < 1) {
      setErro("Selecione de 1 a 5 estrelas antes de enviar.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      const resultado = await avaliarServico({ agendamentoId, nota, comentario });
      if (resultado?.erro) {
        setErro(resultado.erro);
        return;
      }
      setEnviado(true);
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-body-sm font-bold text-foreground mb-2">
        Como foi o serviço? Deixe sua avaliação
      </p>

      <div className="flex items-center gap-1 mb-2" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={nota === n}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setNotaHover(n)}
            onMouseLeave={() => setNotaHover(0)}
            onClick={() => setNota(n)}
            className="p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              size={26}
              className={notaExibida >= n ? "fill-amber-400 stroke-amber-400" : "stroke-muted-foreground"}
            />
          </button>
        ))}
        {nota > 0 && <span className="text-caption text-muted-foreground ml-1">{nota}/5</span>}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Deixe um comentário (opcional)"
        rows={2}
        maxLength={500}
        className="w-full text-body-sm bg-muted border border-border rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />

      {erro && <p className="text-caption text-destructive mt-1.5">{erro}</p>}

      <button
        type="button"
        onClick={enviarAvaliacao}
        disabled={pending}
        className="mt-2 bg-tcc-laranja hover:bg-tcc-laranja-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-caption font-bold px-4 h-9 rounded-full transition-colors duration-200 cursor-pointer"
      >
        {pending ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
