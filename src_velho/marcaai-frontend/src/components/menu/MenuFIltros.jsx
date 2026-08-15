import { X, ChevronDown } from 'lucide-react';

export default function MenuFiltros({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-40 p-5 border border-gray-200">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-gray-800 font-bold text-xl flex items-center gap-2">
          <span className="text-2xl">≡</span> Filtros
        </h2>
        <button className="text-tcc-azul-light text-sm hover:underline">Limpar tudo</button>
      </div>

      <div className="space-y-4">
        {[
          { label: "Categorias", placeholder: "Selecione uma categoria" },
          { label: "Tipo de serviço", placeholder: "Selecione o tipo" },
          { label: "Nível de atendimento", placeholder: "Selecione o nível" }
        ].map((item, i) => (
          <div key={i}>
            <label className="block text-gray-700 font-semibold mb-1.5 text-sm">{item.label}</label>
            <div className="relative">
              <select className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-tcc-laranja/20">
                <option>{item.placeholder}</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <label className="block text-gray-700 font-semibold mb-2 text-sm">Disponibilidade</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden peer" />
            <div className="size-6 border-2 border-gray-300 rounded-md flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
              <div className="size-2 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-gray-600 text-sm font-medium">Disponível</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="hidden peer" />
            <div className="size-6 border-2 border-gray-300 rounded-md flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
               <div className="size-2 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-gray-600 text-sm font-medium">Sob demanda</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button 
          onClick={onClose}
          className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button className="flex-1 py-2 bg-tcc-laranja text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}