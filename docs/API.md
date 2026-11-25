# Manual de Endpoints da API Local

A API é executada localmente na porta configurada (padrão `3333`) com prefixo opcional `/api`.

---

## 1. `GET /api/health`
Retorna o status do servidor e a engine de persistência ativa.

**Exemplo de Resposta:**
```json
{
  "ok": true,
  "banco": "mssql",
  "bancoNome": "ClinicaEscolaAnamnese"
}
```

---

## 2. `GET /api/fichas`
Lista todas as fichas cadastradas, ordenadas pela data da última atualização decrescente.

**Query Parameters:**
- `cpf` *(opcional)*: Filtra por CPF do paciente.
- `tipo` *(opcional)*: `facial` ou `corporal`.

**Exemplo de Resposta:**
```json
[
  {
    "id": 1,
    "tipo": "facial",
    "versao": 1,
    "status": "concluida",
    "paciente_cpf": "123.456.789-00",
    "paciente_nome": "Maria das Graças Silva",
    "atualizado_em": "2026-11-25T19:51:07.407Z"
  }
]
```

---

## 3. `GET /api/fichas/:id`
Retorna o documento completo de uma ficha por ID.

---

## 4. `POST /api/fichas`
Cria uma nova versão de ficha (como rascunho ou como versão concluída).

*Regras de Validação para Conclusão (`status: "concluida"`):*
- Queixa principal é obrigatória.
- Aceite do TCLE (`tcle.aceito = true`) é obrigatório.
- Assinatura digital (`tcle.assinatura_png`) é obrigatória.

---

## 5. `PUT /api/fichas/:id`
Atualiza um rascunho existente. Versões com status `concluida` são imutáveis e rejeitadas com HTTP 409.
