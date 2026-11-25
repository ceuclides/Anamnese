# Guia de Configuração e Execução Local

Este guia detalha o processo de inicialização, configuração e manutenção do projeto em ambiente local.

---

## 1. Pré-requisitos

- **Sistema Operacional:** Linux (EndeavourOS / Arch / Ubuntu), macOS ou Windows.
- **Node.js:** Versão 22.18+ ou superior (testado com Node 26.13.1).
- **Gerenciador de Pacotes:** `npm` (v10+) ou `pnpm` (v10+).
- **Microsoft SQL Server:** Instância 2019/2022 ativa na porta 1433 (local ou container Docker).

---

## 2. Configuração de Variáveis de Ambiente

O projeto utiliza um arquivo `.env` na raiz para parametrizar a aplicação. 

Crie o arquivo a partir do modelo:
```bash
cp .env.example .env
```

Parâmetros disponíveis:

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `API_PORT` | `3333` | Porta HTTP da API local |
| `API_HOST` | `127.0.0.1` | Interface de rede da API |
| `CORS_ORIGINS` | `*` | Origens autorizadas para CORS |
| `DB_TYPE` | `mssql` | Engine primária (`mssql` ou `sqlite`) |
| `DB_SERVER` | `localhost` | Host do Microsoft SQL Server |
| `DB_PORT` | `1433` | Porta TCP do SQL Server |
| `DB_USER` | `sa` | Usuário de autenticação |
| `DB_PASSWORD` | `SqlLocal@12345` | Senha de autenticação |
| `DB_NAME` | `ClinicaEscolaAnamnese` | Nome da base de dados |
| `DB_ENCRYPT` | `false` | Criptografia SSL da conexão |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` | Aceitar certificado autoassinado |
| `DB_PATH` | `database/clinica.db` | Caminho do arquivo SQLite (contingência) |

---

## 3. Inicialização do Banco de Dados (SQL Server)

Para criar automaticamente a base de dados `ClinicaEscolaAnamnese`, todas as 10 tabelas, relacionamentos, constraints, índices e a view consolidada:

```bash
npm run db:init
```

Ou execute o script de migração:
```bash
node database/scripts/executar-migracoes.mjs
```

### Alternativa via Docker Compose
Caso não tenha uma instância SQL Server instalada no sistema operacional:
```bash
docker compose up -d
```
O arquivo `docker-compose.yml` provisiona o SQL Server 2022 oficial com persistência em volume seguro `sqlserver_data`.

---

## 4. Executando a Aplicação

### Modo Desenvolvimento Completo (Vite + API simultâneos)
```bash
npm run dev
```
O Vite iniciará o frontend e o plugin `apiLocal` gerenciará o ciclo de vida do backend Node.js automaticamente.

- **Frontend:** `http://localhost:5173`
- **Ficha Facial:** `http://localhost:5173/#/facial`
- **Ficha Corporal:** `http://localhost:5173/#/corporal`
- **API Local:** `http://127.0.0.1:3333/api`

### Execução dos Serviços Separadamente (Opcional)
Se preferir rodar em terminais distintos:
- **Terminal 1 (Backend):**
  ```bash
  npm run api
  ```
- **Terminal 2 (Frontend):**
  ```bash
  API_AUTO=0 npm run dev
  ```

---

## 5. Comandos de Validação e Qualidade

- **Checagem de Tipos TypeScript:**
  ```bash
  npm run typecheck
  ```
- **Build de Produção Frontend:**
  ```bash
  npm run build
  ```
- **Testes de Integração Ponta a Ponta com o SQL Server:**
  ```bash
  node database/scripts/testar-facial.mjs
  node database/scripts/testar-corporal.mjs
  ```
