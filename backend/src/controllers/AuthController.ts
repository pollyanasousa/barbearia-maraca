import type { Request, Response } from 'express';
import type { AuthService } from '../services/AuthService';
import type { LoginRequestDTO } from '../dtos/Auth.dto';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const dados = req.body as LoginRequestDTO;
    const resultado = await this.service.login(dados);
    res.status(200).json(resultado);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(204).send();
  }
}