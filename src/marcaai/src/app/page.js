import Header from "../components/Header";
import Footer from "../components/Footer";
import CategoriasButton from "../components/CategoriasButton";
import Link from "next/link";
import Image from "next/image";

import trabalho from "../../public/images/trabalho.jpg"
export default function Home() {
  return (
    <div className="">
        <main className="flex-1">
          <section className="justify-center py-10">
            <Image src={trabalho} className="mx-auto" alt="placeholder"/>
          </section>
          <section className="bg-gray-200 py-5 rounded-2xl">
            <h1 className="text-center text-2xl font-bold mb-6">Categorias</h1>
            <nav className="flex flex-wrap justify-center items-center gap-4 px-4">
              <CategoriasButton link="/usuario/cadastro" texto="Estética"></CategoriasButton>
              <CategoriasButton link="/usuario/cadastro" texto="Consertos"></CategoriasButton>
              <CategoriasButton link="/usuario/cadastro" texto="Aulas"></CategoriasButton>
              <CategoriasButton link="/usuario/cadastro" texto="Outros"></CategoriasButton>
            </nav>
          </section>
        </main>
    </div>
  );
}
