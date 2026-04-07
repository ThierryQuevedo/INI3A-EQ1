import { loginAction } from "../../actions/action_login";
import Link from 'next/link';

export default function loginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Entrar na Marca Ai
        </h1>

        {/* Aqui você usaria a action de login quando ela estiver pronta */}
        <form action = {loginAction} className="space-y-4">
          
          {/* Campo Email */}
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

          {/* Campo Senha */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Senha</label>
            </div>
            <input 
              name="password"
              type="password" 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="********"
              required
            />
              <Link href="/esqueci-senha" className="text-xs text-blue-600 hover:underline">
                Esqueceu a senha?
              </Link>
          </div>

          {/* Botão de Entrar (Submit) */}
          <div className="flex justify-center mt-6">
            <button 
              type="submit" 
              className="bg-orange-400 px-8 py-2 rounded-2xl text-white font-bold w-full hover:bg-orange-500 transition-all"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta?{' '}
          <Link href="/usuario/cadastro" className="text-blue-600 hover:underline font-semibold">
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
}