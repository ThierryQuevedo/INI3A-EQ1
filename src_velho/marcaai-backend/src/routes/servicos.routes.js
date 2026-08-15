import { Router } from "express";
import * as servicosController from "../controllers/servicos.controller.js";

const r = Router();

// IMPORTANTE: rotas com prefixo fixo (/prestador/...) precisam vir ANTES
// de rotas com parâmetro solto (/:id), senão o Express trata "prestador"
// como se fosse o valor de :id.
r.get('/prestador/:prestadorId', servicosController.listarServicosPorPrestador);
r.get('/:id', servicosController.buscarServico);
r.get('/', servicosController.listarServicos);
r.post('/cadastrar', servicosController.cadastrarServico);

export default r;