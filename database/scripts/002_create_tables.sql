-- =====================================================================
-- 002_create_tables.sql
-- Criação de tabelas, constraints e tipos no SQL Server
-- =====================================================================

USE ClinicaEscolaAnamnese;
GO

-- ---------------------------------------------------------------------
-- 1. Alunos
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.alunos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.alunos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL CONSTRAINT UQ_alunos_email UNIQUE,
        criado_em DATETIME2 NOT NULL CONSTRAINT DF_alunos_criado_em DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- ---------------------------------------------------------------------
-- 2. Pacientes
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.pacientes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.pacientes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cpf NVARCHAR(20) NOT NULL CONSTRAINT UQ_pacientes_cpf UNIQUE,
        nome NVARCHAR(255) NOT NULL,
        endereco NVARCHAR(255) NULL,
        bairro NVARCHAR(100) NULL,
        cidade NVARCHAR(100) NULL,
        telefones NVARCHAR(100) NULL,
        nacionalidade NVARCHAR(100) NULL,
        naturalidade NVARCHAR(100) NULL,
        estado_civil NVARCHAR(50) NULL,
        data_nascimento NVARCHAR(20) NULL,
        profissao NVARCHAR(100) NULL,
        email NVARCHAR(255) NULL,
        contato_emergencia NVARCHAR(100) NULL,
        telefone_emergencia NVARCHAR(100) NULL,
        criado_em DATETIME2 NOT NULL CONSTRAINT DF_pacientes_criado_em DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 NOT NULL CONSTRAINT DF_pacientes_atualizado_em DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- ---------------------------------------------------------------------
-- 3. Fichas (Cabeçalho compartilhado Facial e Corporal)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.fichas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.fichas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        paciente_id INT NOT NULL CONSTRAINT FK_fichas_pacientes FOREIGN KEY REFERENCES dbo.pacientes(id),
        aluno_id INT NOT NULL CONSTRAINT FK_fichas_alunos FOREIGN KEY REFERENCES dbo.alunos(id),
        tipo NVARCHAR(20) NOT NULL CONSTRAINT CK_fichas_tipo CHECK (tipo IN (N'facial', N'corporal')),
        versao INT NOT NULL CONSTRAINT CK_fichas_versao CHECK (versao >= 1),
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_fichas_status DEFAULT N'rascunho' CONSTRAINT CK_fichas_status CHECK (status IN (N'rascunho', N'concluida')),
        procedimento NVARCHAR(255) NULL,
        data_avaliacao NVARCHAR(30) NULL,
        queixa_principal NVARCHAR(MAX) NULL,
        hda NVARCHAR(MAX) NULL,
        criado_em DATETIME2 NOT NULL CONSTRAINT DF_fichas_criado_em DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 NOT NULL CONSTRAINT DF_fichas_atualizado_em DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_fichas_paciente_tipo_versao UNIQUE (paciente_id, tipo, versao)
    );
END;
GO

