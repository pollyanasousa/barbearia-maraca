import type { ClienteDTO } from '../dtos/Cliente.dto';

export interface ClienteEntity {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  criado_em: Date;
}

export interface NovoClienteData {
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
}

export interface ClienteRepository {
  criar(dados: NovoClienteData): Promise<ClienteDTO>;
  buscarPorEmail(email: string): Promise<ClienteEntity | null>;
}