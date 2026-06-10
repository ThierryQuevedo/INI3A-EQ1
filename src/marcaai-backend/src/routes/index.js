import { Router } from "express";
import agendamentosRouter from "./agendamentos.routes.js";
import authRouter from "./auth.routes.js";

const globalr = Router();

//por enquanto só tem uma, mas dentro de /api, há a rota /auth
// se o cara mandar qualqeur coisa na rota /api/auth, o authRouter vai tomar controle da situação igual um bom daddy
// outras rotas são declaradas esatamente igual a essa, globalr.use("/subraiz", roteador)
globalr.use("/agendamentos", agendamentosRouter)
globalr.use("/auth", authRouter)

export default globalr