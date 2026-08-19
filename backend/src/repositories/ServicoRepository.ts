import type { ServicoDTO } from '../dtos/Servico.dto';

export interface ServicoEntity {
  id: number;
  nome: string;
  duracaoMinutos: number;
  preco: number;
  criado_em: Date;
}

export interface NovoServicoData {
  nome: string;
  duracaoMinutos: number;
  preco: number;
}

export interface ServicoRepository {
  criar(dados: NovoServicoData): Promise<ServicoDTO>;
  listar(): Promise<ServicoDTO[]>;
}