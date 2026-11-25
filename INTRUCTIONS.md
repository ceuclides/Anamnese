
# MISSÃO: CONTINUIDADE, MIGRAÇÃO LOCAL E CONCLUSÃO DO PROJETO — FIGMA MAKE → VS CODE → SQL SERVER

## 1. SEU PAPEL E RESPONSABILIDADE

Atue como um **Engenheiro de Software Sênior, Arquiteto de Soluções, Desenvolvedor Full Stack e Especialista em Banco de Dados Microsoft SQL Server**.

Você será o principal responsável técnico pela continuidade e conclusão deste projeto.

O projeto foi iniciado e parcialmente desenvolvido utilizando o Figma Make. Entretanto, durante o desenvolvimento, foi necessário migrar para um ambiente local.

Todos os arquivos exportados do Figma Make já foram baixados e estão abertos no Visual Studio Code.

Sua missão é assumir a continuidade do desenvolvimento, compreender integralmente a implementação existente, corrigir os problemas de migração, estruturar a persistência de dados com SQL Server e concluir as funcionalidades previstas.

Não considere o projeto como uma aplicação nova. Trata-se da continuidade de um desenvolvimento existente.

**Princípio fundamental: preserve, compreenda, corrija, integre e evolua. Não reconstrua desnecessariamente.**

Adote uma postura crítica e proativa:

- Não concorde automaticamente com decisões técnicas inadequadas.
- Identifique problemas de arquitetura e proponha soluções melhores.
- Não esconda limitações ou funcionalidades incompletas.
- Não simule integrações que deveriam funcionar efetivamente.
- Não considere uma funcionalidade concluída apenas porque sua interface está pronta.
- Priorize a integridade dos dados, a segurança e a confiabilidade da aplicação.

---

## 2. CONTEXTO DO PROJETO

### Ambiente de desenvolvimento

O projeto está atualmente disponível no ambiente local:

- Editor: Visual Studio Code.
- Ambiente original: Figma Make.
- Ambiente atual: desenvolvimento local.
- Banco de dados pretendido: Microsoft SQL Server.
- Execução pretendida: aplicação local, sem necessidade de publicação na internet.
- Controle dos arquivos: diretório local do projeto.

O ambiente de desenvolvimento do computador utiliza EndeavourOS Linux, com Docker e Docker Compose operacionais.

Já existe um ambiente Docker em utilização com outros serviços. Portanto, não altere configurações globais, não interrompa containers existentes e não modifique serviços de outros projetos.

Para o SQL Server, avalie preferencialmente uma instância isolada em Docker Compose, utilizando imagem oficial e persistência em volume, desde que compatível com o ambiente e com a arquitetura da máquina.

Não instale componentes no sistema operacional nem altere configurações globais sem necessidade técnica comprovada e autorização.

### Objetivo geral

Transformar o projeto exportado do Figma Make em uma aplicação local plenamente funcional, com:

1. Interface preservada e aprimorada.
2. Estrutura de código organizada.
3. Frontend funcionando localmente.
4. Backend e API implementados, quando necessários.
5. Banco de dados Microsoft SQL Server efetivamente criado.
6. Tabelas, relacionamentos, índices e restrições estruturados.
7. Conexões reais entre aplicação e banco.
8. Operações CRUD funcionando.
9. Validações de dados.
10. Fluxos de navegação e formulários funcionais.
11. Tratamento de erros.
12. Documentação técnica.
13. Procedimentos de inicialização e manutenção.

---

## 3. REFERÊNCIAS FUNCIONAIS E VISUAIS — FIGMA

Existem dois formulários no projeto original que devem servir como referências para a continuidade da aplicação.

### Formulário 1 — Referência parcialmente implementada

https://www.figma.com/design/muLoqpIi71bZwWoXBdUceN/Projeto-Integrador---Clinca-escola--c%C3%B3pia-?node-id=3-5276&m=dev

### Formulário 2 — Referência a ser implementada

https://www.figma.com/design/muLoqpIi71bZwWoXBdUceN/Projeto-Integrador---Clinca-escola--c%C3%B3pia-?node-id=3-7194&m=dev

**IMPORTANTE:**

- O primeiro formulário já possui uma implementação parcial no código exportado.
- O segundo formulário ainda precisa ser desenvolvido, mas sua implementação deverá ocorrer somente depois do diagnóstico do projeto.
- Não desenvolva o segundo formulário antecipadamente.
- Não presuma que o primeiro formulário está concluído.
- Compare a implementação existente com a referência original do Figma.
- Identifique diferenças visuais, estruturais e funcionais.

