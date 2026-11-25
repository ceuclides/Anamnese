-- =====================================================================
-- 003_create_indexes_views.sql
-- Índices para performance e View consolidada de resumos no SQL Server
-- =====================================================================

USE ClinicaEscolaAnamnese;
GO

-- Índices
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_fichas_paciente_tipo' AND object_id = OBJECT_ID(N'dbo.fichas'))
    CREATE INDEX IX_fichas_paciente_tipo ON dbo.fichas (paciente_id, tipo, versao DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ficha_opcoes_ficha' AND object_id = OBJECT_ID(N'dbo.ficha_opcoes'))
    CREATE INDEX IX_ficha_opcoes_ficha ON dbo.ficha_opcoes (ficha_id);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_ficha_anexos_ficha' AND object_id = OBJECT_ID(N'dbo.ficha_anexos'))
    CREATE INDEX IX_ficha_anexos_ficha ON dbo.ficha_anexos (ficha_id);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_mapa_marcacoes_ficha' AND object_id = OBJECT_ID(N'dbo.mapa_marcacoes'))
    CREATE INDEX IX_mapa_marcacoes_ficha ON dbo.mapa_marcacoes (ficha_id);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_medidas_ficha' AND object_id = OBJECT_ID(N'dbo.medidas_corporais'))
    CREATE INDEX IX_medidas_ficha ON dbo.medidas_corporais (ficha_id);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_evolucoes_ficha' AND object_id = OBJECT_ID(N'dbo.evolucoes'))
    CREATE INDEX IX_evolucoes_ficha ON dbo.evolucoes (ficha_id, data);
GO

-- View
CREATE OR ALTER VIEW dbo.vw_fichas_resumo AS
SELECT
    f.id,
    f.tipo,
    f.versao,
    f.status,
    f.procedimento,
    f.data_avaliacao,
    p.cpf   AS paciente_cpf,
    p.nome  AS paciente_nome,
    a.nome  AS aluno_nome,
    a.email AS aluno_email,
    ISNULL(t.aceito, 0) AS tcle_aceito,
    CASE WHEN t.assinatura_png IS NOT NULL THEN 1 ELSE 0 END AS tcle_assinado,
    f.criado_em,
    f.atualizado_em
FROM dbo.fichas f
JOIN dbo.pacientes p ON p.id = f.paciente_id
JOIN dbo.alunos    a ON a.id = f.aluno_id
LEFT JOIN dbo.tcle_aceites t ON t.ficha_id = f.id;
GO
