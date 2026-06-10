import { Router } from "express";
import * as agendamentosController from "../controllers/agendamentos.controller.js";

const r = Router();

//o rotedor dessa rota chama os controladores
// tudo que vier em /api/auth/cadastrar vai ser jogado dentro do authController, na função cadastrarUsuario.

r.post('/criarAgendamento', agendamentosController.criarAgendamento);
r.get('/listarAgendamentos', agendamentosController.listarAgendamentos);
r.get('/buscarAgendamento/:id', agendamentosController.buscarAgendamento);
r.put('/atualizarAgendamento/:id', agendamentosController.atualizarAgendamento);
r.delete('/deletarAgendamento/:id', agendamentosController.deletarAgendamento);

export default r;