Utilize os links do Figma para compreender:

- Organização dos campos.
- Hierarquia das informações.
- Componentes utilizados.
- Disposição dos elementos.
- Identidade visual.
- Navegação.
- Comportamento esperado.
- Relacionamento funcional entre os formulários.

Se houver acesso à integração com Figma ou ao navegador, examine diretamente os dois frames e seus elementos.

Caso não consiga acessar algum elemento, registre essa limitação e trabalhe com as informações efetivamente disponíveis. Não invente requisitos.

---

# 4. ETAPA 1 — DIAGNÓSTICO COMPLETO DO PROJETO

**Esta etapa é obrigatória e deve ser executada antes de qualquer alteração estrutural.**

Faça uma análise detalhada de todos os arquivos e diretórios existentes.

Não comece modificando ou recriando componentes.

### 4.1. Inventário dos arquivos

Identifique:

- Estrutura de diretórios.
- Arquivos de configuração.
- Arquivos de inicialização.
- Componentes.
- Páginas.
- Rotas.
- Layouts.
- Hooks.
- Serviços.
- Utilitários.
- Bibliotecas.
- Dependências.
- Arquivos de estilos.
- Assets e imagens.
- Arquivos relacionados ao Figma Make.
- Eventuais arquivos de backend.
- Configurações de ambiente.

### 4.2. Identificação da tecnologia

Determine precisamente:

- Framework frontend.
- Linguagem de programação.
- Gerenciador de pacotes.
- Versões das dependências.
- Ferramenta de build.
- Bibliotecas de interface.
- Estratégia de roteamento.
- Existência ou ausência de backend.
- Arquitetura atual.
- Existência de banco de dados ou camada de persistência.
- Dependências específicas do Figma Make.

Não substitua tecnologias apenas por preferência pessoal.

Preserve a stack atual sempre que ela for adequada.

### 4.3. Diagnóstico funcional

Examine cada página e componente.

Classifique as funcionalidades em:

- Implementadas e funcionais.
- Implementadas parcialmente.
- Apenas visuais.
- Simuladas com dados fictícios.
- Dependentes de serviços externos.
- Quebradas ou incompatíveis com o ambiente local.
- Ainda não implementadas.

Verifique especialmente:

- Formulários.
- Campos obrigatórios.
- Botões.
- Eventos.
- Navegação.
- Validações.
- Seletores.
- Listagens.
- Pesquisas.
- Inclusão de registros.
- Edição.
- Exclusão.
- Persistência dos dados.

### 4.4. Diagnóstico da migração

Identifique tudo que depende exclusivamente do Figma Make.

Procure:

- APIs ou serviços específicos do ambiente original.
- Dados mockados.
- Dependências indisponíveis localmente.
- Variáveis de ambiente ausentes.
- Integrações incompletas.
- Referências a caminhos inexistentes.
- Recursos carregados remotamente.
- Configurações incompatíveis.
- Dependências que precisam ser substituídas.

Determine o que precisa ser adaptado para que a aplicação funcione de forma independente do Figma Make.

### 4.5. Resultado obrigatório do diagnóstico

Antes de começar as modificações, produza um documento:

`docs/DIAGNOSTICO_TECNICO.md`

O documento deve conter:

1. Resumo executivo.
2. Tecnologias identificadas.
3. Arquitetura encontrada.
4. Estrutura de diretórios.
5. Funcionalidades existentes.
6. Funcionalidades incompletas.
7. Problemas identificados.
8. Dependências do Figma Make.
9. Situação dos formulários.
10. Necessidades de integração com SQL Server.
11. Riscos técnicos.
12. Plano de execução recomendado.

Apresente também um quadro de situação:

| Item           | Situação                | Ação necessária         |
| -------------- | ------------------------- | -------------------------- |
| Frontend       | A diagnosticar            | Validar execução local   |
| Backend        | A diagnosticar            | Identificar ou implementar |
| Formulário 1  | Parcialmente implementado | Auditar e concluir         |
| Formulário 2  | Pendente                  | Implementar posteriormente |
| SQL Server     | A implementar             | Criar banco e estrutura    |
| Integração   | A diagnosticar            | Implementar conexão real  |
| Validações   | A diagnosticar            | Corrigir e padronizar      |
| Documentação | A implementar             | Documentar arquitetura     |

Não avance diretamente para reconstrução da aplicação.

Apresente o diagnóstico e o plano de implementação antes de realizar alterações estruturais relevantes.

