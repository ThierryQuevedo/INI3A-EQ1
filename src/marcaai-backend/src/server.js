import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from './db/index.js';
import { usuarios } from './db/schema.js'; 
import { eq } from 'drizzle-orm';

const app = express();

app.use(cors());
app.use(express.json());


app.post('/api/auth/cadastro', async(req, res) =>{
    try{
        const {nome, email, senha, tipo} = req.body;
        if(!nome || !email || !senha || !tipo){
            return res.status(400).json({error: "Campos incompletos."});
        }
        
        const salt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        await db.insert(usuarios).values({nome, email, senha:hashedPassword, tipo});

        return res.status(201).json({message: 'Usuario cadastrado com sucesso!!'});

    }catch(err){
        return res.status(500).json({error: 'Error interno no servidor'})
    }
});

app.post('/api/auth/login', async (req, res) => {
    try{
        const { email, senha } = req.body;
        const userArray = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
        const user = userArray[0];
        if(!user){
            return res.status(500).json({error: 'Credenciais invalidas'});
        }
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if(!senhaValida){
            return res.status(400).json({error: 'Credenciais invalidas'})
        }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Back-end MarcaAí rodando na porta ${PORT}`));
    