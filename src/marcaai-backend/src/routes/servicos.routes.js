import { Router } from "express";
import * as servicosController from "../controllers/servicos.controller.js";

const r = Router();

r.get('/:id', servicosController.buscarServico);
r.get('/', servicosController.listarServicos);
r.post('/cadastrar', servicosController.cadastrarServico);

export default r;