import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

export default function MenuFiltros({
  isOpen,
  onClose,
  categorias = [],
  categoriaSelecionada = '',
  onAplicarFiltros,
}) {
  const [aberturaAnterior, setAberturaAnterior] = useState(isOpen);
  const [categoriaPendente, setCategoriaPendente] = useState(categoriaSelecionada);

  if (isOpen !== aberturaAnterior) {
    setAberturaAnterior(isOpen);
    if (isOpen) {
      setCategoriaPendente(categoriaSelecionada);
    }
  }

  if (!isOpen) return null;

  const limparTudo = () => setCategoriaPendente('');

  const aplicarFiltros = () => {
    onAplicarFiltros?.(categoriaPendente);
    onClose();
  };

  const cancelar = () => {
    setCategoriaPendente(categoriaSelecionada);
    onClose();
  };

  return (
    <div role="dialog" aria-label="Filtros de busca" className="absolute top-full left-0 mt-2 w-72 bg-card rounded-2xl shadow-elevated z-40 p-5 border border-border">

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-foreground font-bold text-h6 flex items-center gap-2">
          <span className="text-h5" aria-hidden="true">≡</span> Filtros
        </h2>
        <button
          type="button"
          onClick={limparTudo}
          className="text-tcc-azul h-9 px-2 rounded-full text-body-sm hover:bg-muted hover:underline transition-colors cursor-pointer"
        >
          Limpar tudo
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="filtro-categoria" className="block text-foreground font-semibold mb-1.5 text-body-sm">Categorias</label>
          <div className="relative">
            <select
              id="filtro-categoria"
              className="w-full h-11 appearance-none bg-background border border-input rounded-xl py-2 px-3 text-foreground text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={categoriaPendente}
              onChange={(e) => setCategoriaPendente(e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={String(categoria.id)}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} aria-hidden="true" />
          </div>
        </div>

        {[
          { label: "Tipo de serviço", placeholder: "Selecione o tipo" },
          { label: "Nível de atendimento", placeholder: "Selecione o nível" }
        ].map((item, i) => (
          <div key={i}>
            <label htmlFor={`filtro-extra-${i}`} className="block text-foreground font-semibold mb-1.5 text-body-sm">{item.label}</label>
            <div className="relative">
              <select id={`filtro-extra-${i}`} className="w-full h-11 appearance-none bg-background border border-input rounded-xl py-2 px-3 text-foreground text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>{item.placeholder}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <fieldset className="mt-5">
        <legend className="block text-foreground font-semibold mb-2 text-body-sm">Disponibilidade</legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 cursor-pointer group py-2 -mx-2 px-2 rounded-lg hover:bg-muted transition-colors">
            <input type="checkbox" className="peer sr-only" />
            <div className="size-6 shrink-0 border-2 border-input rounded-md flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 transition-colors">
              <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
            </div>
            <span className="text-foreground text-body-sm font-medium">Disponível</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group py-2 -mx-2 px-2 rounded-lg hover:bg-muted transition-colors">
            <input type="checkbox" className="peer sr-only" />
            <div className="size-6 shrink-0 border-2 border-input rounded-md flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 transition-colors">
              <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
            </div>
            <span className="text-foreground text-body-sm font-medium">Sob demanda</span>
          </label>
        </div>
      </fieldset>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={cancelar}
          className="flex-1 h-11 bg-muted text-foreground rounded-full font-semibold hover:bg-muted/70 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={aplicarFiltros}
          className="flex-1 h-11 bg-tcc-laranja text-white rounded-full font-semibold hover:bg-tcc-laranja-dark transition-colors cursor-pointer"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}