---

# 5. ETAPA 2 — ADEQUAÇÃO PARA EXECUÇÃO LOCAL

Depois do diagnóstico, prepare a aplicação para funcionar completamente no ambiente local.

### 5.1. Inicialização

Configure corretamente os comandos necessários para:

- Instalar dependências.
- Inicializar o frontend.
- Inicializar o backend.
- Inicializar os serviços necessários.
- Executar a aplicação.
- Encerrar os serviços.

Crie ou atualize o `README.md` com instruções claras.

Sempre que possível, simplifique a inicialização para poucos comandos.

### 5.2. Independência do Figma Make

Remova dependências desnecessárias do ambiente original.

Adapte os componentes e serviços para execução local.

Não elimine funcionalidades existentes apenas porque dependem de uma integração antiga.

Substitua cada dependência por uma implementação local equivalente quando necessário.

### 5.3. Arquitetura da aplicação

Se o projeto ainda não possuir backend, avalie e implemente uma arquitetura adequada.

A arquitetura deverá respeitar a stack encontrada e, preferencialmente, seguir a separação:

- Frontend: interface e interação com o usuário.
- Backend: regras de negócio e processamento.
- API: comunicação entre frontend e backend.
- Banco de dados: persistência no SQL Server.

**Regra de arquitetura:** o frontend não deve acessar diretamente o SQL Server nem armazenar credenciais de banco de dados.

Toda comunicação com o banco deve acontecer por meio do backend.

Organize os serviços de forma modular, evitando código duplicado e dependências desnecessárias.

---

# 6. ETAPA 3 — MODELAGEM E IMPLEMENTAÇÃO DO SQL SERVER

Esta é uma das etapas centrais do projeto.

O banco de dados deve ser real, funcional e integrado à aplicação.

Não utilize LocalStorage, SessionStorage, arquivos JSON ou arrays em memória como substitutos permanentes do banco de dados.

Esses recursos podem ser utilizados temporariamente para desenvolvimento, mas não devem representar a persistência definitiva.

### 6.1. Preparação do ambiente SQL Server

Analise o ambiente local e verifique se já existe alguma instância SQL Server disponível.

Caso não exista, prepare uma instância isolada utilizando Docker Compose e a imagem oficial do Microsoft SQL Server, observando a compatibilidade com a arquitetura e o sistema operacional.

Crie os arquivos necessários, preferencialmente:

- `docker-compose.yml`
- `.env.example`
- `.env` local, quando necessário.
- Configurações de conexão.

Utilize:

- Volume persistente.
- Porta local configurável.
- Healthcheck.
- Credenciais seguras.
- Variáveis de ambiente.
- Configuração de reinicialização apropriada.

Não utilize credenciais reais diretamente no código-fonte.

Não exponha o SQL Server à rede pública.

Não interfira nos containers ou serviços já existentes.

### 6.2. Criação do banco

Crie o banco de dados com nome coerente com o projeto.

Antes de criar as tabelas, analise os formulários, os campos existentes, os fluxos de negócio e as informações necessárias.

Não crie tabelas apenas reproduzindo visualmente os campos dos formulários.

A modelagem deve representar corretamente as entidades e seus relacionamentos.

### 6.3. Modelagem de dados

Defina:

- Entidades.
- Tabelas.
- Chaves primárias.
- Chaves estrangeiras.
- Tipos de dados.
- Restrições.
- Campos obrigatórios.
- Campos opcionais.
- Índices.
- Relacionamentos.
- Regras de integridade.
- Estratégia de identificação dos registros.

Observe as boas práticas de normalização, evitando duplicidade desnecessária.

Considere:

- `IDENTITY` quando apropriado.
- `PRIMARY KEY`.
- `FOREIGN KEY`.
- `NOT NULL`.
- `UNIQUE`.
- `DEFAULT`.
- `CHECK`.
- Índices para consultas frequentes.

Utilize tipos adequados do SQL Server, como `INT`, `BIGINT`, `VARCHAR`, `NVARCHAR`, `DATE`, `DATETIME2`, `DECIMAL` e outros conforme a necessidade.

Não utilize tipos genéricos indiscriminadamente.

### 6.4. Scripts SQL

Organize os scripts em diretório próprio:

`database/`

Estrutura sugerida:

```text
database/
├── scripts/
│   ├── 001_create_database.sql
│   ├── 002_create_tables.sql
│   ├── 003_create_relationships.sql
│   ├── 004_create_indexes.sql
│   └── 005_initial_data.sql
├── migrations/
└── README.md
```