-- ---------------------------------------------------------------------
-- 4. Ficha Facial (1:1 com fichas)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.ficha_facial', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ficha_facial (
        ficha_id INT PRIMARY KEY CONSTRAINT FK_ficha_facial_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        usa_medicamento TINYINT NULL CONSTRAINT CK_ff_usa_medicamento CHECK (usa_medicamento IN (0, 1)),
        uso_prolongado TINYINT NULL CONSTRAINT CK_ff_uso_prolongado CHECK (uso_prolongado IN (0, 1)),
        duracao_prescricao NVARCHAR(255) NULL,
        alteracoes_tireoide TINYINT NULL CONSTRAINT CK_ff_alteracoes_tireoide CHECK (alteracoes_tireoide IN (0, 1)),
        hepatite TINYINT NULL CONSTRAINT CK_ff_hepatite CHECK (hepatite IN (0, 1)),
        antecedentes_oncologicos TINYINT NULL CONSTRAINT CK_ff_antecedentes_oncologicos CHECK (antecedentes_oncologicos IN (0, 1)),
        problemas_endocrinos TINYINT NULL CONSTRAINT CK_ff_problemas_endocrinos CHECK (problemas_endocrinos IN (0, 1)),
        diabetes TINYINT NULL CONSTRAINT CK_ff_diabetes CHECK (diabetes IN (0, 1)),
        procedimento_cirurgico TINYINT NULL CONSTRAINT CK_ff_procedimento_cirurgico CHECK (procedimento_cirurgico IN (0, 1)),
        rinite TINYINT NULL CONSTRAINT CK_ff_rinite CHECK (rinite IN (0, 1)),
        psoriase TINYINT NULL CONSTRAINT CK_ff_psoriase CHECK (psoriase IN (0, 1)),
        dermatites_cutaneas TINYINT NULL CONSTRAINT CK_ff_dermatites_cutaneas CHECK (dermatites_cutaneas IN (0, 1)),
        pressao_arterial NVARCHAR(50) NULL CONSTRAINT CK_ff_pressao_arterial CHECK (pressao_arterial IN (N'hipertensao', N'hipotensao', N'normal')),
        faz_controle NVARCHAR(255) NULL,
        medicamento_pressao NVARCHAR(255) NULL,
        alergias NVARCHAR(MAX) NULL,
        usa_maquiagem TINYINT NULL CONSTRAINT CK_ff_usa_maquiagem CHECK (usa_maquiagem IN (0, 1)),
        alergia_medicamentos_cosmeticos TINYINT NULL CONSTRAINT CK_ff_alergia_med_cosm CHECK (alergia_medicamentos_cosmeticos IN (0, 1)),
        obs_maquiagem NVARCHAR(MAX) NULL,
        fumante TINYINT NULL CONSTRAINT CK_ff_fumante CHECK (fumante IN (0, 1)),
        atividade_fisica TINYINT NULL CONSTRAINT CK_ff_atividade_fisica CHECK (atividade_fisica IN (0, 1)),
        tipo_alimentacao NVARCHAR(255) NULL,
        numero_refeicoes INT NULL CONSTRAINT CK_ff_numero_refeicoes CHECK (numero_refeicoes >= 0),
        obs_estilo_vida NVARCHAR(MAX) NULL,
        ciclo_menstrual NVARCHAR(255) NULL,
        idade_menopausa INT NULL CONSTRAINT CK_ff_idade_menopausa CHECK (idade_menopausa BETWEEN 0 AND 120),
        idade_andropausa INT NULL CONSTRAINT CK_ff_idade_andropausa CHECK (idade_andropausa BETWEEN 0 AND 120),
        qualidade_sono NVARCHAR(255) NULL,
        horas_sono FLOAT NULL CONSTRAINT CK_ff_horas_sono CHECK (horas_sono BETWEEN 0 AND 24),
        obs_ciclo_sono NVARCHAR(MAX) NULL,
        biotipo_cutaneo NVARCHAR(50) NULL CONSTRAINT CK_ff_biotipo_cutaneo CHECK (biotipo_cutaneo IN (N'normal', N'mista', N'lipidica', N'alipica')),
        tonus_muscular NVARCHAR(50) NULL CONSTRAINT CK_ff_tonus_muscular CHECK (tonus_muscular IN (N'normal', N'hipotonico', N'hipertonico')),
        grau_hidratacao NVARCHAR(50) NULL CONSTRAINT CK_ff_grau_hidratacao CHECK (grau_hidratacao IN (N'desidratada', N'normal')),
        grau_acne NVARCHAR(50) NULL CONSTRAINT CK_ff_grau_acne CHECK (grau_acne IN (N'grau_i', N'grau_ii', N'grau_iii', N'grau_iv')),
        profundidade_tsuji NVARCHAR(50) NULL CONSTRAINT CK_ff_profundidade_tsuji CHECK (profundidade_tsuji IN (N'superficial', N'profunda')),
        fototipo NVARCHAR(20) NULL CONSTRAINT CK_ff_fototipo CHECK (fototipo IN (N'i', N'ii', N'iii', N'iv', N'v', N'vi'))
    );
