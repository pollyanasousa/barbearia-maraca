import 'dotenv/config';
import express from 'express';
import { config } from './src/config/env';
import { ClienteController } from './src/controllers/ClienteController';
import { ClienteService } from './src/services/ClienteService';
import { InMemoryClienteRepository } from './src/repositories/InMemoryClienteRepository';
import { criarRotasCliente } from './src/routes/cliente.routes';
import { errorHandler, notFoundHandler } from './src/middlewares/erro';

const app = express();
app.use(express.json());

const repository = new InMemoryClienteRepository();
const service = new ClienteService(repository);
const controller = new ClienteController(service);

app.use(criarRotasCliente(controller));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[barbearia-maraca] API rodando em http://localhost:${config.port}`);
});