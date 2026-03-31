import { User, Menu } from 'lucide-react';
import Link from "next/link";

export default function Header(){
    return(
        <header className="bg-blue-300 flex items-center justify-between px-10 h-15">
            <Link href="" className='bg-green-700 rounded-full p-2 hover:bg-red-500 hover:scale-105 transition-all duration-200 '>
                 <Menu className='justify-center'/>
            </Link>
            <Link href="/" className='text-2xl font-bold'><p className='bg-yellow-200 rounded-md p-2'>Marca Ai</p></Link>
            <Link href="/usuario/cadastro" className='bg-green-700 rounded-full p-2 hover:bg-red-500 hover:scale-105 transition-all duration-200 '>
                <User className='justify-center'/>    
            </Link>
        </header>
    )
};