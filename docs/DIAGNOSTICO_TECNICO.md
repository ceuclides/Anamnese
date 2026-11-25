# Diagnóstico Técnico Completo — Projeto Fichas de Anamnese (Clínica-Escola Senac)

**Data:** 25 de Novembro de 2026  
**Responsável Técnico:** Engenheiro de Software Sênior & Arquiteto de Soluções  
**Documento:** Marco M1 — Diagnóstico Técnico Conforme `INTRUCTIONS.md`

---

## 1. Resumo Executivo

O projeto **Fichas de Anamnese — Clínica-Escola Senac** foi iniciado e estruturado a partir de designs exportados do Figma Make. Uma auditoria aprofundada dos arquivos do workspace revelou que a base de código já avançou significativamente além de um protótipo visual inicial:
- O frontend React 19 com TypeScript está completamente implementado para **ambos os formulários** (Anamnese Facial e Anamnese Corporal).
- Há uma API local modular desenvolvida em Node.js (`node:http` nativo) com tipagem compartilhada em `shared/`.
- A persistência atual está projetada para **SQLite** nativo (`node:sqlite`), com tabelas relacionais bem normalizadas, chaves estrangeiras e índices.
- O objetivo estipulado em `INTRUCTIONS.md` é a **migração e persistência no Microsoft SQL Server**, garantia de execução local sem dependências do Figma Make, testes reais e documentação de arquitetura.

Este diagnóstico detalha o estado encontrado, os desvios em relação às diretrizes, as condições do ambiente de execução (EndeavourOS Linux / Docker) e o plano de ação recomendado para a transição segura para o Microsoft SQL Server.

---

## 2. Tecnologias Identificadas

| Camada | Tecnologia Encontrada | Versão / Detalhes | Observações |
| :--- | :--- | :--- | :--- |
| **Linguagem** | TypeScript | 7.0.2 / Node 26.13.1 | Tipagem estrita em `shared/`, `src/` e `server/` |
| **Frontend** | React + React DOM | 19.3.1 | Utiliza hooks customizados, Context API, CSS puro com tokens do Figma |
| **Build Tool** | Vite | 8.3.8 | Configurado com plugin React e sub-processo para API local |
| **Gerenciador** | npm / pnpm | Configurado para `pnpm@10.34.3`, npm 12 disponível no SO | `pnpm` não está no PATH global padrão, mas npm está funcional |
| **Backend/API** | Node.js Nativo | `node:http` | Sem dependências de frameworks pesados (Express/Fastify), rotas manuais REST |
| **Banco Atual** | SQLite 3 | `node:sqlite` (DatabaseSync nativo do Node 22+) | Script `database/schema.sql` com 10 tabelas relacionais |
| **Banco Alvo** | Microsoft SQL Server | Alvo estipulado em `INTRUCTIONS.md` | Necessita dockerização isolada e driver compatível (ex: `mssql` / `tedious`) |

---

## 3. Arquitetura Encontrada

A estrutura de código está dividida em três pilares principais:

```
├── shared/                 # Contratos de domínio compartilhados (isomórfico)
│   ├── constants/          # Definições de seções, opções, perguntas e mapeamento de colunas
│   │   ├── common.ts
│   │   ├── facial.ts
│   │   ├── corporal.ts
│   │   └── schema.ts
│   ├── forms.ts            # Estruturas de campos, seções e validações
│   └── types.ts            # Tipos de dados, payloads de requisição e respostas
│
├── src/                    # Frontend SPA (React 19)
│   ├── components/         # Componentes atômicos e de seção (Tcle, Medidas, Identificacao, etc.)
│   ├── hooks/              # Gerenciamento de estado (useFicha, FichaContext, useSecaoAtiva)
│   ├── pages/              # FichaFacial.tsx, FichaCorporal.tsx, PaginaFicha.tsx
│   ├── services/           # Cliente HTTP da API, fallback para localStorage e sincronização
│   └── styles/             # Tokens CSS (cores, tipografia, espaçamentos) fiéis ao Figma
│
├── server/src/             # Backend API (Node.js)
│   ├── index.ts            # Servidor HTTP, roteamento REST (/api/fichas, /api/health) e CORS
│   ├── db.ts               # Camada de conexão e transações (atualmente SQLite)
│   ├── fichas.ts           # Regras de negócio de inserção, versionamento e consulta relacional
│   ├── validacao.ts        # Validação de payloads e integridade
│   └── config.ts           # Variáveis de ambiente (portas, hosts, caminhos)
│
└── database/               # Persistência
    ├── schema.sql          # DDL completo com integridade referencial
    └── README.md           # Modelo ER e documentação das tabelas
```

