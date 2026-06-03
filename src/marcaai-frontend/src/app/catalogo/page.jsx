import {  FunnelPlus, Search } from 'lucide-react';
import { Button } from "../../../@/components/ui/button";
import { Input } from "../../../@/components/ui/InputCatalogo";
import CardServicoCatalogo from '../../components/cards/CardServicoCatalogo';
import MenuSlide from '../../components/menu/MenuSlide';

export default function CataloguePage(){
    return(
        <div className="bg-tcc-azul-deep min-h-screen flex flex-col items-center">
            <MenuSlide/>
            <h1 className='font-urbanist text-white font-bold text-4xl my-10'>Catálogo de Serviços</h1>

            <div className='flex flex-col w-2/3 bg-tcc-azul-darker'>
                <div className='flex flex-row justify-center m-5'>
                    <Button className="bg-tcc-laranja ">
                        <FunnelPlus /> Filtros
                    </Button>
                    <Input className="bg-tcc-azul-light h-10" placeholder="Clique aqui para digitar"/>
                    <Button className="bg-tcc-laranja"> <Search /> Buscar</Button>
                </div>
                <div className='flex gap-2 items-center justify-center flex-wrap'>
                    <CardServicoCatalogo avaliacao={1}/>
                    <CardServicoCatalogo avaliacao={3}/>
                    <CardServicoCatalogo avaliacao={4}/>
                    <CardServicoCatalogo avaliacao={2}/>
                    <CardServicoCatalogo avaliacao={1}/>
                    <CardServicoCatalogo avaliacao={1}/>
                    <CardServicoCatalogo avaliacao={1}/>
                </div>
            </div>
        </div>
    )
}