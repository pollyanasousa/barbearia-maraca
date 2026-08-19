-- =========================================================
-- Barbearia Maracá — Seed (dados de teste)
-- Rodar DEPOIS do barbearia_maraca_ddl.sql
-- =========================================================

-- Usuários (1 funcionário admin + 1 cliente)
INSERT INTO usuario (email, senha_hash, tipo) VALUES
('admin@barbeariamaraca.com', 'hash_temporario_1', 'funcionario'),
('cliente1@teste.com', 'hash_temporario_2', 'cliente');

-- Funcionário vinculado ao primeiro usuário
INSERT INTO funcionario (usuario_id, nome, is_admin)
SELECT id, 'João Barbeiro', true FROM usuario WHERE email = 'admin@barbeariamaraca.com';

-- Cliente vinculado ao segundo usuário
INSERT INTO cliente (usuario_id, nome, telefone)
SELECT id, 'Carlos Silva', '85999999999' FROM usuario WHERE email = 'cliente1@teste.com';

-- Serviço
INSERT INTO servico (nome, duracao_minutos, preco) VALUES
('Corte Masculino', 30, 35.00);

-- Horário de trabalho do funcionário (segunda a sexta, 8h-18h)
INSERT INTO horario_trabalho (funcionario_id, dia_semana, hora_inicio, hora_fim)
SELECT id, dia, '08:00', '18:00'
FROM funcionario, generate_series(1,5) AS dia
WHERE nome = 'João Barbeiro';

-- Agendamento de teste (válido)
INSERT INTO agendamento (cliente_id, funcionario_id, servico_id, data_hora_inicio, data_hora_fim)
SELECT c.id, f.id, s.id, '2026-08-20 10:00:00-03', '2026-08-20 10:30:00-03'
FROM cliente c, funcionario f, servico s
WHERE c.nome = 'Carlos Silva' AND f.nome = 'João Barbeiro' AND s.nome = 'Corte Masculino';