---

## 4. Diagnóstico Funcional dos Formulários

### 4.1. Formulário 1 — Anamnese Facial
* **Referência Figma:** `node-id=3-5276`
* **Situação Atual:** **Totalmente implementado no código.**
* **Componentes existentes:**
  - Seção 01: Identificação do paciente (CPF, dados pessoais, contato de emergência).
  - Seção 02: Queixa Principal, HDA, Medicamentos em uso prolongado e Anexos (liberação médica).
  - Seção 03: Antecedentes patológicos, pressão arterial, maquiagem/cosméticos, estilo de vida, ciclo hormonal e sono.
  - Seção 04: Exame físico facial com mapeamento visual interativo de marcações sobre a face (`MapaMarcacoes.tsx`).
  - Seção 05: TCLE com canvas para assinatura digital manuscrita (`Assinatura.tsx`).
  - Seção 06: Evolução cronológica do tratamento (`Evolucao.tsx`).
* **Validações:** Validação de queixa principal, aceite de termos e assinatura antes da conclusão da versão. Possui suporte a rascunho.

### 4.2. Formulário 2 — Anamnese Corporal
* **Referência Figma:** `node-id=3-7194`
* **Situação Atual:** **Já estruturado no código.** Diferente do que supunha a nota de abertura de `INTRUCTIONS.md`, o arquivo `src/pages/FichaCorporal.tsx` e seus componentes auxiliares (`Medidas.tsx`, `PerfilMorfologico.tsx`, `MapaMarcacoes.tsx` com silhueta corporal) já foram criados na exportação do projeto.
* **Componentes existentes:**
  - Seção 01: Identificação.
  - Seção 02: Queixa Principal e Anexos.
  - Seção 03: Hábitos de vida.
  - Seção 04: Antecedentes pessoais detalhados.
  - Seção 05: Exame físico com mapa corporal frontal/dorsal e observações.
  - Seção 06: Perfil morfológico com cálculo automático de IMC e Relação Cintura-Quadril (RCQ).
  - Seção 07: Perimetria, plicometria e bioimpedância.
  - Seção 08: TCLE e assinatura.

---

## 5. Diagnóstico da Migração e Dependências do Figma Make

- **Dependências de nuvem do Figma Make:** Não há dependências bloqueantes em tempo de execução. O diretório `.figma/make` continha apenas scripts de preview/deploy (`mise.toml`, `site.json`, etc.) que não afetam a execução local.
- **Assets estáticos:** As imagens de referência (`bf6c2.png`, `7b003.png`, `25d66.png`, `fcb12.png` representando os mapas anatômicos e logotipo) já estão salvas localmente em `public/assets/`.
- **Roteamento:** Implementado via hash route (`#/facial` e `#/corporal`), permitindo execução estática sem necessidade de servidor complexo.
- **Fallback Offline:** O frontend possui camada de resiliência (`armazenamentoLocal.ts`) que guarda rascunhos no `localStorage` caso o backend esteja desligado e sincroniza quando a conexão é restabelecida.

---

## 6. Diagnóstico do Ambiente e Persistência (SQL Server)

### 6.1. Situação do Docker no Ambiente
- O sistema operacional da máquina hospedeira é **EndeavourOS Linux (x86_64)**.
- O binário `/usr/local/bin/docker` está instalado.
- **Impedimento temporário identificado:** O daemon do Docker (`dockerd` / `docker.sock`) não está ativo no momento da verificação no sandbox (`connect: no such file or directory` / PID 1 sem systemd no ambiente restrito do sandbox).
- Para subir a instância do SQL Server via Docker Compose conforme especificado na Etapa 3 de `INTRUCTIONS.md`, o daemon do Docker precisa estar ativo no host, ou deve ser utilizada uma instância SQL Server existente na rede local/host.

