import { pool } from '../config/db';
import type { ClienteEntity, ClienteRepository, NovoClienteData } from './ClienteRepository';
import type { ClienteDTO } from '../dtos/Cliente.dto';

interface LinhaClienteComUsuario {
  id: string; // BIGINT volta como string no driver pg
  nome: string;
  telefone: string;
  email: string;
  senha_hash: string;
  criado_em: Date;
}

// Cliente é modelado em 2 tabelas no schema real (US12, time de Banco de Dados):
// `usuario` (credenciais: email/senha_hash/tipo) + `cliente` (perfil: nome/telefone),
// ligadas por `cliente.usuario_id`. O `id` do ClienteDTO é sempre o id de `cliente`
// (é o que outras tabelas do domínio, como agendamento, referenciam).
export class PostgresClienteRepository implements ClienteRepository {
  async criar(dados: NovoClienteData): Promise<ClienteDTO> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const usuario = await client.query<{ id: string }>(
        `INSERT INTO usuario (email, senha_hash, tipo) VALUES ($1, $2, 'cliente') RETURNING id`,
        [dados.email, dados.senha_hash],
      );

      const cliente = await client.query<{ id: string }>(
        `INSERT INTO cliente (usuario_id, nome, telefone) VALUES ($1, $2, $3) RETURNING id`,
        [usuario.rows[0].id, dados.nome, dados.telefone],
      );

      await client.query('COMMIT');

      return {
        id: Number(cliente.rows[0].id),
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
      };
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }

  async buscarPorEmail(email: string): Promise<ClienteEntity | null> {
    const resultado = await pool.query<LinhaClienteComUsuario>(
      `SELECT cliente.id, cliente.nome, cliente.telefone, usuario.email, usuario.senha_hash, cliente.created_at AS criado_em
       FROM usuario
       JOIN cliente ON cliente.usuario_id = usuario.id
       WHERE usuario.email = $1 AND usuario.tipo = 'cliente'`,
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
      telefone: linha.telefone,
      criado_em: linha.criado_em,
    };
  }
}