Adapte a estrutura conforme a tecnologia e a estratégia de migrações identificadas.

Os scripts precisam ser organizados, documentados e executáveis.

Evite scripts destrutivos que possam apagar dados existentes.

### 6.5. Dados iniciais

Avalie quais dados iniciais são necessários.

Quando houver necessidade de cadastros de apoio, utilize scripts de carga inicial.

Não invente dados reais de pessoas ou registros do projeto.

Utilize dados fictícios identificados como dados de teste, quando necessários.

---

# 7. ETAPA 4 — CONEXÃO ENTRE BACKEND E SQL SERVER

Implemente a conexão efetiva entre a aplicação e o banco.

Escolha a tecnologia de acesso ao banco considerando a stack existente.

Utilize uma biblioteca, driver ou ORM adequado e compatível com o SQL Server.

Implemente:

- Configuração centralizada de conexão.
- Variáveis de ambiente.
- Gerenciamento de conexões.
- Tratamento de erros.
- Consultas parametrizadas.
- Transações quando necessárias.
- Validação dos dados recebidos.
- Tratamento de indisponibilidade do banco.

Não concatene dados recebidos do usuário diretamente em comandos SQL.

Previna SQL Injection.

### 7.1. API

Se houver backend, adapte sua estrutura.

Se não houver, implemente uma camada de API adequada.

Organize os endpoints conforme as entidades e os fluxos de negócio.

Considere operações:

- GET: consulta.
- POST: inclusão.
- PUT/PATCH: atualização.
- DELETE: exclusão, quando permitida.

Utilize códigos HTTP apropriados.

Padronize as respostas da API.

### 7.2. Testes de conexão

Valide efetivamente:

1. Inicialização do SQL Server.
2. Disponibilidade da instância.
3. Conexão do backend.
4. Autenticação.
5. Acesso ao banco.
6. Consulta de registros.
7. Inclusão de registros.
8. Atualização de registros.
9. Exclusão, quando aplicável.

Não declare a integração concluída apenas porque a aplicação iniciou sem erros.

É obrigatório comprovar a persistência real dos dados no SQL Server.

---

# 8. ETAPA 5 — CONCLUSÃO DO PRIMEIRO FORMULÁRIO

Depois que a arquitetura e a conexão com o banco estiverem funcionando, retome o primeiro formulário.

Referência:

https://www.figma.com/design/muLoqpIi71bZwWoXBdUceN/Projeto-Integrador---Clinca-escola--c%C3%B3pia-?node-id=3-5276&m=dev

Faça uma auditoria completa da implementação existente.

Compare a interface com o Figma e identifique os elementos que estão faltando.

Implemente as correções necessárias.

### Critérios funcionais

- Todos os campos devem funcionar.
- Validações devem ser efetivas.
- Campos obrigatórios devem ser respeitados.
- Dados devem ser enviados ao backend.
- Registros devem ser persistidos no SQL Server.
- Dados cadastrados devem poder ser consultados.
- Edição deve atualizar os registros corretos.
- Exclusão deve respeitar as regras de negócio.
- Mensagens de sucesso e erro devem ser claras.
- A interface deve apresentar estados de carregamento.
- Não devem existir botões sem funcionalidade.

Não altere regras de negócio sem justificativa.

Preserve a identidade visual original, melhorando eventuais inconsistências de usabilidade.

---

# 9. ETAPA 6 — DESENVOLVIMENTO DO SEGUNDO FORMULÁRIO

Somente após a conclusão e validação do primeiro formulário, desenvolva o segundo.

Referência:

https://www.figma.com/design/muLoqpIi71bZwWoXBdUceN/Projeto-Integrador---Clinca-escola--c%C3%B3pia-?node-id=3-7194&m=dev

Antes de começar, examine novamente a referência original e compare com o restante do sistema.

Identifique:

- Campos.
- Componentes.
- Dependências.
- Regras de preenchimento.
- Relacionamentos com outras entidades.
- Fluxo de navegação.
- Dados compartilhados com o primeiro formulário.

Aproveite componentes e estruturas já implementados quando fizer sentido.

Não duplique código desnecessariamente.

Implemente a integração completa com o backend e o SQL Server.

O segundo formulário deverá seguir o mesmo padrão de qualidade visual, funcional e técnico do primeiro.

---

# 10. ETAPA 7 — UI/UX E PADRONIZAÇÃO VISUAL

A interface deve manter a identidade visual estabelecida no Figma.

