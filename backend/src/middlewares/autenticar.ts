import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiError } from './erro';

declare global {
  namespace Express {
    interface Request {
      clienteId?: number;
    }
  }
}

const PREFIXO_BEARER = 'Bearer ';

export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const cabecalho = req.header('Authorization');

  if (cabecalho === undefined || !cabecalho.startsWith(PREFIXO_BEARER)) {
    next(new ApiError(401, 'NAO_AUTENTICADO', 'Faça login para acessar este recurso.'));
    return;
  }

  const token = cabecalho.slice(PREFIXO_BEARER.length).trim();
  if (token === '') {
    next(new ApiError(401, 'NAO_AUTENTICADO', 'Faça login para acessar este recurso.'));
    return;
  }

  let decodificado: jwt.JwtPayload | string;
  try {
    decodificado = jwt.verify(token, config.jwtSecret);
  } catch {
    next(new ApiError(401, 'NAO_AUTENTICADO', 'Faça login para acessar este recurso.'));
    return;
  }

  if (typeof decodificado === 'string' || typeof decodificado.clienteId !== 'number') {
    next(new ApiError(401, 'NAO_AUTENTICADO', 'Faça login para acessar este recurso.'));
    return;
  }

  req.clienteId = decodificado.clienteId;
  next();
}