import { User } from 'lucide-react';

export default function Header(){
    return(
        <header className="bg-blue-300 flex items-center justify-between px-10 h-15">
            <h1 className="text-2xl">Marca Aí</h1>
            <a href="" className='bg-green-700 rounded-full p-2 hover:bg-red-500 hover:scale-105 transition-all duration-200 '>
                <User className='justify-center '/>    
            </a>

        </header>
    )
};