import bcrypt from 'bcrypt';
import type { ClienteRepository } from '../repositories/ClienteRepository';
import type { CadastroClienteRequestDTO, ClienteDTO } from '../dtos/Cliente.dto';
import { ApiError } from '../middlewares/erro';

const CUSTO_BCRYPT = 10;

export class ClienteService {
  constructor(private readonly repository: ClienteRepository) {}

  async cadastrar(dados: CadastroClienteRequestDTO): Promise<ClienteDTO> {
    const emailNormalizado = dados.email.trim().toLowerCase();

    const existente = await this.repository.buscarPorEmail(emailNormalizado);
    if (existente !== null) {
      throw new ApiError(
        409,
        'CLIENTE_EMAIL_JA_CADASTRADO',
        'Este e-mail já está cadastrado. Faça login ou recupere sua senha.',
      );
    }

    const senhaHash = await bcrypt.hash(dados.senha, CUSTO_BCRYPT);

    return this.repository.criar({
      nome: dados.nome.trim(),
      email: emailNormalizado,
      senha_hash: senhaHash,
      telefone: dados.telefone.trim(),
    });
  }
}