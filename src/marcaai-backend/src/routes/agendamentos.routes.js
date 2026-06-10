import { Router } from "express";
import * as agendamentosController from "../controllers/agendamentos.controller.js";

const r = Router();

//o rotedor dessa rota chama os controladores
// tudo que vier em /api/auth/cadastrar vai ser jogado dentro do authController, na função cadastrarUsuario.

r.post('/', agendamentosController.criarAgendamento);
r.get('/', agendamentosController.listarAgendamentos);
r.get('/:id', agendamentosController.buscarAgendamento);
r.put('/:id', agendamentosController.atualizarAgendamento);
r.delete('/:id', agendamentosController.deletarAgendamento);

export default r;