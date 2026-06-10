import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { usuarios } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function cadastrarUsuario(req, res, next) {
  try {
    const { nome, email, telefone, senha, tipo } = req.body;
    if (!nome || !email || !telefone || !senha || !tipo) {
      return res.status(400).json({ error: "Campos incompletos." });
      // talvez criar uma classe de erro de campos e colocar throw new FieldError(), pra chamar o global errorHandler?
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    await db.insert(usuarios).values({ nome, email, telefone, senha: hashedPassword, tipo });

    return res.status(201).json({ message: 'Usuario cadastrado com sucesso!!' });

  } catch (err) {
    next(err) // vai ser capturado pelo errorhandler, o next chama a funcao middleware dps dele
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