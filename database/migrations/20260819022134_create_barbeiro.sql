-- US03 — Login do Barbeiro (pré-requisito) / conta única semeada
-- ⚠️ PLACEHOLDER: confirmar com o time de Banco de Dados se a tabela `barbeiro` já está
-- modelada na US12 (o título da US12 cita "clientes, serviços, agendamentos", não `barbeiro`).
-- Reutiliza a convenção `senha_hash` fixada no US01. Scaffold escrito, NÃO aplicado:
-- o banco (Postgres) ainda não está configurado no projeto.

CREATE TABLE barbeiro (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);