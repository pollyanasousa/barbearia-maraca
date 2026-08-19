import type { ClienteRepository, ClienteEntity, NovoClienteData } from './ClienteRepository';
import type { ClienteDTO } from '../dtos/Cliente.dto';

// TEMPORÁRIO: implementação em memória usada enquanto o Postgres não está configurado.
// Os dados são perdidos ao reiniciar o processo. Quando a migration
// database/migrations/{timestamp}_create_clientes.sql for aplicada, substituir esta
// implementação por PostgresClienteRepository (mesma interface), sem tocar service/controller.
export class InMemoryClienteRepository implements ClienteRepository {
  private readonly clientes: ClienteEntity[] = [];
  private proximoId = 1;

  async criar(dados: NovoClienteData): Promise<ClienteDTO> {
    const cliente: ClienteEntity = {
      id: this.proximoId++,
      nome: dados.nome,
      email: dados.email,
      senha_hash: dados.senha_hash,
      telefone: dados.telefone,
      criado_em: new Date(),
    };
    this.clientes.push(cliente);
    return this.paraDTO(cliente);
  }

  async buscarPorEmail(email: string): Promise<ClienteEntity | null> {
    const encontrado = this.clientes.find((cliente) => cliente.email === email);
    return encontrado ?? null;
  }

  private paraDTO(cliente: ClienteEntity): ClienteDTO {
    return {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
    };
  }
}