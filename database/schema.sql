-- =====================================================================
--  Clínica-Escola Senac — Fichas de Anamnese (Facial e Corporal)
--  SGBD: SQLite 3.38+
--
--  Execução manual:   sqlite3 database/clinica.db < database/schema.sql
--  Ou pela API local: pnpm db:init
--
--  Convenções
--  • Datas no formato ISO-8601 (TEXT): 'AAAA-MM-DD' ou 'AAAA-MM-DDTHH:MM:SSZ'.
--  • Respostas Sim/Não: INTEGER 1 = Sim, 0 = Não, NULL = não respondido.
--  • Opções únicas (radio) são gravadas pelo código definido em
--    shared/constants/*.ts; opções múltiplas (checkbox) ficam em ficha_opcoes.
--  • O script é idempotente (IF NOT EXISTS) e pode ser executado várias vezes.
-- =====================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ---------------------------------------------------------------------
--  Pessoas
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS alunos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nome          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  criado_em     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pacientes (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf                  TEXT    NOT NULL UNIQUE,
  nome                 TEXT    NOT NULL,
  endereco             TEXT,
  bairro               TEXT,
  cidade               TEXT,
  telefones            TEXT,
  nacionalidade        TEXT,
  naturalidade         TEXT,
  estado_civil         TEXT,
  data_nascimento      TEXT,
  profissao            TEXT,
  email                TEXT,
  contato_emergencia   TEXT,
  telefone_emergencia  TEXT,
  criado_em            TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  atualizado_em        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ---------------------------------------------------------------------
--  Ficha (cabeçalho comum às duas anamneses)
--  Uma ficha pertence a um paciente e foi registrada por um aluno.
--  Cada salvamento concluído gera uma nova versão (v1, v2, ...).
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fichas (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id       INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  aluno_id          INTEGER NOT NULL REFERENCES alunos(id)    ON DELETE RESTRICT,
  tipo              TEXT    NOT NULL CHECK (tipo IN ('facial', 'corporal')),
  versao            INTEGER NOT NULL CHECK (versao >= 1),
  status            TEXT    NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'concluida')),
  procedimento      TEXT,
  data_avaliacao    TEXT,
  queixa_principal  TEXT,
  hda               TEXT,
  criado_em         TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  atualizado_em     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (paciente_id, tipo, versao)
);

CREATE INDEX IF NOT EXISTS idx_fichas_paciente_tipo ON fichas (paciente_id, tipo, versao DESC);

-- ---------------------------------------------------------------------
--  Detalhe da Anamnese Facial (1:1 com fichas)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ficha_facial (
  ficha_id                         INTEGER PRIMARY KEY REFERENCES fichas(id) ON DELETE CASCADE,

  -- Seção 02 · Dados clínicos — Medicamentos
  usa_medicamento                  INTEGER CHECK (usa_medicamento IN (0, 1)),
  uso_prolongado                   INTEGER CHECK (uso_prolongado IN (0, 1)),
  duracao_prescricao               TEXT,

  -- Seção 03 · Antecedentes patológicos
  alteracoes_tireoide              INTEGER CHECK (alteracoes_tireoide IN (0, 1)),
  hepatite                         INTEGER CHECK (hepatite IN (0, 1)),
  antecedentes_oncologicos         INTEGER CHECK (antecedentes_oncologicos IN (0, 1)),
  problemas_endocrinos             INTEGER CHECK (problemas_endocrinos IN (0, 1)),
  diabetes                         INTEGER CHECK (diabetes IN (0, 1)),
  procedimento_cirurgico           INTEGER CHECK (procedimento_cirurgico IN (0, 1)),
  rinite                           INTEGER CHECK (rinite IN (0, 1)),
  psoriase                         INTEGER CHECK (psoriase IN (0, 1)),
  dermatites_cutaneas              INTEGER CHECK (dermatites_cutaneas IN (0, 1)),

  -- Seção 03 · Pressão arterial e alergias
  pressao_arterial                 TEXT CHECK (pressao_arterial IN ('hipertensao', 'hipotensao', 'normal')),
  faz_controle                     TEXT,
  medicamento_pressao              TEXT,
  alergias                         TEXT,

  -- Seção 03 · Maquiagem e cosméticos
  usa_maquiagem                    INTEGER CHECK (usa_maquiagem IN (0, 1)),
  alergia_medicamentos_cosmeticos  INTEGER CHECK (alergia_medicamentos_cosmeticos IN (0, 1)),
  obs_maquiagem                    TEXT,

  -- Seção 03 · Estilo de vida
  fumante                          INTEGER CHECK (fumante IN (0, 1)),
  atividade_fisica                 INTEGER CHECK (atividade_fisica IN (0, 1)),
  tipo_alimentacao                 TEXT,
  numero_refeicoes                 INTEGER CHECK (numero_refeicoes >= 0),
  obs_estilo_vida                  TEXT,

  -- Seção 03 · Ciclo hormonal e sono
  ciclo_menstrual                  TEXT,
  idade_menopausa                  INTEGER CHECK (idade_menopausa BETWEEN 0 AND 120),
  idade_andropausa                 INTEGER CHECK (idade_andropausa BETWEEN 0 AND 120),
  qualidade_sono                   TEXT,
  horas_sono                       REAL    CHECK (horas_sono BETWEEN 0 AND 24),
  obs_ciclo_sono                   TEXT,

  -- Seção 04 · Exame físico facial
  biotipo_cutaneo                  TEXT CHECK (biotipo_cutaneo IN ('normal', 'mista', 'lipidica', 'alipica')),
  tonus_muscular                   TEXT CHECK (tonus_muscular IN ('normal', 'hipotonico', 'hipertonico')),
  grau_hidratacao                  TEXT CHECK (grau_hidratacao IN ('desidratada', 'normal')),
  grau_acne                        TEXT CHECK (grau_acne IN ('grau_i', 'grau_ii', 'grau_iii', 'grau_iv')),
  profundidade_tsuji               TEXT CHECK (profundidade_tsuji IN ('superficial', 'profunda')),
  fototipo                         TEXT CHECK (fototipo IN ('i', 'ii', 'iii', 'iv', 'v', 'vi'))
);

-- ---------------------------------------------------------------------
--  Detalhe da Anamnese Corporal (1:1 com fichas)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ficha_corporal (
  ficha_id                   INTEGER PRIMARY KEY REFERENCES fichas(id) ON DELETE CASCADE,

  -- Seção 03 · Hábitos de vida
  etilismo                   INTEGER CHECK (etilismo IN (0, 1)),
  tabagismo                  INTEGER CHECK (tabagismo IN (0, 1)),
  alteracoes_sono            INTEGER CHECK (alteracoes_sono IN (0, 1)),
  permanece_sentada          INTEGER CHECK (permanece_sentada IN (0, 1)),
  ortostase_prolongada       INTEGER CHECK (ortostase_prolongada IN (0, 1)),
  pratica_esporte            INTEGER CHECK (pratica_esporte IN (0, 1)),
  dieta_orientada            INTEGER CHECK (dieta_orientada IN (0, 1)),
  alimentacao_hipercalorica  INTEGER CHECK (alimentacao_hipercalorica IN (0, 1)),
  ingestao_agua              INTEGER CHECK (ingestao_agua IN (0, 1)),
  exposicao_sol              INTEGER CHECK (exposicao_sol IN (0, 1)),
  refeicoes_diarias          INTEGER CHECK (refeicoes_diarias >= 0),

  -- Seção 04 · Antecedentes pessoais
  padrao_intestinal_normal   INTEGER CHECK (padrao_intestinal_normal IN (0, 1)),
  sono_8h                    INTEGER CHECK (sono_8h IN (0, 1)),
  ciclo_menstrual_normal     INTEGER CHECK (ciclo_menstrual_normal IN (0, 1)),
  menopausa                  INTEGER CHECK (menopausa IN (0, 1)),
  gestante                   INTEGER CHECK (gestante IN (0, 1)),
  diabetes                   INTEGER CHECK (diabetes IN (0, 1)),
  hipertensao                INTEGER CHECK (hipertensao IN (0, 1)),
  marcapasso                 INTEGER CHECK (marcapasso IN (0, 1)),
  doenca_endocrina           INTEGER CHECK (doenca_endocrina IN (0, 1)),
  doenca_dermica             INTEGER CHECK (doenca_dermica IN (0, 1)),
  patologia_cardiaca         INTEGER CHECK (patologia_cardiaca IN (0, 1)),
  epilepsia                  INTEGER CHECK (epilepsia IN (0, 1)),
  varizes                    INTEGER CHECK (varizes IN (0, 1)),
  trombose                   INTEGER CHECK (trombose IN (0, 1)),
  fragilidade_capilar        INTEGER CHECK (fragilidade_capilar IN (0, 1)),
  antecedentes_oncologicos   INTEGER CHECK (antecedentes_oncologicos IN (0, 1)),
  alergias                   INTEGER CHECK (alergias IN (0, 1)),
  cirurgias_recentes         INTEGER CHECK (cirurgias_recentes IN (0, 1)),
  medicamento_em_uso         INTEGER CHECK (medicamento_em_uso IN (0, 1)),
  cosmetico_em_uso           INTEGER CHECK (cosmetico_em_uso IN (0, 1)),
  tratamentos_esteticos      INTEGER CHECK (tratamentos_esteticos IN (0, 1)),

  -- Seção 05 · Exame físico
  aspecto_pele               TEXT CHECK (aspecto_pele IN ('hidratada', 'desidratada')),
  gordura_localizada         TEXT CHECK (gordura_localizada IN ('ginecoide', 'androide')),
  estrias                    INTEGER CHECK (estrias IN (0, 1)),
  equimoses                  INTEGER CHECK (equimoses IN (0, 1)),
  edemas                     INTEGER CHECK (edemas IN (0, 1)),
  alteracao_temperatura      INTEGER CHECK (alteracao_temperatura IN (0, 1)),
  flacidez                   INTEGER CHECK (flacidez IN (0, 1)),
  fibroedema_geloide         INTEGER CHECK (fibroedema_geloide IN (0, 1)),
  obs_gerais                 TEXT,

  -- Seção 06 · Perfil morfológico (IMC e RCQ calculados pela aplicação)
  peso_kg                    REAL CHECK (peso_kg > 0),
  estatura_m                 REAL CHECK (estatura_m > 0),
  referencia_rcq             TEXT CHECK (referencia_rcq IN ('feminino', 'masculino')),
  imc                        REAL,
  rcq                        REAL,

  -- Seção 07 · Datas das medições e bioimpedância
  perimetria_data_inicio     TEXT,
  perimetria_data_durante    TEXT,
  perimetria_data_alta       TEXT,
  plicometria_data_inicio    TEXT,
  plicometria_data_durante   TEXT,
  plicometria_data_alta      TEXT,
  bioimpedancia_gordura      REAL CHECK (bioimpedancia_gordura BETWEEN 0 AND 100)
);

-- ---------------------------------------------------------------------
--  Respostas de múltipla escolha (1:N com fichas)
--  Ex.: grupo 'condicoes' → 'epilepsia', 'protese'; grupo 'textura' → 'lisa'.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ficha_opcoes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id  INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  grupo     TEXT    NOT NULL,
  opcao     TEXT    NOT NULL,
  UNIQUE (ficha_id, grupo, opcao)
);

CREATE INDEX IF NOT EXISTS idx_ficha_opcoes_ficha ON ficha_opcoes (ficha_id);

-- ---------------------------------------------------------------------
--  Anexos de liberação médica / laudos (1:N com fichas)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ficha_anexos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id       INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  nome_arquivo   TEXT    NOT NULL,
  tipo_mime      TEXT    NOT NULL,
  tamanho_bytes  INTEGER NOT NULL CHECK (tamanho_bytes >= 0),
  conteudo       BLOB    NOT NULL,
  criado_em      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_ficha_anexos_ficha ON ficha_anexos (ficha_id);

-- ---------------------------------------------------------------------
--  Marcações nos mapas (rosto / silhueta) (1:N com fichas)
--  pos_x / pos_y: posição relativa (0–100 %) sobre a imagem.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mapa_marcacoes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id   INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  ordem      INTEGER NOT NULL,
  vista      TEXT    NOT NULL CHECK (vista IN ('perfil_direito', 'frontal', 'perfil_esquerdo', 'perfil', 'posterior')),
  pos_x      REAL    NOT NULL CHECK (pos_x BETWEEN 0 AND 100),
  pos_y      REAL    NOT NULL CHECK (pos_y BETWEEN 0 AND 100),
  alteracao  TEXT    CHECK (alteracao IN ('estrias', 'flacidez', 'gordura_localizada', 'fibroedema_geloide')),
  grau       TEXT    CHECK (grau IN ('grau_i', 'grau_ii', 'grau_iii', 'grau_iv')),
  descricao  TEXT
);

CREATE INDEX IF NOT EXISTS idx_mapa_marcacoes_ficha ON mapa_marcacoes (ficha_id);

-- ---------------------------------------------------------------------
--  Perimetria (cm) e plicometria (mm) — somente ficha corporal (1:N)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS medidas_corporais (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id  INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  tipo      TEXT    NOT NULL CHECK (tipo IN ('perimetria', 'plicometria')),
  regiao    TEXT    NOT NULL,
  inicio    REAL    CHECK (inicio  >= 0),
  durante   REAL    CHECK (durante >= 0),
  alta      REAL    CHECK (alta    >= 0),
  UNIQUE (ficha_id, tipo, regiao)
);

CREATE INDEX IF NOT EXISTS idx_medidas_ficha ON medidas_corporais (ficha_id);

-- ---------------------------------------------------------------------
--  Evolução e intercorrências — somente ficha facial (1:N)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS evolucoes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id          INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  data              TEXT    NOT NULL,
  descricao         TEXT    NOT NULL,
  assinatura_aluno  TEXT,
  criado_em         TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_evolucoes_ficha ON evolucoes (ficha_id, data);

-- ---------------------------------------------------------------------
--  Termo de Consentimento Livre e Esclarecido (1:1 com fichas)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tcle_aceites (
  ficha_id        INTEGER PRIMARY KEY REFERENCES fichas(id) ON DELETE CASCADE,
  aceito          INTEGER NOT NULL DEFAULT 0 CHECK (aceito IN (0, 1)),
  assinatura_png  BLOB,
  aceito_em       TEXT
);

-- ---------------------------------------------------------------------
--  Gatilhos de auditoria
-- ---------------------------------------------------------------------

CREATE TRIGGER IF NOT EXISTS trg_fichas_atualizado_em
AFTER UPDATE ON fichas
FOR EACH ROW WHEN NEW.atualizado_em = OLD.atualizado_em
BEGIN
  UPDATE fichas SET atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pacientes_atualizado_em
AFTER UPDATE ON pacientes
FOR EACH ROW WHEN NEW.atualizado_em = OLD.atualizado_em
BEGIN
  UPDATE pacientes SET atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

-- ---------------------------------------------------------------------
--  Visão de consulta: resumo das fichas com paciente e aluno
-- ---------------------------------------------------------------------

CREATE VIEW IF NOT EXISTS vw_fichas_resumo AS
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
  COALESCE(t.aceito, 0) AS tcle_aceito,
  (t.assinatura_png IS NOT NULL) AS tcle_assinado,
  f.criado_em,
  f.atualizado_em
FROM fichas f
JOIN pacientes p ON p.id = f.paciente_id
JOIN alunos    a ON a.id = f.aluno_id
LEFT JOIN tcle_aceites t ON t.ficha_id = f.id;
