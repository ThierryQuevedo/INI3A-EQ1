import CardServicoDestaque from "../../components/cards/CardServicoDestaque";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../../../@/components/ui/button";
import logoMarcaai from "../../../public/images/Identidade visual marca ai/marca ai resenheiro.png";
import logotipoMarcaai from "../../../public/images/Identidade visual marca ai/logotipo.png";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-tcc-neutro-100">

      <div className="flex  bg-tcc-azul-darker justify-around py-2">
        <Image src={logoMarcaai} className="w-70" alt="LogoMarcaAi"/>
        <div className="text-center flex flex-col justify-center items-center">
          <Image src={logotipoMarcaai} alt="Logotipo MarcaAi"/>
          <p className="text-tcc-neutro-100 text-lg">Agendamentos rápidos</p>
          <p className="text-tcc-neutro-100 ">para quem não tem tempo a perder</p>
        </div>
        <div className="flex flex-col justify-center gap-5">
          <Link className="" href="/login">
            <Button size={'lg'} className=' hover:scale-102 w-35 text-lg font-semibold transition-all bg-tcc-azul-dark border-2 rounded-2xl border-tcc-laranja text-tcc-laranja'>Entrar</Button>
          </Link>

          <Link href="/cadastro">
            <Button size={'lg'} className=' hover:scale-102 w-35 text-lg font-semibold transition-all bg-tcc-laranja rounded-2xl text-tcc-azul-dark'>Criar conta</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold p-2">Serviços mais procurados</h2>
        <div className="flex p-5 gap-10">
          <Link href="/catalogo">
            <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Cabeleireiro</Button>
          </Link>
          <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Manicures</Button>
          <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Aulas</Button>
          <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Mecânicos</Button>
          <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Saúde</Button>
          <Button size={'lg'} className='bg-tcc-laranja font-semibold rounded-2xl text-tcc-azul-dark border-2 border-tcc-azul-darker hover:scale-102 transition-all'>Mental</Button>
        </div>
      </div>

      <div className="flex flex-col items-center p-2">

        <h2 className="text-lg font-semibold p-2">Em destaque</h2>
        <div className="bg-tcc-laranja-dark p-10 rounded-2xl flex flex-col gap-2">
          <div className="flex flex-row gap-5">
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
          </div>

          <div className="flex flex-row gap-5">
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
            <CardServicoDestaque/>
          </div>

        </div>

      </div>


    </div>
  );
}