END;
GO

-- ---------------------------------------------------------------------
-- 5. Ficha Corporal (1:1 com fichas)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.ficha_corporal', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ficha_corporal (
        ficha_id INT PRIMARY KEY CONSTRAINT FK_ficha_corporal_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        etilismo TINYINT NULL CONSTRAINT CK_fc_etilismo CHECK (etilismo IN (0, 1)),
        tabagismo TINYINT NULL CONSTRAINT CK_fc_tabagismo CHECK (tabagismo IN (0, 1)),
        alteracoes_sono TINYINT NULL CONSTRAINT CK_fc_alteracoes_sono CHECK (alteracoes_sono IN (0, 1)),
        permanece_sentada TINYINT NULL CONSTRAINT CK_fc_permanece_sentada CHECK (permanece_sentada IN (0, 1)),
        ortostase_prolongada TINYINT NULL CONSTRAINT CK_fc_ortostase_prolongada CHECK (ortostase_prolongada IN (0, 1)),
        pratica_esporte TINYINT NULL CONSTRAINT CK_fc_pratica_esporte CHECK (pratica_esporte IN (0, 1)),
        dieta_orientada TINYINT NULL CONSTRAINT CK_fc_dieta_orientada CHECK (dieta_orientada IN (0, 1)),
        alimentacao_hipercalorica TINYINT NULL CONSTRAINT CK_fc_alimentacao_hipercalorica CHECK (alimentacao_hipercalorica IN (0, 1)),
        ingestao_agua TINYINT NULL CONSTRAINT CK_fc_ingestao_agua CHECK (ingestao_agua IN (0, 1)),
        exposicao_sol TINYINT NULL CONSTRAINT CK_fc_exposicao_sol CHECK (exposicao_sol IN (0, 1)),
        refeicoes_diarias INT NULL CONSTRAINT CK_fc_refeicoes_diarias CHECK (refeicoes_diarias >= 0),
        padrao_intestinal_normal TINYINT NULL CONSTRAINT CK_fc_padrao_intestinal_normal CHECK (padrao_intestinal_normal IN (0, 1)),
        sono_8h TINYINT NULL CONSTRAINT CK_fc_sono_8h CHECK (sono_8h IN (0, 1)),
        ciclo_menstrual_normal TINYINT NULL CONSTRAINT CK_fc_ciclo_menstrual_normal CHECK (ciclo_menstrual_normal IN (0, 1)),
        menopausa TINYINT NULL CONSTRAINT CK_fc_menopausa CHECK (menopausa IN (0, 1)),
        gestante TINYINT NULL CONSTRAINT CK_fc_gestante CHECK (gestante IN (0, 1)),
        diabetes TINYINT NULL CONSTRAINT CK_fc_diabetes CHECK (diabetes IN (0, 1)),
        hipertensao TINYINT NULL CONSTRAINT CK_fc_hipertensao CHECK (hipertensao IN (0, 1)),
        marcapasso TINYINT NULL CONSTRAINT CK_fc_marcapasso CHECK (marcapasso IN (0, 1)),
        doenca_endocrina TINYINT NULL CONSTRAINT CK_fc_doenca_endocrina CHECK (doenca_endocrina IN (0, 1)),
        doenca_dermica TINYINT NULL CONSTRAINT CK_fc_doenca_dermica CHECK (doenca_dermica IN (0, 1)),
        patologia_cardiaca TINYINT NULL CONSTRAINT CK_fc_patologia_cardiaca CHECK (patologia_cardiaca IN (0, 1)),
        epilepsia TINYINT NULL CONSTRAINT CK_fc_epilepsia CHECK (epilepsia IN (0, 1)),
        varizes TINYINT NULL CONSTRAINT CK_fc_varizes CHECK (varizes IN (0, 1)),
        trombose TINYINT NULL CONSTRAINT CK_fc_trombose CHECK (trombose IN (0, 1)),
        fragilidade_capilar TINYINT NULL CONSTRAINT CK_fc_fragilidade_capilar CHECK (fragilidade_capilar IN (0, 1)),
        antecedentes_oncologicos TINYINT NULL CONSTRAINT CK_fc_antecedentes_oncologicos CHECK (antecedentes_oncologicos IN (0, 1)),
        alergias TINYINT NULL CONSTRAINT CK_fc_alergias CHECK (alergias IN (0, 1)),
        cirurgias_recentes TINYINT NULL CONSTRAINT CK_fc_cirurgias_recentes CHECK (cirurgias_recentes IN (0, 1)),
        medicamento_em_uso TINYINT NULL CONSTRAINT CK_fc_medicamento_em_uso CHECK (medicamento_em_uso IN (0, 1)),
        cosmetico_em_uso TINYINT NULL CONSTRAINT CK_fc_cosmetico_em_uso CHECK (cosmetico_em_uso IN (0, 1)),
        tratamentos_esteticos TINYINT NULL CONSTRAINT CK_fc_tratamentos_esteticos CHECK (tratamentos_esteticos IN (0, 1)),
        aspecto_pele NVARCHAR(50) NULL CONSTRAINT CK_fc_aspecto_pele CHECK (aspecto_pele IN (N'hidratada', N'desidratada')),
        gordura_localizada NVARCHAR(50) NULL CONSTRAINT CK_fc_gordura_localizada CHECK (gordura_localizada IN (N'ginecoide', N'androide')),
        estrias TINYINT NULL CONSTRAINT CK_fc_estrias CHECK (estrias IN (0, 1)),
        equimoses TINYINT NULL CONSTRAINT CK_fc_equimoses CHECK (equimoses IN (0, 1)),
        edemas TINYINT NULL CONSTRAINT CK_fc_edemas CHECK (edemas IN (0, 1)),
        alteracao_temperatura TINYINT NULL CONSTRAINT CK_fc_alteracao_temperatura CHECK (alteracao_temperatura IN (0, 1)),
        flacidez TINYINT NULL CONSTRAINT CK_fc_flacidez CHECK (flacidez IN (0, 1)),
        fibroedema_geloide TINYINT NULL CONSTRAINT CK_fc_fibroedema_geloide CHECK (fibroedema_geloide IN (0, 1)),
        obs_gerais NVARCHAR(MAX) NULL,
        peso_kg FLOAT NULL CONSTRAINT CK_fc_peso_kg CHECK (peso_kg > 0),
        estatura_m FLOAT NULL CONSTRAINT CK_fc_estatura_m CHECK (estatura_m > 0),
        referencia_rcq NVARCHAR(20) NULL CONSTRAINT CK_fc_referencia_rcq CHECK (referencia_rcq IN (N'feminino', N'masculino')),
        imc FLOAT NULL,
        rcq FLOAT NULL,
        perimetria_data_inicio NVARCHAR(30) NULL,
        perimetria_data_durante NVARCHAR(30) NULL,
        perimetria_data_alta NVARCHAR(30) NULL,
        plicometria_data_inicio NVARCHAR(30) NULL,
        plicometria_data_durante NVARCHAR(30) NULL,
        plicometria_data_alta NVARCHAR(30) NULL,
        bioimpedancia_gordura FLOAT NULL CONSTRAINT CK_fc_bioimpedancia CHECK (bioimpedancia_gordura BETWEEN 0 AND 100)
    );
