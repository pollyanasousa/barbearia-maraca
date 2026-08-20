import { pool } from '../config/db';
import type { BarbeiroEntity, BarbeiroRepository } from './BarbeiroRepository';

export interface BarbeiroSeed {
  nome: string;
  email: string;
  senha_hash: string;
}

interface LinhaBarbeiroComUsuario {
  id: string; // BIGINT volta como string no driver pg
  nome: string;
  email: string;
  senha_hash: string;
  criado_em: Date;
}

// Barbeiro é modelado como `barbeiro` no schema real (US12, time de Banco de Dados),
// ligado a `usuario` (tipo = 'barbeiro') pelas credenciais. É administrador único
// (Escopo 2.2) — não existe cadastro público, só o seed no boot (ver semearSeNecessario).
export class PostgresBarbeiroRepository implements BarbeiroRepository {
  async buscarPorEmail(email: string): Promise<BarbeiroEntity | null> {
    const resultado = await pool.query<LinhaBarbeiroComUsuario>(
      `SELECT barbeiro.id, barbeiro.nome, usuario.email, usuario.senha_hash, barbeiro.created_at AS criado_em
       FROM usuario
       JOIN barbeiro ON barbeiro.usuario_id = usuario.id
       WHERE usuario.email = $1 AND usuario.tipo = 'barbeiro'`,
      [email],
    );

    const linha = resultado.rows[0];
    if (linha === undefined) {
      return null;
    }

    return {
      id: Number(linha.id),
      nome: linha.nome,
      email: linha.email,
      senha_hash: linha.senha_hash,
      criado_em: linha.criado_em,
    };
  }

  // Não faz parte da interface BarbeiroRepository (que é somente leitura de propósito) —
  // é bootstrap do boot do servidor, não uma operação pública de cadastro. Idempotente:
  // se já existir um barbeiro com esse e-mail, não faz nada.
  async semearSeNecessario(seed: BarbeiroSeed): Promise<void> {
    const existente = await this.buscarPorEmail(seed.email);
    if (existente !== null) {
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const usuario = await client.query<{ id: string }>(
        `INSERT INTO usuario (email, senha_hash, tipo) VALUES ($1, $2, 'barbeiro') RETURNING id`,
        [seed.email, seed.senha_hash],
      );

      await client.query(
        `INSERT INTO barbeiro (usuario_id, nome) VALUES ($1, $2)`,
        [usuario.rows[0].id, seed.nome],
      );

      await client.query('COMMIT');
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }
}
