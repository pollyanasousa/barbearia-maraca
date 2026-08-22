const jwtSecret = process.env.JWT_SECRET ?? '';

if (jwtSecret === '') {
  throw new Error('JWT_SECRET não definida no ambiente. Configure backend/.env (ver .env.example) antes de subir a API.');
}

const barbeiroEmail = process.env.BARBEIRO_EMAIL ?? '';
const barbeiroSenhaInicial = process.env.BARBEIRO_SENHA_INICIAL ?? '';

if (barbeiroEmail === '' || barbeiroSenhaInicial === '') {
  throw new Error(
    'BARBEIRO_EMAIL e BARBEIRO_SENHA_INICIAL devem ser definidos no ambiente (senha de boot do barbeiro único). ' +
      'Configure backend/.env (ver .env.example) antes de subir a API.',
  );
}

const dbUser = process.env.DB_USER ?? '';
const dbPassword = process.env.DB_PASSWORD ?? '';

if (dbUser === '' || dbPassword === '') {
  throw new Error(
    'DB_USER e DB_PASSWORD devem ser definidos no ambiente. Configure backend/.env (ver .env.example) antes de subir a API.',
  );
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  barbeiroEmail,
  barbeiroSenhaInicial,
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbUser,
  dbPassword,
  dbName: process.env.DB_NAME ?? 'barbearia_maraca',
};