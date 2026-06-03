import Image from "next/image";

export default function MenuSlide(){
    return(
        <div className="absolute bg-tcc-azul-medium justify-center flex w-80 left-0 min-h-screen bottom-0 z-2">
            <div className="bg-tcc-azul-darker w-70 ">
 
                <Image src="https://picsum.photos/200/200?random=2" width={80} height={80}/>

            </div>
        </div>
    )
}