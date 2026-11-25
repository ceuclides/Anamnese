# Relatório de Testes e Validação Final

**Data:** 25 de Novembro de 2026  
**Ambiente:** Linux (EndeavourOS x86_64), Node.js v26.13.1, Microsoft SQL Server 2022

---

## 1. Testes de Infraestrutura e Conexão

| Teste | Descrição | Resultado |
| :--- | :--- | :--- |
| **Acesso à Porta 1433** | Verificação de disponibilidade da porta do SQL Server | **Aprovado** (`127.0.0.1:1433`) |
| **Autenticação SQL Server** | Conexão com usuário `sa` e senha configurada | **Aprovado** (SQL Server 2022 RTM-CU27-GDR) |
| **Execução dos Scripts DDL** | Criação do banco `ClinicaEscolaAnamnese`, 10 tabelas, índices e view | **Aprovado** (todas as tabelas criadas) |
| **Healthcheck da API** | Endpoint `/api/health` respondendo com engine ativa | **Aprovado** (`"banco": "mssql"`) |

---

## 2. Testes de Integração e Persistência Real

### 2.1. Formulário 1 — Anamnese Facial
- **Script Executado:** `database/scripts/testar-facial.mjs`
- **Operações:**
  - `POST /api/fichas`: Criação de ficha facial concluída com identificação do paciente, dados clínicos, antecedentes, marcações de exame físico no rosto e assinatura no TCLE.
  - `GET /api/fichas/:id`: Recuperação de todos os campos relacionais salvos no SQL Server.
  - `GET /api/fichas?tipo=facial`: Listagem filtrada.
- **Resultado:** **Aprovado** (Ficha ID 1 persistida e recuperada com 100% de integridade).

### 2.2. Formulário 2 — Anamnese Corporal
- **Script Executado:** `database/scripts/testar-corporal.mjs`
- **Operações:**
  - `POST /api/fichas`: Criação de ficha corporal concluída com cálculo de IMC (26.04), RCQ (0.92), medidas perimétricas e marcações de gordura localizada na silhueta.
  - `GET /api/fichas/:id`: Recuperação das tabelas `ficha_corporal`, `medidas_corporais` e `mapa_marcacoes`.
  - `GET /api/fichas`: Listagem geral consolidada via view `vw_fichas_resumo`.
- **Resultado:** **Aprovado** (Ficha ID 2 persistida e recuperada com 100% de integridade).

---

## 3. Testes de Qualidade de Código do Frontend

- **Typecheck TypeScript:** `npm run typecheck` $\to$ **0 erros** encontrados.
- **Build de Produção Vite:** `npm run build` $\to$ **Sucesso** gerando bundle estático otimizado em `dist/`.
