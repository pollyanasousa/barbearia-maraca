import { Router } from 'express';
import type { ClienteController } from '../controllers/ClienteController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validarCadastroCliente } from '../middlewares/validarCadastroCliente';

export function criarRotasCliente(controller: ClienteController): Router {
  const router = Router();

  router.post('/clientes', validarCadastroCliente, asyncHandler(controller.cadastrar.bind(controller)));

  return router;
}