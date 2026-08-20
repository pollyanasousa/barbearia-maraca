export interface BarbeiroDTO {
  id: number;
  nome: string;
  email: string;
}

export interface LoginBarbeiroResponseDTO {
  token: string;
  barbeiro: BarbeiroDTO;
}