Entretanto, a migração também é uma oportunidade para corrigir problemas de usabilidade.

Aplique boas práticas atuais de UI/UX:

- Design moderno e profissional.
- Consistência visual.
- Hierarquia tipográfica.
- Espaçamentos padronizados.
- Alinhamentos.
- Responsividade.
- Acessibilidade.
- Contraste adequado.
- Feedback visual.
- Estados de interação.
- Estados vazios.
- Indicadores de carregamento.
- Mensagens de erro.
- Confirmações de ações importantes.

Evite mudanças estéticas que descaracterizem o projeto original.

Priorize a experiência do usuário e a clareza dos formulários.

---

# 11. ETAPA 8 — SEGURANÇA E QUALIDADE

Implemente as proteções necessárias para uma aplicação local confiável.

Verifique:

- Proteção das credenciais.
- Arquivos `.env` fora do controle de versão.
- `.gitignore` adequado.
- Consultas parametrizadas.
- Validação no frontend e backend.
- Tratamento de exceções.
- Sanitização adequada de entradas.
- CORS restrito ao ambiente necessário.
- Controle de acesso, caso exista autenticação.
- Integridade referencial.
- Proteção contra operações indevidas.

Não implemente autenticação ou autorização fictícias.

Se houver necessidade de autenticação, identifique primeiro os requisitos existentes e proponha a implementação adequada.

### Qualidade do código

- Código legível.
- Componentes reutilizáveis.
- Separação de responsabilidades.
- Nomenclatura consistente.
- Tratamento de erros.
- Eliminação de código morto.
- Eliminação de dependências desnecessárias.
- Ausência de funcionalidades duplicadas.

Não faça refatorações extensas sem necessidade.

---

# 12. ETAPA 9 — TESTES E VALIDAÇÃO FINAL

Antes de considerar o projeto concluído, execute testes reais.

### Testes técnicos

- Instalação das dependências.
- Build.
- Inicialização local.
- Conexão com SQL Server.
- Disponibilidade da API.
- Testes dos endpoints.
- Testes de persistência.
- Testes de integridade dos relacionamentos.
- Testes de validação.
- Testes de tratamento de erros.

### Testes funcionais

Para cada formulário:

1. Abrir a tela.
2. Preencher os campos.
3. Validar campos obrigatórios.
4. Enviar os dados.
5. Confirmar a gravação no banco.
6. Consultar os dados gravados.
7. Editar um registro.
8. Confirmar a atualização.
9. Testar operações não permitidas.
10. Validar mensagens apresentadas ao usuário.

### Testes de interface

Verifique:

- Desktop.
- Resoluções menores.
- Responsividade.
- Alinhamento.
- Sobreposição de componentes.
- Navegação.
- Usabilidade dos campos.
- Consistência visual com o Figma.

Não marque como aprovado um teste que não foi efetivamente executado.

---

# 13. ETAPA 10 — DOCUMENTAÇÃO E ENTREGA

Organize a documentação dentro do projeto.

Estrutura sugerida:

```text
docs/
├── DIAGNOSTICO_TECNICO.md
├── ARQUITETURA.md
├── MODELAGEM_DADOS.md
├── ESTRUTURA_BANCO.md
├── API.md
├── CONFIGURACAO_LOCAL.md
└── TESTES.md

database/
├── scripts/
├── migrations/
└── README.md
```

Adapte os documentos conforme a arquitetura real.

### README.md

O README principal deve apresentar:

- Descrição do projeto.
- Tecnologias utilizadas.
- Arquitetura.
- Pré-requisitos.
- Configuração do ambiente.
- Configuração do SQL Server.
- Inicialização do banco.
- Inicialização do backend.
- Inicialização do frontend.
- Comandos necessários.
- Endereços locais.
- Estrutura dos diretórios.
- Solução de problemas comuns.

### Entrega final

Ao terminar, apresente um relatório contendo:

1. O que foi identificado no diagnóstico.
2. O que foi corrigido na migração.
3. O que foi implementado.
4. Estrutura final do banco de dados.
5. Tabelas e relacionamentos criados.
6. Como funciona a conexão com SQL Server.
7. Endpoints implementados.
8. Situação do primeiro formulário.
9. Situação do segundo formulário.
10. Testes executados e resultados.
11. Pendências conhecidas.
12. Como executar o projeto localmente.

---

# 14. REGRAS OPERACIONAIS OBRIGATÓRIAS

Estas regras devem ser respeitadas durante todo o desenvolvimento.

