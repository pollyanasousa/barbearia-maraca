import type { Request, Response } from 'express';
import type { AuthBarbeiroService } from '../services/AuthBarbeiroService';
import type { LoginRequestDTO } from '../dtos/Auth.dto';

export class AuthBarbeiroController {
  constructor(private readonly service: AuthBarbeiroService) {}

  async login(req: Request, res: Response): Promise<void> {
    const dados = req.body as LoginRequestDTO;
    const resultado = await this.service.login(dados);
    res.status(200).json(resultado);
  }
}