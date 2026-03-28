import { User } from 'lucide-react';

export default function Header(){
    return(
        <header className="bg-blue-300 flex items-center justify-between px-10 h-15">
            <h1 className="text-2xl">Marca Aí</h1>
            <a href="" className=''>
                <User className='justify-center bg-green-700 rounded-full '/>    
            </a>

        </header>
    )
};