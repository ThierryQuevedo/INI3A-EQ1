import { cadastrarUsuario } from "./actions.js";
import Link from 'next/link';

export default function CadastroUsuario() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Criar Conta na Marca Ai
        </h1>

        <form action = {cadastrarUsuario} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input 
              name="nome"
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              name="email"
              type="email" 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              name="password"
              type="password" 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="********"
              required
            />
          </div>

          <div className="flex justify-center">
          <button 
            type="submit" 
            className="bg-orange-400 px-8 py-2 rounded-2xl text-white font-bold w-full hover:bg-orange-500 transition-all"
          >
            Cadastrar
          </button>
          </div>

        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/usuario/login" className="text-blue-600 hover:underline font-semibold">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}