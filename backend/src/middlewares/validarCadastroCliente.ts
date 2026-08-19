import type { NextFunction, Request, Response } from 'express';
import { ApiError } from './erro';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CorpoCadastroDesconhecido {
  nome?: unknown;
  email?: unknown;
  senha?: unknown;
  telefone?: unknown;
}

export function validarCadastroCliente(req: Request, _res: Response, next: NextFunction): void {
  const corpo = (req.body ?? {}) as CorpoCadastroDesconhecido;
  const details: Record<string, string> = {};

  const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : '';
  const email = typeof corpo.email === 'string' ? corpo.email.trim() : '';
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';
  const telefone = typeof corpo.telefone === 'string' ? corpo.telefone.trim() : '';

  if (nome === '') {
    details.nome = 'O nome é obrigatório.';
  }

  if (email === '') {
    details.email = 'O e-mail é obrigatório.';
  } else if (!EMAIL_REGEX.test(email)) {
    details.email = 'O e-mail informado é inválido.';
  }

  if (senha === '') {
    details.senha = 'A senha é obrigatória.';
  }

  if (telefone === '') {
    details.telefone = 'O telefone é obrigatório.';
  }

  if (Object.keys(details).length > 0) {
    next(new ApiError(400, 'DADOS_INVALIDOS', 'Verifique os campos destacados.', details));
    return;
  }

  next();
}