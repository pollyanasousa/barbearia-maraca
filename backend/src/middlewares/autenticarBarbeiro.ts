import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiError } from './erro';

declare global {
  namespace Express {
    interface Request {
      barbeiroId?: number;
    }
  }
}

const PREFIXO_BEARER = 'Bearer ';

export function autenticarBarbeiro(req: Request, _res: Response, next: NextFunction): void {
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

  if (typeof decodificado === 'string') {
    next(new ApiError(401, 'NAO_AUTENTICADO', 'Faça login para acessar este recurso.'));
    return;
  }

  if (typeof decodificado.barbeiroId !== 'number') {
    // Token assinado e válido, mas não é de barbeiro (ex: token de cliente) — autenticado sem permissão.
    next(new ApiError(403, 'ACESSO_NEGADO', 'Você não tem permissão para acessar este recurso.'));
    return;
  }

  req.barbeiroId = decodificado.barbeiroId;
  next();
}