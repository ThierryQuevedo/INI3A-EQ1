import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoriasButton from "../components/CategoriasButton";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../../@/components/ui/button";
import trabalho from "../../public/images/trabalho.jpg";
import logoMarcaai from "../../public/images/Identidade visual marca ai/marca ai resenheiro.png";
import logotipoMarcaai from "../../public/images/Identidade visual marca ai/logotipo.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <div className="flex  bg-tcc-azul-darker justify-around py-2">
        <Image src={logoMarcaai} className="w-70"/>
        <div className="text-center flex flex-col justify-center items-center">
          <Image src={logotipoMarcaai}/>
          <p className="text-tcc-neutro-100 ">Agendamentos rápidos para quem não tem tempo a perder</p>
        </div>
        <div className="flex flex-col justify-center gap-5">
          <Button size={'lg'} className='bg-tcc-azul-dark border-2 rounded-2xl border-tcc-laranja text-tcc-laranja'>Entrar</Button>
          <Button size={'lg'} className='bg-tcc-laranja rounded-2xl text-tcc-azul-dark'>Criar conta</Button>
        </div>
      </div>
    </div>
  );
}