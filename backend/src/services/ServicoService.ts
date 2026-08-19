import type { ServicoRepository } from '../repositories/ServicoRepository';
import type { CadastroServicoRequestDTO, ServicoDTO } from '../dtos/Servico.dto';
import { ApiError } from '../middlewares/erro';

export class ServicoService {
  constructor(private readonly repository: ServicoRepository) {}

  async criar(dados: CadastroServicoRequestDTO): Promise<ServicoDTO> {
    const details: Record<string, string> = {};

    const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
    const duracaoValida = typeof dados.duracaoMinutos === 'number' && Number.isInteger(dados.duracaoMinutos) && dados.duracaoMinutos > 0;
    const precoValido = typeof dados.preco === 'number' && Number.isFinite(dados.preco) && dados.preco > 0;

    if (nome === '') {
      details.nome = 'O nome do serviço é obrigatório.';
    }

    if (!duracaoValida) {
      details.duracaoMinutos = 'A duração deve ser um número inteiro em minutos, maior que zero.';
    }

    if (!precoValido) {
      details.preco = 'O preço deve ser um número maior que zero.';
    }

    if (Object.keys(details).length > 0) {
      throw new ApiError(400, 'DADOS_INVALIDOS', 'Verifique os campos destacados.', details);
    }

    return this.repository.criar({
      nome,
      duracaoMinutos: dados.duracaoMinutos,
      preco: Math.round(dados.preco * 100) / 100,
    });
  }

  async listar(): Promise<ServicoDTO[]> {
    return this.repository.listar();
  }
}