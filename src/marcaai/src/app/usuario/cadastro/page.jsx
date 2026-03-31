import { cadastrarUsuario } from "./actions.js";

export default function PaginaCadastro() {
  return (
    <div>
      <div className="p-10">

      <h1>Cadastrar Usuário</h1>
      {/* O Next.js trata o 'action' como um POST automático */}
      <form action={cadastrarUsuario}>
        <div>
          <label>Nome:</label><br/>
          <input type="text" name="nome" required />
        </div>
        
        <div>
          <label>Email:</label><br/>
          <input type="email" name="email" required />
        </div>

        <button type="submit">Salvar no Banco</button>
      </form>
      </div>
    </div>
  );
}