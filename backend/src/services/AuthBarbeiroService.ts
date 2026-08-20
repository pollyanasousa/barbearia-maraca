import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { BarbeiroRepository } from '../repositories/BarbeiroRepository';
import type { LoginBarbeiroResponseDTO } from '../dtos/Barbeiro.dto';
import type { LoginRequestDTO } from '../dtos/Auth.dto';
import { ApiError } from '../middlewares/erro';
import { config } from '../config/env';

export class AuthBarbeiroService {
  constructor(private readonly repository: BarbeiroRepository) {}

  async login(dados: LoginRequestDTO): Promise<LoginBarbeiroResponseDTO> {
    const email = dados.email.trim().toLowerCase();
    const barbeiro = await this.repository.buscarPorEmail(email);

    if (barbeiro === null) {
      throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }

    const senhaConfere = await bcrypt.compare(dados.senha, barbeiro.senha_hash);
    if (!senhaConfere) {
      throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    }

    const token = jwt.sign({ barbeiroId: barbeiro.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      barbeiro: {
        id: barbeiro.id,
        nome: barbeiro.nome,
        email: barbeiro.email,
      },
    };
  }
}