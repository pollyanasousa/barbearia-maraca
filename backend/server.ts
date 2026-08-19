import 'dotenv/config';
import express from 'express';
import { config } from './src/config/env';
import { ClienteController } from './src/controllers/ClienteController';
import { ClienteService } from './src/services/ClienteService';
import { AuthController } from './src/controllers/AuthController';
import { AuthService } from './src/services/AuthService';
import { InMemoryClienteRepository } from './src/repositories/InMemoryClienteRepository';
import { criarRotasCliente } from './src/routes/cliente.routes';
import { criarRotasAuth } from './src/routes/auth.routes';
import { errorHandler, notFoundHandler } from './src/middlewares/erro';

const app = express();
app.use(express.json());

const repository = new InMemoryClienteRepository();

const clienteService = new ClienteService(repository);
const clienteController = new ClienteController(clienteService);

const authService = new AuthService(repository);
const authController = new AuthController(authService);

app.use(criarRotasCliente(clienteController));
app.use(criarRotasAuth(authController));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[barbearia-maraca] API rodando em http://localhost:${config.port}`);
});