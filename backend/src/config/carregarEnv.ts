import { config } from 'dotenv';

// override: true garante que backend/.env sempre prevalece sobre variáveis de ambiente
// já existentes no shell (ex: DB_PASSWORD de outro projeto na máquina do dev) — sem isso,
// o dotenv por padrão NÃO sobrescreve o que já está no ambiente, causando bugs silenciosos
// de configuração. Precisa ser o PRIMEIRO import de server.ts (efeito colateral puro, sem
// bindings) para rodar antes de qualquer módulo que leia process.env no top-level (ex:
// src/config/env.ts) ser avaliado — imports em TS/ESM são processados antes do corpo do
// módulo, então isso não pode ser uma chamada solta no meio de outros imports.
config({ override: true });
