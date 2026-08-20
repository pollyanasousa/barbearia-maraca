const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const { join } = require('node:path');

const envPath = join(__dirname, '..', '.env');
const examplePath = join(__dirname, '..', '.env.example');

if (existsSync(envPath)) {
  console.log('[setup-env] backend/.env já existe — nada a fazer.');
  process.exit(0);
}

const modelo = readFileSync(examplePath, 'utf8');
const segredoGerado = randomBytes(32).toString('hex');
const conteudo = modelo.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${segredoGerado}`);

writeFileSync(envPath, conteudo);
console.log('[setup-env] backend/.env criado com um JWT_SECRET aleatório.');
console.log('[setup-env] Preencha DB_USER/DB_PASSWORD quando o Postgres estiver configurado.');
