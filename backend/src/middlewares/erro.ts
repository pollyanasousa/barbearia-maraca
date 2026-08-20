import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorResponse } from '../dtos/ApiError.dto';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorResponse = {
    error: {
      code: 'ROTA_NAO_ENCONTRADA',
      message: 'Recurso não encontrado.',
    },
  };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = { error: { code: err.code, message: err.message } };
    if (err.details !== undefined) {
      body.error.details = err.details;
    }
    res.status(err.status).json(body);
    return;
  }

  console.error('[erro inesperado]', err);
  const body: ApiErrorResponse = {
    error: {
      code: 'ERRO_INTERNO',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
    },
  };
  res.status(500).json(body);
};