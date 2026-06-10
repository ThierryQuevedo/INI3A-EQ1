import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { usuarios, prestadores } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function cadastrarUsuario(req, res, next) {
  try {
    const { nome, email, telefone, senha, tipo } = req.body;
    if (!nome || !email || !telefone || !senha || !tipo) {
      return res.status(400).json({ error: "Campos incompletos." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // 1. Insere o usuário geral
    const [novoUsuario] = await db
      .insert(usuarios)
      .values({ 
        nome, 
        email, 
        telefone, 
        senha: hashedPassword, 
        tipo 
      })
      .returning({ id: usuarios.id });

    // 2. Compara ignorando maiúsculas e minúsculas para evitar erros do Front
    if (tipo && tipo.toLowerCase() === 'prestador') {
      try {
        await db.insert(prestadores).values({
          // Verifique no seu schema da tabela 'prestadores' se o nome antes dos dois pontos é 'usuarioId' mesmo!
          usuarioId: novoUsuario.id 
        });
      } catch (prestadorError) {
        // Loga o erro específico no terminal do VS Code para você descobrir o nome correto da coluna
        console.error("===> ERRO AO INSERIR NA TABELA PRESTADORES:", prestadorError.message);
        throw prestadorError;
      }
    }

    return res.status(201).json({ message: 'Usuario cadastrado com sucesso!!' });

  } catch (err) {
    next(err); // Se cair aqui, o Front-end vai receber erro e não vai redirecionar
  }
}

export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;
    const userArray = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
    const user = userArray[0];
    if (!user) {
      return res.status(500).json({ error: 'Credenciais invalidas' });
    }
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(400).json({ error: 'Credenciais invalidas' })
    }
    const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.setHeader("Authorization", "Bearer " + token).json({ user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (err) {
    next(err)
  }
}

export async function cadastrarServico(req){
try {
    const body = await req.json();
    const { nome, categoriaId, novaCategoria, preco, duracaoEstimada, descricao } = body;

    let idDaCategoriaFinal = categoriaId;

    // 1. Se o front enviou categoriaId como nulo e passou o texto em 'novaCategoria'
    if (!idDaCategoriaFinal && novaCategoria) {
      // Cria a nova categoria no banco
      const [novaCategoriaCriada] = await db
        .insert(categorias)
        .values({
          nome: novaCategoria, // Exemplo de nome da coluna na tabela de categorias
        })
        .returning({ id: categorias.id }); // Retorna o ID gerado automaticamente

      idDaCategoriaFinal = novaCategoriaCriada.id;
    }

    // Nota: Lembre-se de obter o id do prestador dinamicamente (da sessão/auth do usuário logado)
    const prestadorIdMock = 1; 

    // 2. Insere os dados finais na sua tabela de serviços (mapeado de acordo com seu print)
    await db.insert(servicos).values({
      nome: nome,
      descricao: descricao,
      preco: preco.toString(), // Se sua coluna 'numeric' no Drizzle exigir string para precisão decimal
      duracao_estimada: duracaoEstimada, // Nome idêntico ao do seu banco
      categoria_id: idDaCategoriaFinal,   // Salva apenas o ID numérico aqui!
      prestador_id: prestadorIdMock,     // ID obrigatório do prestador
    });

    return NextResponse.json({ success: true, message: "Serviço cadastrado com sucesso!" }, { status: 201 });

  } catch (error) {
    console.error("Erro ao salvar serviço no banco:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}