import './src/config/carregarEnv';
import bcrypt from 'bcrypt';
import cors from 'cors';
import express from 'express';
import { config } from './src/config/env';
import { ClienteController } from './src/controllers/ClienteController';
import { ClienteService } from './src/services/ClienteService';
import { AuthController } from './src/controllers/AuthController';
import { AuthService } from './src/services/AuthService';
import { AuthBarbeiroController } from './src/controllers/AuthBarbeiroController';
import { AuthBarbeiroService } from './src/services/AuthBarbeiroService';
import { ServicoController } from './src/controllers/ServicoController';
import { ServicoService } from './src/services/ServicoService';
import { PostgresClienteRepository } from './src/repositories/PostgresClienteRepository';
import { PostgresBarbeiroRepository } from './src/repositories/PostgresBarbeiroRepository';
import { PostgresServicoRepository } from './src/repositories/PostgresServicoRepository';
import { criarRotasCliente } from './src/routes/cliente.routes';
import { criarRotasAuth } from './src/routes/auth.routes';
import { criarRotasBarbeiro } from './src/routes/barbeiro.routes';
import { criarRotasServico } from './src/routes/servico.routes';
import { errorHandler, notFoundHandler } from './src/middlewares/erro';

const CUSTO_BCRYPT = 10;

async function iniciarServidor(): Promise<void> {
  const app = express();
  app.use(cors({ origin: config.frontendOrigin }));
  app.use(express.json());

  const clienteRepository = new PostgresClienteRepository();
  const clienteService = new ClienteService(clienteRepository);
  const clienteController = new ClienteController(clienteService);

  const authService = new AuthService(clienteRepository);
  const authController = new AuthController(authService);

  const barbeiroRepository = new PostgresBarbeiroRepository();
  await barbeiroRepository.semearSeNecessario({
    nome: config.barbeiroEmail.split('@')[0],
    email: config.barbeiroEmail,
    senha_hash: await bcrypt.hash(config.barbeiroSenhaInicial, CUSTO_BCRYPT),
  });
  const authBarbeiroService = new AuthBarbeiroService(barbeiroRepository);
  const authBarbeiroController = new AuthBarbeiroController(authBarbeiroService);

  const servicoRepository = new PostgresServicoRepository();
  const servicoService = new ServicoService(servicoRepository);
  const servicoController = new ServicoController(servicoService);

  app.use(criarRotasCliente(clienteController));
  app.use(criarRotasAuth(authController));
  app.use(criarRotasBarbeiro(authBarbeiroController));
  app.use(criarRotasServico(servicoController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`[barbearia-maraca] API rodando em http://localhost:${config.port}`);
  });
}

iniciarServidor().catch((err) => {
  console.error('[barbearia-maraca] Falha ao iniciar a API:', err);
  process.exit(1);
});
