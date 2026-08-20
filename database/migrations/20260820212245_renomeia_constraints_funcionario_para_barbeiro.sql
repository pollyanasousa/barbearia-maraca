-- =========================================================
-- Barbearia Maracá — Migration de correção (complemento)
-- Renomear a tabela `funcionario` para `barbeiro` (migration anterior,
-- 20260820210420) não renomeia automaticamente os nomes internos de
-- constraints/índices herdados da criação original. Esta migration
-- termina o alinhamento de nomenclatura.
-- =========================================================

ALTER TABLE barbeiro RENAME CONSTRAINT funcionario_pkey TO barbeiro_pkey;
ALTER TABLE barbeiro RENAME CONSTRAINT funcionario_usuario_id_key TO barbeiro_usuario_id_key;
ALTER TABLE barbeiro RENAME CONSTRAINT funcionario_usuario_id_fkey TO barbeiro_usuario_id_fkey;

ALTER TABLE horario_trabalho RENAME CONSTRAINT horario_trabalho_funcionario_id_fkey TO horario_trabalho_barbeiro_id_fkey;

ALTER TABLE agendamento RENAME CONSTRAINT agendamento_funcionario_id_fkey TO agendamento_barbeiro_id_fkey;
ALTER TABLE agendamento RENAME CONSTRAINT agendamento_funcionario_id_tstzrange_excl TO agendamento_barbeiro_id_tstzrange_excl;
