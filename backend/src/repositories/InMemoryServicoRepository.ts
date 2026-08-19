import type { ServicoEntity, ServicoRepository, NovoServicoData } from './ServicoRepository';
import type { ServicoDTO } from '../dtos/Servico.dto';

// TEMPORÁRIO: implementação em memória enquanto o Postgres não está configurado.
// Os dados são perdidos ao reiniciar o processo. Quando a migration
// database/migrations/{timestamp}_create_servicos.sql for aplicada, substituir por
// PostgresServicoRepository (mesma interface), sem tocar service/controller.
export class InMemoryServicoRepository implements ServicoRepository {
  private readonly servicos: ServicoEntity[] = [];
  private proximoId = 1;

  async criar(dados: NovoServicoData): Promise<ServicoDTO> {
    const servico: ServicoEntity = {
      id: this.proximoId++,
      nome: dados.nome,
      duracaoMinutos: dados.duracaoMinutos,
      preco: dados.preco,
      criado_em: new Date(),
    };
    this.servicos.push(servico);
    return this.paraDTO(servico);
  }

  async listar(): Promise<ServicoDTO[]> {
    return this.servicos.map((servico) => this.paraDTO(servico));
  }

  private paraDTO(servico: ServicoEntity): ServicoDTO {
    return {
      id: servico.id,
      nome: servico.nome,
      duracaoMinutos: servico.duracaoMinutos,
      preco: servico.preco,
    };
  }
}