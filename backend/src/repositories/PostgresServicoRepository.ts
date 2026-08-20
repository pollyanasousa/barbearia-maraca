import { pool } from '../config/db';
import type { ServicoRepository, NovoServicoData } from './ServicoRepository';
import type { ServicoDTO } from '../dtos/Servico.dto';

interface LinhaServico {
  id: string; // BIGINT volta como string no driver pg
  nome: string;
  duracao_minutos: number;
  preco: string; // NUMERIC volta como string no driver pg, evitar perda de precisão
}

// Tabela real é `servico` (singular, ver US12/origin develop) — tem colunas extras
// (descricao, ativo, created_at/updated_at) que o ServicoDTO não usa; `ativo` filtra
// a listagem (soft-delete futuro, ex: US04).
export class PostgresServicoRepository implements ServicoRepository {
  async criar(dados: NovoServicoData): Promise<ServicoDTO> {
    const resultado = await pool.query<LinhaServico>(
      `INSERT INTO servico (nome, duracao_minutos, preco) VALUES ($1, $2, $3)
       RETURNING id, nome, duracao_minutos, preco`,
      [dados.nome, dados.duracaoMinutos, dados.preco],
    );
    return this.paraDTO(resultado.rows[0]);
  }

  async listar(): Promise<ServicoDTO[]> {
    const resultado = await pool.query<LinhaServico>(
      `SELECT id, nome, duracao_minutos, preco FROM servico WHERE ativo = true ORDER BY id`,
    );
    return resultado.rows.map((linha) => this.paraDTO(linha));
  }

  private paraDTO(linha: LinhaServico): ServicoDTO {
    return {
      id: Number(linha.id),
      nome: linha.nome,
      duracaoMinutos: linha.duracao_minutos,
      preco: Number(linha.preco),
    };
  }
}
