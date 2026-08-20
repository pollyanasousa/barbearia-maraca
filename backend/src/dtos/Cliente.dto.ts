export interface ClienteDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface CadastroClienteRequestDTO {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}