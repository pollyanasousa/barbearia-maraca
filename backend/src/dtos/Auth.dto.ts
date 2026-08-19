import type { ClienteDTO } from './Cliente.dto';

export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  token: string;
  cliente: ClienteDTO;
}