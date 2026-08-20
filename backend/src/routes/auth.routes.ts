import { Router } from 'express';
import type { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { autenticar } from '../middlewares/autenticar';
import { validarLogin } from '../middlewares/validarLogin';

export function criarRotasAuth(controller: AuthController): Router {
  const router = Router();

  router.post('/login', validarLogin, asyncHandler(controller.login.bind(controller)));
  router.post('/logout', autenticar, asyncHandler(controller.logout.bind(controller)));

  return router;
}