END;
GO

-- ---------------------------------------------------------------------
-- 6. Ficha Opções (Múltipla Escolha 1:N)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.ficha_opcoes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ficha_opcoes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ficha_id INT NOT NULL CONSTRAINT FK_ficha_opcoes_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        grupo NVARCHAR(100) NOT NULL,
        opcao NVARCHAR(100) NOT NULL,
        CONSTRAINT UQ_ficha_opcoes UNIQUE (ficha_id, grupo, opcao)
    );
END;
GO

-- ---------------------------------------------------------------------
-- 7. Ficha Anexos (Arquivos / Liberação Médica 1:N)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.ficha_anexos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ficha_anexos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ficha_id INT NOT NULL CONSTRAINT FK_ficha_anexos_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        nome_arquivo NVARCHAR(255) NOT NULL,
        tipo_mime NVARCHAR(100) NOT NULL,
        tamanho_bytes INT NOT NULL CONSTRAINT CK_fa_tamanho CHECK (tamanho_bytes >= 0),
        conteudo VARBINARY(MAX) NOT NULL,
        criado_em DATETIME2 NOT NULL CONSTRAINT DF_ficha_anexos_criado_em DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- ---------------------------------------------------------------------
-- 8. Mapa Marcações (1:N)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.mapa_marcacoes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.mapa_marcacoes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ficha_id INT NOT NULL CONSTRAINT FK_mapa_marcacoes_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        ordem INT NOT NULL,
        vista NVARCHAR(50) NOT NULL CONSTRAINT CK_mm_vista CHECK (vista IN (N'perfil_direito', N'frontal', N'perfil_esquerdo', N'perfil', N'posterior')),
        pos_x FLOAT NOT NULL CONSTRAINT CK_mm_pos_x CHECK (pos_x BETWEEN 0 AND 100),
        pos_y FLOAT NOT NULL CONSTRAINT CK_mm_pos_y CHECK (pos_y BETWEEN 0 AND 100),
        alteracao NVARCHAR(50) NULL CONSTRAINT CK_mm_alteracao CHECK (alteracao IN (N'estrias', N'flacidez', N'gordura_localizada', N'fibroedema_geloide')),
        grau NVARCHAR(20) NULL CONSTRAINT CK_mm_grau CHECK (grau IN (N'grau_i', N'grau_ii', N'grau_iii', N'grau_iv')),
        descricao NVARCHAR(MAX) NULL
    );
