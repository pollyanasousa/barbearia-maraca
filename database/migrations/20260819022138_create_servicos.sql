-- US03 — Cadastro de Serviços do Barbeiro
-- ⚠️ PLACEHOLDER: tabela `servicos` já modelada na US12 ("clientes, serviços, agendamentos"),
-- ainda não confirmada aqui — confirmar nomes/tipos/constraints com o time de Banco de Dados.
-- Preço em NUMERIC (nunca float). Sem barbeiro_id: sistema tem barbeiro único (Escopo 2.2).
-- Scaffold escrito, NÃO aplicado: o banco (Postgres) ainda não está configurado no projeto.

CREATE TABLE servicos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);