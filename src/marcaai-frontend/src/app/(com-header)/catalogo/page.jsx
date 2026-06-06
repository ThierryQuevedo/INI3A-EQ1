'use client'; 

import { useState } from 'react'; 
import { Search, FunnelPlus } from 'lucide-react'; 
import { Button } from "../../../../@/components/ui/button";
import { Input } from "../../../../@/components/ui/InputCatalogo";
import CardServicoCatalogo from '../../../components/cards/CardServicoCatalogo';
import MenuFiltros from '../../../components/menu/MenuFIltros';
import MenuSlide from '../../../components/menu/MenuSlide'; 

export default function CataloguePage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);

    return (
        <div className="bg-tcc-azul-deep min-h-screen flex flex-col items-center relative">
            
            <h1 className='font-urbanist text-white font-bold text-4xl my-10'>Catálogo de Serviços</h1>

            <div className='flex flex-col w-2/3 bg-tcc-azul-darker rounded-2xl overflow-hidden pb-10 shadow-lg'>
                
                {/* Barra de Busca */}
                <div className='flex flex-row justify-center m-5 gap-2'>
                    
                    {/* CONTAINER RELATIVE: Ele serve como a âncora invisível para o Menu de Filtros */}
                    <div className="relative">
                        <Button 
                            className="bg-tcc-laranja text-white flex gap-2 items-center" 
                            onClick={toggleFilterMenu}
                        >
                            <FunnelPlus/> Filtros
                        </Button>

                        {/* O MENU DEVE FICAR AQUI DENTRO: Logo após o botão de disparo */}
                        <MenuFiltros isOpen={isFilterOpen} onClose={toggleFilterMenu} />
                    </div>
                    
                    <Input className="bg-tcc-azul-light h-10 flex-1" placeholder="Clique aqui para digitar"/>
                    
                    <Button className="bg-tcc-laranja text-white flex gap-2 items-center"> 
                        <Search size={18} /> Buscar
                    </Button>
                </div>

                {/* Grade de Cards de Serviços */}
                <div className='flex gap-4 items-center justify-center flex-wrap p-4'>
                    <CardServicoCatalogo avaliacao={1.3}/>
                    <CardServicoCatalogo avaliacao={3}/>
                    <CardServicoCatalogo avaliacao={4}/>
                    <CardServicoCatalogo avaliacao={2.5}/>
                    <CardServicoCatalogo avaliacao={4.5}/>
                    <CardServicoCatalogo avaliacao={1}/>
                    <CardServicoCatalogo avaliacao={1.5}/>
                </div>
            </div>
        </div>
    );
}