END;
GO

-- ---------------------------------------------------------------------
-- 9. Medidas Corporais (1:N)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.medidas_corporais', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.medidas_corporais (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ficha_id INT NOT NULL CONSTRAINT FK_medidas_corporais_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        tipo NVARCHAR(20) NOT NULL CONSTRAINT CK_mc_tipo CHECK (tipo IN (N'perimetria', N'plicometria')),
        regiao NVARCHAR(100) NOT NULL,
        inicio FLOAT NULL CONSTRAINT CK_mc_inicio CHECK (inicio >= 0),
        durante FLOAT NULL CONSTRAINT CK_mc_durante CHECK (durante >= 0),
        alta FLOAT NULL CONSTRAINT CK_mc_alta CHECK (alta >= 0),
        CONSTRAINT UQ_medidas_corporais UNIQUE (ficha_id, tipo, regiao)
    );
END;
GO

-- ---------------------------------------------------------------------
-- 10. Evoluções (1:N)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.evolucoes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.evolucoes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ficha_id INT NOT NULL CONSTRAINT FK_evolucoes_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        data NVARCHAR(30) NOT NULL,
        descricao NVARCHAR(MAX) NOT NULL,
        assinatura_aluno NVARCHAR(255) NULL,
        criado_em DATETIME2 NOT NULL CONSTRAINT DF_evolucoes_criado_em DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- ---------------------------------------------------------------------
-- 11. TCLE Aceites (1:1 com fichas)
-- ---------------------------------------------------------------------
IF OBJECT_ID(N'dbo.tcle_aceites', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.tcle_aceites (
        ficha_id INT PRIMARY KEY CONSTRAINT FK_tcle_aceites_fichas FOREIGN KEY REFERENCES dbo.fichas(id) ON DELETE CASCADE,
        aceito TINYINT NOT NULL CONSTRAINT DF_tcle_aceito DEFAULT 0 CONSTRAINT CK_tcle_aceito CHECK (aceito IN (0, 1)),
        assinatura_png VARBINARY(MAX) NULL,
        aceito_em NVARCHAR(50) NULL
    );
END;
GO
