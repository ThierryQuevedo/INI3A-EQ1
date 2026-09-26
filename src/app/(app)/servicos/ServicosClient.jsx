'use client';

import { useState } from 'react';
import { Search, FunnelPlus } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/InputCatalogo";
import CardServicoCatalogo from "@/app/components/features/servicos/CardServicoCatalogo";
import MenuFiltros from "@/app/components/features/servicos/MenuFiltros";

export default function ServicosClient({ servicos = [], categorias = [] }) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [termoBusca, setTermoBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);

    const servicosFiltrados = servicos.filter((servico) => {
        const termo = termoBusca.toLowerCase();

        const nomeServico = servico.nomeServico?.toLowerCase() || '';
        const nomePrestador = servico.nomeProfissional?.toLowerCase() || '';
        const nomeCategoria = servico.nomeCategoria?.toLowerCase() || '';

        const correspondeBusca =
            nomeServico.includes(termo) ||
            nomePrestador.includes(termo) ||
            nomeCategoria.includes(termo);

        const correspondeCategoria =
            !categoriaFiltro || String(servico.categoriaId) === categoriaFiltro;

        return correspondeBusca && correspondeCategoria;
    });

    return (
        <div className="bg-tcc-azul-deep min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

                <div className="mb-8 sm:mb-10 text-center sm:text-left">
                    <h1 className="font-display text-white font-bold text-h3">Catálogo de Serviços</h1>
                    <p className="text-tcc-azul-light text-body-lg mt-2 max-w-2xl mx-auto sm:mx-0">
                        Encontre um profissional pelo nome, categoria ou tipo de serviço.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tcc-neutro-300 pointer-events-none" aria-hidden="true" />
                        <label htmlFor="busca-servicos" className="sr-only-status">Buscar por serviço, prestador ou categoria</label>
                        <Input
                            id="busca-servicos"
                            className="bg-white/10 border-white/15 h-12 pl-11 text-white placeholder:text-tcc-neutro-300 text-body"
                            placeholder="Buscar por serviço, prestador ou categoria..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Button
                            variant="accent"
                            size="lg"
                            onClick={toggleFilterMenu}
                            aria-haspopup="dialog"
                            aria-expanded={isFilterOpen}
                            className="w-full sm:w-auto"
                        >
                            <FunnelPlus aria-hidden="true" /> Filtros
                        </Button>
                        <MenuFiltros
                            isOpen={isFilterOpen}
                            onClose={toggleFilterMenu}
                            categorias={categorias}
                            categoriaSelecionada={categoriaFiltro}
                            onAplicarFiltros={setCategoriaFiltro}
                        />
                    </div>
                </div>

                {servicosFiltrados.length === 0 ? (
                    <p className="text-tcc-azul-light font-medium text-center text-body-lg py-16">
                        {servicos.length === 0
                            ? "Nenhum serviço cadastrado no momento."
                            : "Nenhum resultado encontrado para a sua busca."}
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {servicosFiltrados.map((servico) => (
                            <CardServicoCatalogo key={servico.id} servico={servico} avaliacao={4.3} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
