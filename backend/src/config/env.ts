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

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  barbeiroEmail,
  barbeiroSenhaInicial,
};