-- =====================================================================
-- 004_initial_data.sql
-- Dados de apoio para ambiente local / testes (idempotente)
-- =====================================================================

USE ClinicaEscolaAnamnese;
GO

-- Aluno de teste
IF NOT EXISTS (SELECT 1 FROM dbo.alunos WHERE email = N'aluno.estetica@senac.br')
BEGIN
    INSERT INTO dbo.alunos (nome, email)
    VALUES (N'Aluno Estética Senac', N'aluno.estetica@senac.br');
END;
GO
