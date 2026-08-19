import type { NextFunction, Request, Response } from 'express';
import { ApiError } from './erro';

interface CorpoLoginDesconhecido {
  email?: unknown;
  senha?: unknown;
}

export function validarLogin(req: Request, _res: Response, next: NextFunction): void {
  const corpo = (req.body ?? {}) as CorpoLoginDesconhecido;
  const details: Record<string, string> = {};

  const email = typeof corpo.email === 'string' ? corpo.email.trim() : '';
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';

  if (email === '') {
    details.email = 'O e-mail é obrigatório.';
  }

  if (senha === '') {
    details.senha = 'A senha é obrigatória.';
  }

  if (Object.keys(details).length > 0) {
    next(new ApiError(400, 'DADOS_INVALIDOS', 'Verifique os campos destacados.', details));
    return;
  }

  next();
}