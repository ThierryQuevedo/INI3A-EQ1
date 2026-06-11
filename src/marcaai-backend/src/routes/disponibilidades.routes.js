import { Router } from "express";
import * as disponibilidadesController from "../controllers/disponibilidades.controller.js";

const r = Router();

r.get('/prestador/:prestadorId', disponibilidadesController.listarDisponibilidades);
r.get('/agendamentos/prestador/:prestadorId', disponibilidadesController.listarAgendamentosPorPrestador);

r.post('/prestador/:prestadorId', disponibilidadesController.criarDisponibilidade);
r.delete('/prestador/:prestadorId/:id', disponibilidadesController.deletarDisponibilidade);

export default r;