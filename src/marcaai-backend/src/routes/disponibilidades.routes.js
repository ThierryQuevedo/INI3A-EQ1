import { Router } from "express";
import * as disponibilidadesController from "../controllers/disponibilidades.controller.js";

const r = Router();

r.get('/prestador/:prestadorId', disponibilidadesController.listarDisponibilidades);
r.get('/agendamentos/prestador/:prestadorId', disponibilidadesController.listarAgendamentosPorPrestador);

export default r;