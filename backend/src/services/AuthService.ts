import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ClienteRepository } from '../repositories/ClienteRepository';
import type { LoginRequestDTO, LoginResponseDTO } from '../dtos/Auth.dto';
import { ApiError } from '../middlewares/erro';
import { config } from '../config/env';

export class AuthService {
  constructor(private readonly repository: ClienteRepository) {}

  async login(dados: LoginRequestDTO): Promise<LoginResponseDTO> {
    const email = dados.email.trim().toLowerCase();
    const cliente = await this.repository.buscarPorEmail(email);

    if (cliente === null) {
      throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }

    const senhaConfere = await bcrypt.compare(dados.senha, cliente.senha_hash);
    if (!senhaConfere) {
      throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }

    const token = jwt.sign({ clienteId: cliente.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
      },
    };
  }
}