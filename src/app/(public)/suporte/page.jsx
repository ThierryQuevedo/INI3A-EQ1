export default function SuportePage() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep text-tcc-neutro-100 font-sans antialiased">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <span className="text-caption font-bold uppercase tracking-widest text-tcc-azul-light font-display">
          Ajuda
        </span>
        <h1 className="text-h4 lg:text-h3 font-black font-display tracking-tight text-white mt-2 mb-6">
          Suporte
        </h1>

        <div className="bg-tcc-azul-darker/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-card space-y-4">
          <p className="text-tcc-neutro-300 text-body-sm md:text-body-lg leading-relaxed">
            Este é um texto de exemplo. Em breve, esta página vai trazer canais de contato e
            respostas para as dúvidas mais comuns.
          </p>
          <p className="text-tcc-neutro-300 text-body-sm md:text-body-lg leading-relaxed">
            Conteúdo definitivo em construção.
          </p>
        </div>
      </div>
    </div>
  );
}
