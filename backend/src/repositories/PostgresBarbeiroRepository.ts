import { pool } from '../config/db';
import type { BarbeiroEntity, BarbeiroRepository } from './BarbeiroRepository';

export interface BarbeiroSeed {
  nome: string;
  email: string;
  senha_hash: string;
}

interface LinhaFuncionarioComUsuario {
  id: string; // BIGINT volta como string no driver pg
  nome: string;
  email: string;
  senha_hash: string;
  criado_em: Date;
}

// Barbeiro é modelado como `funcionario` no schema real (US12, time de Banco de Dados),
// ligado a `usuario` (tipo = 'funcionario') pelas credenciais. É administrador único
// (Escopo 2.2) — não existe cadastro público, só o seed no boot (ver semearSeNecessario).
export class PostgresBarbeiroRepository implements BarbeiroRepository {
  async buscarPorEmail(email: string): Promise<BarbeiroEntity | null> {
    const resultado = await pool.query<LinhaFuncionarioComUsuario>(
      `SELECT funcionario.id, funcionario.nome, usuario.email, usuario.senha_hash, funcionario.created_at AS criado_em
       FROM usuario
       JOIN funcionario ON funcionario.usuario_id = usuario.id
       WHERE usuario.email = $1 AND usuario.tipo = 'funcionario'`,
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
  // se já existir um funcionario com esse e-mail, não faz nada.
  async semearSeNecessario(seed: BarbeiroSeed): Promise<void> {
    const existente = await this.buscarPorEmail(seed.email);
    if (existente !== null) {
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const usuario = await client.query<{ id: string }>(
        `INSERT INTO usuario (email, senha_hash, tipo) VALUES ($1, $2, 'funcionario') RETURNING id`,
        [seed.email, seed.senha_hash],
      );

      await client.query(
        `INSERT INTO funcionario (usuario_id, nome, is_admin, ativo) VALUES ($1, $2, true, true)`,
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