**REGRA 1 — DIAGNOSTICAR ANTES DE ALTERAR**

Não comece reconstruindo a aplicação. Primeiro compreenda o código existente.

**REGRA 2 — PRESERVAR O QUE FUNCIONA**

Não substitua componentes, páginas ou funcionalidades funcionais sem necessidade comprovada.

**REGRA 3 — NÃO INVENTAR REQUISITOS**

Utilize o código existente, os formulários do Figma e as evidências disponíveis. Diferencie requisitos confirmados de hipóteses.

**REGRA 4 — NÃO SIMULAR FUNCIONALIDADES**

Se uma funcionalidade exige banco de dados, implemente a integração real.

**REGRA 5 — NÃO EXPOR CREDENCIAIS**

Utilize variáveis de ambiente e arquivos ignorados pelo Git.

**REGRA 6 — NÃO INTERFERIR EM OUTROS PROJETOS**

Não interrompa containers, serviços ou configurações existentes no ambiente local.

**REGRA 7 — NÃO EXECUTAR AÇÕES DESTRUTIVAS SEM AUTORIZAÇÃO**

Não apague bancos, tabelas, arquivos, registros ou diretórios existentes sem autorização expressa.

**REGRA 8 — TRABALHAR POR ETAPAS**

Conclua e valide cada etapa antes de avançar para a seguinte.

**REGRA 9 — MANTER A DOCUMENTAÇÃO ATUALIZADA**

Toda alteração relevante de arquitetura, banco, API ou configuração deve ser documentada.

**REGRA 10 — COMPROVAR A CONCLUSÃO**

Não declare uma funcionalidade concluída sem evidências de funcionamento.

**REGRA 11 — EVITAR REFATORAÇÕES DESNECESSÁRIAS**

A prioridade é concluir o projeto com estabilidade, não trocar toda a tecnologia.

**REGRA 12 — COMUNICAR IMPEDIMENTOS**

Quando faltar informação, acesso ao Figma, credenciais, configuração ou definição de negócio, explique o impedimento e solicite somente o que for necessário.

---

# 15. FORMA DE EXECUÇÃO E CONTROLE DO DESENVOLVIMENTO

Organize o trabalho nos seguintes marcos:

| Marco | Atividade            | Critério de conclusão               |
| ----- | -------------------- | ------------------------------------- |
| M1    | Diagnóstico         | Relatório técnico aprovado          |
| M2    | Arquitetura local    | Aplicação inicializando localmente  |
| M3    | SQL Server           | Banco criado e acessível             |
| M4    | Backend/API          | Comunicação com o banco validada    |
| M5    | Primeiro formulário | CRUD e validações funcionais        |
| M6    | Segundo formulário  | Interface e integração concluídas  |
| M7    | UI/UX                | Interface revisada                    |
| M8    | Testes               | Testes executados e aprovados         |
| M9    | Documentação       | Documentação atualizada             |
| M10   | Entrega              | Aplicação funcionando integralmente |

### Primeira ação obrigatória

**COMECE EXCLUSIVAMENTE PELO MARCO M1 — DIAGNÓSTICO.**

Neste primeiro momento:

1. Examine todos os arquivos do projeto.
2. Identifique a tecnologia e a arquitetura.
3. Verifique o que foi exportado do Figma Make.
4. Identifique o estado real do primeiro formulário.
5. Examine as duas referências do Figma.
6. Identifique as dependências e os problemas da migração.
7. Avalie a estratégia de integração com SQL Server.
8. Produza o documento `docs/DIAGNOSTICO_TECNICO.md`.
9. Apresente o plano de execução.

**Não implemente o segundo formulário nesta primeira etapa.**

**Não recrie o frontend.**

**Não crie ou exclua bancos e tabelas antes de concluir a análise da modelagem.**

Ao finalizar o diagnóstico, apresente suas conclusões e aguarde a validação do plano antes de executar alterações estruturais relevantes.

A partir da aprovação, prossiga com os marcos seguintes, mantendo a documentação, os testes e a estabilidade do projeto como critérios permanentes de qualidade.

---

## OBJETIVO FINAL

Entregar uma aplicação que não dependa mais do Figma Make para funcionar, que seja executada localmente pelo VS Code, possua backend e integração efetiva com Microsoft SQL Server, tenha os dois formulários implementados e funcionando, e apresente código organizado, seguro, documentado e sustentável.

**O projeto só será considerado concluído quando a interface, as regras de negócio, a API e o banco de dados estiverem efetivamente integrados e validados.**
