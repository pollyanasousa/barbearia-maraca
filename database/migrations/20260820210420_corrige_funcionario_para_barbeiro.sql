-- =========================================================
-- Barbearia Maracá — Migration de correção
-- Origem: análise do DDL (database/analise_ddl_barbearia_maraca.md.pdf),
-- Agente Arquiteto & SQL — Squad Maracá Tech.
-- Corrige os 4 desvios identificados contra o Escopo (Seção 2):
--   1) funcionario -> barbeiro (administrador único, não múltiplos funcionários)
--   2) remove is_admin e ativo (redundantes para registro único)
--   3) adiciona UNIQUE em horario_trabalho (evita duplicar dia/horário)
--   4) is_admin em inglês é removido junto com o item 2
-- =========================================================

-- Decisão de design (documentada, não é desvio): autenticação é
-- centralizada em `usuario` (com `tipo_usuario` ENUM discriminando a
-- persona), em vez de duplicar senha_hash em cliente/barbeiro. Mantido
-- por ser mais limpo que a especificação literal; registrado aqui para
-- não gerar confusão em cards futuros.

-- 1) Renomeia o valor do ENUM que discrimina a persona
ALTER TYPE tipo_usuario RENAME VALUE 'funcionario' TO 'barbeiro';

-- 1) Renomeia a tabela
ALTER TABLE funcionario RENAME TO barbeiro;

-- 2) Remove colunas redundantes (barbeiro único = admin por definição;
--    não existe "desativar" um barbeiro único nesta versão do escopo)
ALTER TABLE barbeiro DROP COLUMN is_admin;
ALTER TABLE barbeiro DROP COLUMN ativo;

-- 1) Renomeia FKs e índices dependentes
ALTER TABLE horario_trabalho RENAME COLUMN funcionario_id TO barbeiro_id;
ALTER INDEX idx_horario_trabalho_funcionario RENAME TO idx_horario_trabalho_barbeiro;

ALTER TABLE agendamento RENAME COLUMN funcionario_id TO barbeiro_id;
ALTER INDEX idx_agendamento_funcionario RENAME TO idx_agendamento_barbeiro;

-- 1) Renomeia a trigger para manter consistência de nomenclatura
ALTER TRIGGER trg_funcionario_updated_at ON barbeiro RENAME TO trg_barbeiro_updated_at;

-- 3) Impede horários duplicados para o mesmo barbeiro/dia/intervalo
ALTER TABLE horario_trabalho
    ADD CONSTRAINT uq_horario_trabalho_barbeiro_dia_horario
    UNIQUE (barbeiro_id, dia_semana, hora_inicio, hora_fim);
