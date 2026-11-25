# Fichas de Anamnese — Clínica-Escola Senac

Aplicação completa para preenchimento e gerenciamento das fichas de **Anamnese Facial** e **Anamnese Corporal**, projetada fielmente a partir do design do Figma e integrada com persistência real em **Microsoft SQL Server**.

---

## 🚀 Tecnologias

- **Frontend:** React 19 + TypeScript + Vite (CSS modular com tokens do Figma).
- **Backend:** Node.js (HTTP nativo) com rotas REST e transações atômicas ACID.
- **Banco de Dados Principal:** Microsoft SQL Server 2019/2022 (`ClinicaEscolaAnamnese`).
- **Navegação & UX:** Barra lateral com links dinâmicos e auto-avanço para a próxima ficha ao salvar sem pendências.
- **Contingência:** Suporte a fallback em SQLite local caso o SQL Server esteja indisponível.

---

## 📋 Pré-requisitos

- **Node.js:** Versão 22+ (testado no Node 26.13.1)
- **npm** ou **pnpm**
- **Microsoft SQL Server** ativo na porta 1433 (local ou container Docker)

---

## ⚙️ Inicialização Rápida

1. **Clone/abra o projeto e instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o `.env`:**
   ```bash
   cp .env.example .env
   ```
   Certifique-se de que a senha e porta do seu SQL Server local estejam preenchidas no `.env`:
   ```env
   DB_TYPE=mssql
   DB_SERVER=localhost
   DB_PORT=1433
   DB_USER=sa
   DB_PASSWORD=SqlLocal@12345
   DB_NAME=ClinicaEscolaAnamnese
   ```

3. **Crie a base de dados e as tabelas:**
   ```bash
   npm run db:init
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 🌐 Acesso no Navegador

- **Anamnese Facial:** `http://localhost:5173/#/facial`
- **Anamnese Corporal:** `http://localhost:5173/#/corporal`
- **Healthcheck da API:** `http://127.0.0.1:3333/api/health`

---

## 🔄 Fluxo de Navegação e Salvamento

- **Alternância Manual:** O menu lateral (`Sidebar`) possui botões com ícones dedicados para alternar entre a ficha Facial e Corporal a qualquer momento.
- **Salvar com Pendências:** Salva as alterações atuais como rascunho e direciona a tela para o primeiro campo obrigatório pendente.
- **Salvar sem Pendências (Conclusão):** Grava a versão concluída no SQL Server e **avança automaticamente para a próxima ficha** (Facial $\to$ Corporal $\to$ Facial).

---

## 📚 Índice da Documentação Técnica

Para detalhes aprofundados sobre a arquitetura e banco de dados, consulte a pasta [`docs/`](docs/):

- 📘 [Diagnóstico Técnico Completo](docs/DIAGNOSTICO_TECNICO.md) — Levantamento inicial da migração e análise do Figma.
- 🏛️ [Arquitetura da Solução](docs/ARQUITETURA.md) — Diagrama de componentes, padrões e fluxo de dados.
- 🗄️ [Modelagem de Dados SQL Server](docs/MODELAGEM_DADOS.md) — Diagrama ER, dicionário de dados e relacionamentos.
- 🔌 [Manual da API REST](docs/API.md) — Documentação dos endpoints, contratos e payloads JSON.
- ⚙️ [Guia de Configuração Local](docs/CONFIGURACAO_LOCAL.md) — Instruções completas de setup, variáveis e execução.
- 🧪 [Relatório de Testes](docs/TESTES.md) — Evidências de execução de testes de integração e validação real.
