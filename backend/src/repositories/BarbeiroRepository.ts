export interface BarbeiroEntity {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  criado_em: Date;
}

// Somente leitura de propósito: não existe cadastro público de barbeiro (administrador único,
// conta semeada no boot — ver US03). Não expor `criar` publicamente.
export interface BarbeiroRepository {
  buscarPorEmail(email: string): Promise<BarbeiroEntity | null>;
}