export interface ServicoDTO {
  id: number;
  nome: string;
  duracaoMinutos: number;
  preco: number;
}

export interface CadastroServicoRequestDTO {
  nome: string;
  duracaoMinutos: number;
  preco: number;
}