### 6.2. Estratégia de Migração SQLite → Microsoft SQL Server
O backend atual em `server/src/db.ts` e `server/src/fichas.ts` utiliza chamadas síncronas do driver nativo `node:sqlite`. Para atender à exigência do **Microsoft SQL Server**:
1. **Modelagem T-SQL:** Converter o `database/schema.sql` (sintaxe SQLite) para dialeto T-SQL (`database/scripts/` com scripts numerados para criação do banco, tabelas, constraints, chaves estrangeiras e índices).
2. **Tipos de Dados:**
   - `INTEGER PRIMARY KEY AUTOINCREMENT` $\to$ `INT IDENTITY(1,1) PRIMARY KEY`.
   - `TEXT` $\to$ `NVARCHAR(MAX)` ou tamanhos específicos (`NVARCHAR(255)`, `NVARCHAR(20)` para CPF).
   - Datas: `DATETIME2` com `DEFAULT SYSUTCDATETIME()`.
   - Booleanos: `TINYINT` ou `BIT`.
3. **Driver de Conexão no Node.js:** Adicionar o pacote oficial `mssql` (ou `tedious`), transformando os métodos de persistência em `server/src/db.ts` e `server/src/fichas.ts` em operações assíncronas (Promises/async-await) com connection pool e queries parametrizadas prevenindo SQL Injection.
4. **Isolamento de Credenciais:** Configurar `.env` e `.env.example` protegendo a senha do `sa` / usuário da aplicação.

---

## 7. Quadro de Situação Atual

| Item | Situação | Ação Obrigatória |
| :--- | :--- | :--- |
| **Frontend** | Implementado e completo | Validar build, tipos e sincronização com API |
| **Backend (Node.js)** | Funcional (rotas REST prontas) | Adaptar métodos síncronos de SQLite para queries assíncronas no SQL Server |
| **Formulário 1 (Facial)** | Completo visualmente | Homologar validações e persistência ponta a ponta no SQL Server |
| **Formulário 2 (Corporal)** | Completo visualmente | Homologar cálculos de IMC/RCQ, medidas e persistência no SQL Server |
| **SQL Server** | Pendente de provisionamento | Configurar Docker Compose (`docker-compose.yml`) e scripts DDL T-SQL |
| **Integração Real** | Operando via SQLite nativo | Migrar driver para `mssql`, conectar pool e validar transações ACID |
| **Docker Daemon** | Inativo no sandbox | Solicitar inicialização do serviço Docker no host ou credenciais de SQL Server local |
| **Documentação** | Parcial (README.md existente) | Criar `docs/` com arquitetura, modelagem e guia de execução |

---

## 8. Riscos Técnicos e Mitigações

1. **Risco:** Docker daemon desligado ou não exposto ao usuário no momento.
   - *Mitigação:* Fornecer `docker-compose.yml` completo pronto para subida imediata e permitir parametrização via `.env` caso o desenvolvedor utilize uma instância SQL Server existente no host.
2. **Risco:** Quebra de contratos entre frontend e backend durante a troca do driver de banco.
   - *Mitigação:* Manter rigorosamente intacta a camada `shared/` (`shared/types.ts` e `shared/constants/`). As assinaturas de payload HTTP continuarão 100% iguais.

---

## 9. Plano de Execução Recomendado

- **Marco M1 (Concluído neste ato):** Diagnóstico completo entregue em `docs/DIAGNOSTICO_TECNICO.md`.
- **Marco M2 (Próximo):** Adequação para execução local (configuração de scripts npm/pnpm, `.env`, validação de dependências).
- **Marco M3:** Elaboração dos scripts DDL T-SQL do SQL Server em `database/scripts/` e configuração do `docker-compose.yml` com volume persistente.
- **Marco M4:** Implementação da camada de conexão do SQL Server (`server/src/db.ts`) com biblioteca `mssql`, queries parametrizadas e tratamento transacional.
- **Marco M5 & M6:** Testes integrados e validação ponta a ponta do Formulário Facial e Corporal contra o SQL Server.
- **Marco M7 a M10:** Ajustes finos de UI/UX, testes automatizados, documentação técnica consolidada e entrega final.
