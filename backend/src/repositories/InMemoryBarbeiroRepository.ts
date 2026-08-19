import type { BarbeiroEntity, BarbeiroRepository } from './BarbeiroRepository';

export interface BarbeiroSeed {
  nome: string;
  email: string;
  senha_hash: string;
}

// TEMPORÁRIO: implementação em memória enquanto o Postgres não está configurado.
// Conta única semeada (barbeiro é administrador único) — a "linha" é criada no construtor,
// na subida do server.ts, a partir de BARBEIRO_EMAIL/BARBEIRO_SENHA_INICIAL. Substituir por
// PostgresBarbeiroRepository (mesma interface) quando a migration for aplicada.
export class InMemoryBarbeiroRepository implements BarbeiroRepository {
  private readonly barbeiro: BarbeiroEntity;

  constructor(seed: BarbeiroSeed) {
    this.barbeiro = {
      id: 1,
      nome: seed.nome,
      email: seed.email,
      senha_hash: seed.senha_hash,
      criado_em: new Date(),
    };
  }

  async buscarPorEmail(email: string): Promise<BarbeiroEntity | null> {
    if (this.barbeiro.email === email) {
      return this.barbeiro;
    }
    return null;
  }
}