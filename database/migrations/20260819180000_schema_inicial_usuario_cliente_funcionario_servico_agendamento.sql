-- =========================================================
-- Barbearia Maracá — DDL inicial
-- Origem: time de Banco de Dados, branch origin/develop
-- (database/barbearia_maraca_ddl.sql), trazido para
-- database/migrations/ com timestamp, sem alteração de conteúdo.
-- Substitui os placeholders de clientes/barbeiro/servicos criados
-- anteriormente pelo Desenvolvedor (US01/US02/US03) — este é o
-- schema real e definitivo (US12).
-- =========================================================

-- Extensão necessária para a constraint EXCLUDE (conflito de horário)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE tipo_usuario AS ENUM ('cliente', 'funcionario');

CREATE TYPE status_agendamento AS ENUM (
    'pendente',
    'confirmado',
    'cancelado',
    'concluido'
);

-- =========================================================
-- TABELA: usuario
-- =========================================================
CREATE TABLE usuario (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    senha_hash    VARCHAR(255) NOT NULL,
    tipo          tipo_usuario NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- TABELA: cliente
-- =========================================================
CREATE TABLE cliente (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    BIGINT NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
    nome          VARCHAR(150) NOT NULL,
    telefone      VARCHAR(20),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- TABELA: funcionario
-- =========================================================
CREATE TABLE funcionario (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    BIGINT NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
    nome          VARCHAR(150) NOT NULL,
    telefone      VARCHAR(20),
    is_admin      BOOLEAN NOT NULL DEFAULT false,
    ativo         BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- TABELA: servico
-- =========================================================
CREATE TABLE servico (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    descricao         TEXT,
    duracao_minutos   INTEGER NOT NULL CHECK (duracao_minutos > 0),
    preco             DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    ativo             BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- TABELA: horario_trabalho
-- =========================================================
CREATE TABLE horario_trabalho (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id  BIGINT NOT NULL REFERENCES funcionario(id) ON DELETE CASCADE,
    dia_semana      SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo ... 6=sábado
    hora_inicio     TIME NOT NULL,
    hora_fim        TIME NOT NULL,
    CHECK (hora_fim > hora_inicio)
);

CREATE INDEX idx_horario_trabalho_funcionario ON horario_trabalho(funcionario_id);

-- =========================================================
-- TABELA: agendamento
-- =========================================================
CREATE TABLE agendamento (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id          BIGINT NOT NULL REFERENCES cliente(id) ON DELETE RESTRICT,
    funcionario_id      BIGINT NOT NULL REFERENCES funcionario(id) ON DELETE RESTRICT,
    servico_id          BIGINT NOT NULL REFERENCES servico(id) ON DELETE RESTRICT,
    data_hora_inicio    TIMESTAMPTZ NOT NULL,
    data_hora_fim       TIMESTAMPTZ NOT NULL,
    status              status_agendamento NOT NULL DEFAULT 'pendente',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (data_hora_fim > data_hora_inicio),

    -- Impede que o MESMO funcionário tenha dois agendamentos com horário sobreposto,
    -- exceto se um deles estiver cancelado.
    EXCLUDE USING gist (
        funcionario_id WITH =,
        tstzrange(data_hora_inicio, data_hora_fim) WITH &&
    ) WHERE (status <> 'cancelado')
);

CREATE INDEX idx_agendamento_cliente ON agendamento(cliente_id);
CREATE INDEX idx_agendamento_funcionario ON agendamento(funcionario_id);
CREATE INDEX idx_agendamento_servico ON agendamento(servico_id);
CREATE INDEX idx_agendamento_data ON agendamento(data_hora_inicio);

-- =========================================================
-- TRIGGER: atualizar updated_at automaticamente
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cliente_updated_at
    BEFORE UPDATE ON cliente
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_funcionario_updated_at
    BEFORE UPDATE ON funcionario
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_servico_updated_at
    BEFORE UPDATE ON servico
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_agendamento_updated_at
    BEFORE UPDATE ON agendamento
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
