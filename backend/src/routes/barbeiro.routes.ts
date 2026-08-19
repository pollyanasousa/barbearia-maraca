import { Router } from 'express';
import type { AuthBarbeiroController } from '../controllers/AuthBarbeiroController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validarLogin } from '../middlewares/validarLogin';

export function criarRotasBarbeiro(controller: AuthBarbeiroController): Router {
  const router = Router();

  router.post('/login-barbeiro', validarLogin, asyncHandler(controller.login.bind(controller)));

  return router;
}