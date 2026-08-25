'use client';

import { useState } from 'react';
import { Search, FunnelPlus } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/InputCatalogo";
import CardServicoCatalogo from "@/app/components/features/servicos/CardServicoCatalogo";
import MenuFiltros from "@/app/components/features/servicos/MenuFiltros";
import Link from "next/link";

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
        <div className="bg-tcc-azul-deep min-h-screen flex flex-col items-center relative">

            <h1 className='font-display text-white font-bold text-h3 my-8'>Catálogo de Serviços</h1>

            <div className='flex flex-col w-[95vw] max-w-[1600px] min-h-[85vh] bg-tcc-azul-darker rounded-3xl overflow-hidden pb-10 shadow-elevated'>

                <div className='flex flex-col sm:flex-row justify-center m-5 gap-2'>

                    <div className="relative">
                        <Button
                            variant="accent"
                            onClick={toggleFilterMenu}
                            aria-haspopup="dialog"
                            aria-expanded={isFilterOpen}
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

                    <label htmlFor="busca-servicos" className="sr-only-status">Buscar por serviço, prestador ou categoria</label>
                    <Input
                        id="busca-servicos"
                        className="bg-white/10 border-white/15 h-11 flex-1 text-white placeholder:text-tcc-neutro-300"
                        placeholder="Buscar por serviço, prestador ou categoria..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />

                    <Button variant="accent">
                        <Search size={18} aria-hidden="true" /> Buscar
                    </Button>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5 w-full'>
                    {servicosFiltrados.length === 0 ? (
                        <p className="text-tcc-azul-light mt-10 font-medium col-span-full text-center text-body">
                            {servicos.length === 0
                                ? "Nenhum serviço cadastrado no momento."
                                : "Nenhum resultado encontrado para a sua busca."}
                        </p>
                    ) : (
                        servicosFiltrados.map((servico) => (
                            <Link
                                key={servico.id}
                                href={`/servicos/${servico.slug || servico.id}`}
                                className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tcc-azul-light focus-visible:ring-offset-2 focus-visible:ring-offset-tcc-azul-darker"
                            >
                                <CardServicoCatalogo servico={servico} avaliacao={4.3} />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
