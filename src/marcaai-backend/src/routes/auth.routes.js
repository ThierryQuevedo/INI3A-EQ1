import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const r = Router();

//o rotedor dessa rota chama os controladores
// tudo que vier em /api/auth/cadastrar vai ser jogado dentro do authController, na função cadastrarUsuario.
r.post("/cadastrar", authController.cadastrarUsuario);
r.post("/login", authController.loginUsuario);
r.post("/cadastrarServico", authController.cadastrarServico);

export default r;