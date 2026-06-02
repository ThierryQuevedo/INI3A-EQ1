import { Star, FunnelPlus, Search } from 'lucide-react';
import { Button } from "../../../@/components/ui/button";
import { Input } from "../../../@/components/ui/InputCatalogo";
import CardServicoCatalogo from '../../components/cards/CardServicoCatalogo';

export default function CataloguePage(){
    return(
        <div className="bg-tcc-azul-deep min-h-screen flex flex-col items-center">
            <h1 className='font-urbanist text-white'>Catálogo de Serviços</h1>

            <div className='flex flex-col w-2/3 bg-tcc-azul-darker'>
                <div className='flex flex-row justify-center'>
                    <Button className="bg-tcc-laranja ">
                        <FunnelPlus /> Filtros
                    </Button>
                    <Input className="bg-tcc-azul-light h-10" placeholder="Clique aqui para digitar"/>
                    <Button className="bg-tcc-laranja"> <Search /> Buscar</Button>
                </div>
                <div>
                    <CardServicoCatalogo/>
                </div>
            </div>
        </div>
    )
}