-- US01 — Cadastro de Conta do Cliente
-- ⚠️ PLACEHOLDER: tabela `clientes` já modelada na US12, ainda não confirmada aqui.
-- Antes de aplicar em um banco real, confirmar o schema com a US12 (nomes de coluna,
-- tipos, constraints). Se divergir, ajustar o card US01 antes de aplicar.
-- Scaffold escrito, NÃO aplicado: o banco (Postgres) ainda não está configurado no projeto.

CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
