import { Router } from 'express';
import type { ServicoController } from '../controllers/ServicoController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { autenticarBarbeiro } from '../middlewares/autenticarBarbeiro';

export function criarRotasServico(controller: ServicoController): Router {
  const router = Router();

  router.post('/servicos', autenticarBarbeiro, asyncHandler(controller.criar.bind(controller)));
  router.get('/servicos', asyncHandler(controller.listar.bind(controller)));

  return router;
}