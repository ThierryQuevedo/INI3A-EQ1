'use client'; 

import { useState } from 'react'; 
import { Search, FunnelPlus } from 'lucide-react'; 
import { Button } from "../../../../@/components/ui/button"; 
import { Input } from "../../../../@/components/ui/InputCatalogo"; 
import CardServicoCatalogo from '../../../components/cards/CardServicoCatalogo';
import MenuFiltros from '../../../components/menu/MenuFIltros';
import Link from "next/link";

export default function CatalogoClient({ servicos = [] }) {
    console.log("PROPRIEDADES DE UM SERVIÇO:", servicos[0]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [termoBusca, setTermoBusca] = useState('');

    const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);

    const servicosFiltrados = servicos.filter((servico) => {
        const termo = termoBusca.toLowerCase();
        

        const nomeServico = servico.nomeServico?.toLowerCase() || '';
        const nomePrestador = servico.nomeProfissional?.toLowerCase() || ''; 
        const nomeCategoria = servico.nomeCategoria?.toLowerCase() || '';

        return (
            nomeServico.includes(termo) || 
            nomePrestador.includes(termo) || 
            nomeCategoria.includes(termo)
        );
    });

    return (
        <div className="bg-tcc-azul-deep min-h-screen flex flex-col items-center relative">
            
            <h1 className='font-urbanist text-white font-bold text-4xl my-10'>Catálogo de Serviços</h1>

            <div className='flex flex-col w-2/3 min-h-150 bg-tcc-azul-darker rounded-2xl overflow-hidden pb-10 shadow-lg'>
                
                <div className='flex flex-row justify-center m-5 gap-2'>
                    
                    <div className="relative">
                        <Button 
                            className="bg-tcc-laranja text-white flex gap-2 items-center cursor-pointer" 
                            onClick={toggleFilterMenu}
                        >
                            <FunnelPlus/> Filtros
                        </Button>
                        <MenuFiltros isOpen={isFilterOpen} onClose={toggleFilterMenu} />
                    </div>
                    
                    <Input 
                        className="bg-tcc-azul-light h-10 flex-1 text-white placeholder-gray-400" 
                        placeholder="Buscar por serviço, prestador ou categoria..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                    
                    <Button className="bg-tcc-laranja text-white flex gap-2 items-center cursor-pointer"> 
                        <Search size={18} /> Buscar
                    </Button>
                </div>

                <div className='flex gap-4 items-center justify-center flex-wrap p-4'>
                    {servicosFiltrados.length === 0 ? (
                        <p className="text-tcc-azul-light mt-10 font-medium">
                            {servicos.length === 0 
                                ? "Nenhum serviço cadastrado no momento." 
                                : "Nenhum resultado encontrado para a sua busca."}
                        </p>
                    ) : (
                        servicosFiltrados.map((servico) => (
                            <Link key={servico.id} href={`/servicos/${servico.id}`}>
                                <CardServicoCatalogo servico={servico} avaliacao={4.3} />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}