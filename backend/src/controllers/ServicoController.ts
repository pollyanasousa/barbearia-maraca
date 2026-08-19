import type { Request, Response } from 'express';
import type { ServicoService } from '../services/ServicoService';
import type { CadastroServicoRequestDTO } from '../dtos/Servico.dto';

export class ServicoController {
  constructor(private readonly service: ServicoService) {}

  async criar(req: Request, res: Response): Promise<void> {
    const dados = req.body as CadastroServicoRequestDTO;
    const servico = await this.service.criar(dados);
    res.status(201).json(servico);
  }

  async listar(_req: Request, res: Response): Promise<void> {
    const servicos = await this.service.listar();
    res.status(200).json(servicos);
  }
}