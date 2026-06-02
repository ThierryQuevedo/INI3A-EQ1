import Image from "next/image";

export default function CardServicoDestaque(){
    return(
        <div className="w-50 h-50 bg-amber-400 relative rounded-2xl border-2 border-tcc-azul-darker hover:scale-102 transition-all">
            <Image className="rounded-2xl" src="https://picsum.photos/200/200?random=10" alt="Foto Serviço" width={200} height={200}/>
            <div className="absolute rounded-b-2xl w-full h-15 bg-tcc-laranja bottom-0 text-center" >
                <h2 className="font-semibold text-xl">Isaias prado</h2>
                <h3>O mecânico amigo</h3>
            </div>
        </div>
    )
}