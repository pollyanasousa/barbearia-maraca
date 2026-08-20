import type { Request, Response } from 'express';
import type { ClienteService } from '../services/ClienteService';
import type { CadastroClienteRequestDTO } from '../dtos/Cliente.dto';

export class ClienteController {
  constructor(private readonly service: ClienteService) {}

  async cadastrar(req: Request, res: Response): Promise<void> {
    const dados = req.body as CadastroClienteRequestDTO;
    const cliente = await this.service.cadastrar(dados);
    res.status(201).json(cliente);
  }
}