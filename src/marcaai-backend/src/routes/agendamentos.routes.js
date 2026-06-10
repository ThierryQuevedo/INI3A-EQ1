import { Router } from "express";
import * as agendamentosController from "../controllers/agendamentos.controller.js";

const r = Router();

//o rotedor dessa rota chama os controladores
// tudo que vier em /api/auth/cadastrar vai ser jogado dentro do authController, na função cadastrarUsuario.

r.post('/', criarAgendamento);
r.get('/', listarAgendamentos);
r.get('/:id', buscarAgendamento);
r.put('/:id', atualizarAgendamento);
r.delete('/:id', deletarAgendamento);

export default r;