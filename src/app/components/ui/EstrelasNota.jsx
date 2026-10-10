import { Star, StarHalf } from 'lucide-react';

export default function EstrelasNota({ nota = 0, tamanho = 16 }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[...Array(5)].map((_, i) => {
        const n = i + 1;
        if (nota >= n) {
          return <Star key={n} size={tamanho} className="fill-warning stroke-warning shrink-0" />;
        }
        if (nota > i) {
          return <StarHalf key={n} size={tamanho} className="fill-warning stroke-warning shrink-0" />;
        }
        return <Star key={n} size={tamanho} className="stroke-muted-foreground shrink-0" />;
      })}
    </div>
  );
}
