export default function TermosPage() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep text-tcc-neutro-100 font-sans antialiased">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <span className="text-xs font-bold uppercase tracking-widest text-tcc-azul-light font-urbanist">
          Legal
        </span>
        <h1 className="text-3xl lg:text-4xl font-black font-urbanist tracking-tight text-white leading-[1.15] mt-2 mb-6">
          Termos de Uso
        </h1>

        <div className="bg-tcc-azul-darker/40 p-8 rounded-2xl border border-tcc-azul-darker/5 space-y-4">
          <p className="text-tcc-neutro-300 text-sm md:text-base leading-relaxed font-light">
            Este é um texto de exemplo. Os termos de uso definitivos do Marca Aí serão publicados
            aqui em breve.
          </p>
          <p className="text-tcc-neutro-300 text-sm md:text-base leading-relaxed font-light">
            Conteúdo definitivo em construção.
          </p>
        </div>
      </div>
    </div>
  );
}
