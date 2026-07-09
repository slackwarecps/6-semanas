# Flashcards API - Documentação Completa

## Visão Geral

API FastAPI para gerenciar flashcards, jornadas de aprendizado e integração com LLMs (Claude e DeepSeek).

**Base URL:** `http://127.0.0.1:8000`

## Headers Requeridos

Todos os endpoints requerem isolamento por usuário via header:
```
X-User-Id: user123
```

## Estrutura da Pasta Postman

### Arquivos Individuais (.http)
Cada arquivo .http pode ser usado com a extensão "REST Client" do VS Code:

- **01_base.http** - Status da API
- **02_perguntar_claude.http** - Enviar pergunta ao LLM (Claude)
- **03_perguntar_deepseek.http** - Enviar pergunta ao LLM (DeepSeek)
- **04_cards_list.http** - Listar todos os cards
- **05_cards_get.http** - Obter card específico
- **06_cards_create.http** - Criar novo card
- **07_cards_update.http** - Atualizar card existente
- **08_cards_delete.http** - Deletar card
- **09_config_get.http** - Obter configuração
- **10_config_set_llm.http** - Atualizar LLM padrão
- **11_config_set_theme.http** - Atualizar tema
- **12_jornadas_list.http** - Listar jornadas
- **13_jornadas_get.http** - Obter jornada
- **14_jornadas_create.http** - Criar jornada
- **15_jornadas_update.http** - Atualizar jornada
- **16_jornadas_delete.http** - Deletar jornada
- **17_progresso_get.http** - Obter progresso da jornada
- **18_progresso_update_in_progress.http** - Marcar como em andamento
- **19_progresso_update_completed.http** - Marcar como completa
- **20_xp_get.http** - Obter XP total
- **21_xp_add.http** - Adicionar XP
- **22_xp_add_bonus.http** - Adicionar bonus XP
- **23_reset_progress.http** - Resetar progresso
- **24_delete_all_user_data.http** - Deletar todos dados

### Coleção Postman
- **FlashcardsAPI.postman_collection.json** - Coleção completa para importar no Postman

## Endpoints Detalhados

### 1. Base

#### GET /
Verifica se a API está rodando.

**Response (200):**
```json
{
  "status": "ok",
  "mensagem": "Envie um POST para /perguntar com {...}"
}
```

---

### 2. LLM (Perguntar)

#### POST /perguntar
Envia uma pergunta de múltipla escolha para análise por LLM.

**Request:**
```json
{
  "pergunta": "Texto da pergunta...",
  "provedor": "claude"  // ou "deepseek"
}
```

**Response (200):**
```json
{
  "resposta": "A alternativa correta",
  "explicacao": "Explicação técnica para Tech Lead...",
  "explicacaoCrianca": "Explicação simplificada para criança...",
  "provedor": "claude",
  "modelo": "claude-opus-4-8"
}
```

---

### 3. Cards (CRUD de Flashcards)

#### GET /cards
Lista todos os cards do usuário.

**Response (200):**
```json
[
  {
    "id": "card-001",
    "seq": 1,
    "title": "React Hooks",
    "question": "O que é um Hook?",
    "answer": "Uma função que permite usar state...",
    "options": [
      {
        "id": "opt-1",
        "text": "Uma função que permite usar state",
        "isCorrect": true,
        "order": 1
      }
    ],
    "tags": ["react", "javascript"],
    "state": "Learning",
    "interval": 1,
    "easeFactor": 2.6,
    "repetitions": 1,
    "attempts": [
      {
        "timestamp": 1720209591000,
        "quality": 4,
        "elapsedTime": 5000,
        "wasCorrect": true,
        "userAnswer": "opt-1",
        "easeFactorBefore": 2.5,
        "easeFactorAfter": 2.6,
        "intervalBefore": 0,
        "intervalAfter": 1
      }
    ],
    "createdAt": 1720209591000,
    "updatedAt": 1720209592000,
    "nextReviewDate": 1720296591000,
    "traducao": "What is a Hook?",
    "explanation": "Hooks são funções...",
    "tenYearOld": "Um Hook é como uma mágica..."
  }
]
```

#### GET /cards/{card_id}
Obtém um card específico.

**Response (200):** CardDTO (mesma estrutura acima)

**Response (404):** 
```json
{"detail": "Card 'card-001' não encontrado."}
```

#### POST /cards
Cria um novo card ou atualiza um existente.

**Request:**
```json
{
  "id": "card-novo-001",
  "title": "React Hooks",
  "question": "O que é um Hook em React?",
  "answer": "Uma função que permite usar state...",
  "tags": ["react", "javascript", "hooks"],
  "options": [
    {
      "id": "opt-1",
      "text": "Uma função que permite usar state",
      "isCorrect": true,
      "order": 1
    }
  ],
  "state": "New",
  "interval": 0,
  "easeFactor": 2.5,
  "repetitions": 0,
  "attempts": [],
  "createdAt": 1720209591000,
  "updatedAt": 1720209591000,
  "nextReviewDate": 1720209591000,
  "traducao": "What is a Hook in React?",
  "explanation": "Hooks são funções especiais...",
  "tenYearOld": "Um Hook é como uma mágica..."
}
```

**Behavior:**
- **Create:** Automaticamente atribui o próximo `seq`
- **Update:** Mantém `createdAt` e `seq` originais, substitui tudo mais

**Response (200):** CardDTO

#### DELETE /cards/{card_id}
Deleta um card e todos seus dados.

**Response (204):** No Content

**Nota:** Idempotente - retorna 204 mesmo se card não existir

---

### 4. Configuração

#### GET /config/{chave}
Obtém uma configuração específica.

**Response (200):**
```json
{
  "chave": "LLM_QUERY_DEFAULT",
  "valor": "claude"
}
```

**Response (404):** Se chave não existir

#### PUT /config/{chave}
Cria ou atualiza uma configuração.

**Request:**
```json
{
  "valor": "claude"
}
```

**Response (200):**
```json
{
  "chave": "LLM_QUERY_DEFAULT",
  "valor": "claude"
}
```

---

### 5. Jornadas (Learning Paths)

#### GET /jornadas
Lista todas as jornadas.

**Response (200):**
```json
[
  {
    "id": "jornada-react-basics",
    "nome": "React Basics",
    "ativa": true,
    "ordem": 1,
    "createdAt": 1720209591000,
    "updatedAt": 1720209591000,
    "cardIds": ["card-001", "card-002", "card-003"]
  }
]
```

#### GET /jornadas/{jornada_id}
Obtém uma jornada específica.

**Response (200):** JornadaDTO

**Response (404):** Se jornada não existir

#### POST /jornadas
Cria uma nova jornada ou atualiza uma existente.

**Request:**
```json
{
  "id": "jornada-react-basics",
  "nome": "React Basics",
  "ativa": true,
  "ordem": 1,
  "createdAt": 1720209591000,
  "updatedAt": 1720209591000,
  "cardIds": ["card-001", "card-002", "card-003"]
}
```

**Behavior:**
- **Create:** Atribui novo `createdAt`
- **Update:** Mantém `createdAt` original, substitui `cardIds` completamente

**Response (200):** JornadaDTO

#### DELETE /jornadas/{jornada_id}
Deleta uma jornada e todos seus dados.

**Response (204):** No Content

---

### 6. Progresso da Jornada

#### GET /jornadas/{jornada_id}/progresso
Obtém o progresso de uma jornada.

**Response (200):**
```json
{
  "jornadaId": "jornada-001",
  "status": "in-progress",
  "bestErrors": 2,
  "completedAt": null,
  "currentQuestionIndex": 3,
  "currentErrors": 1,
  "currentLives": 2,
  "lastActiveAt": 1720209591000,
  "bestTime": 45000
}
```

**Response (404):** Se progresso não existir

#### PUT /jornadas/{jornada_id}/progresso
Cria ou atualiza o progresso de uma jornada.

**Request:**
```json
{
  "jornadaId": "jornada-001",
  "status": "in-progress",
  "bestErrors": 2,
  "completedAt": null,
  "currentQuestionIndex": 3,
  "currentErrors": 1,
  "currentLives": 2,
  "lastActiveAt": 1720209591000,
  "bestTime": 45000
}
```

**Status possíveis:**
- `not-started`
- `in-progress`
- `completed`
- `abandoned`

**Response (200):** ProgressoDTO

---

### 7. XP (Learn Stats)

#### GET /learn/xp
Obtém o XP total do usuário.

**Response (200):**
```json
{
  "totalXp": 1500
}
```

#### POST /learn/xp
Adiciona XP ao usuário.

**Request:**
```json
{
  "amount": 100
}
```

**Response (200):**
```json
{
  "totalXp": 1600
}
```

---

### 8. Reset e Deleção

#### POST /learn/reset-progress
Reseta todo progresso e XP do usuário.

**O que é mantido:**
- Cards
- Jornadas
- Configurações

**O que é deletado:**
- Progresso de jornadas
- XP

**Response (204):** No Content

#### DELETE /user-data
⚠️ **DELETA TODOS OS DADOS DO USUÁRIO**

**O que é deletado:**
- Cards
- Options dos cards
- Attempts dos cards
- Jornadas
- Perguntas das jornadas
- Progresso
- XP
- Configurações

**Response (204):** No Content

---

## Como Usar

### Com VS Code (REST Client)

1. Instale a extensão "REST Client" (humao.rest-client)
2. Abra qualquer arquivo `.http`
3. Clique em "Send Request" acima da requisição

### Com Postman

1. Abra o Postman
2. Clique em "Import"
3. Selecione `FlashcardsAPI.postman_collection.json`
4. Configure a variável `baseUrl` em "Variables"
5. Use as requisições pré-configuradas

### Com curl

```bash
curl -X GET http://127.0.0.1:8000/cards \
  -H "X-User-Id: user123"
```

---

## DTOs Principais

### CardDTO
```typescript
{
  id: string
  seq?: number
  title: string
  question: string
  answer: string
  options: OptionDTO[]
  tags: string[]
  state: string
  interval: number
  easeFactor: number
  repetitions: number
  attempts: AttemptDTO[]
  createdAt: number
  updatedAt: number
  nextReviewDate: number
  traducao?: string
  explanation?: string
  tenYearOld?: string
}
```

### JornadaDTO
```typescript
{
  id: string
  nome: string
  ativa: boolean
  ordem: number
  createdAt: number
  updatedAt: number
  cardIds: string[]
}
```

### ProgressoDTO
```typescript
{
  jornadaId: string
  status: string
  bestErrors?: number
  completedAt?: number
  currentQuestionIndex: number
  currentErrors: number
  currentLives: number
  lastActiveAt?: number
  bestTime?: number
}
```

---

## Notas Importantes

1. **Timestamps:** Todos os timestamps estão em milissegundos desde epoch (ms)

2. **Isolamento por Usuário:** O header `X-User-Id` é obrigatório para isolar dados entre usuários

3. **Idempotência:** DELETE é idempotente - pode chamar múltiplas vezes com segurança

4. **Update de cards:** Ao atualizar um card, `createdAt` e `seq` são preservados automaticamente

5. **Update de jornadas:** Ao atualizar uma jornada, `cardIds` é SUBSTITUÍDO completamente (não é merge)

6. **Timestamps:** Use `Date.now()` (JavaScript) ou equivalente para gerar timestamps em ms

---

## Exemplos de Fluxo Típico

### 1. Criar um card, depois listar
```bash
# Criar
POST /cards
X-User-Id: user123
{...card_data...}

# Listar
GET /cards
X-User-Id: user123
```

### 2. Criar jornada com cards, marcar como em andamento
```bash
# Criar jornada
POST /jornadas
X-User-Id: user123
{...jornada_data...}

# Atualizar progresso
PUT /jornadas/{id}/progresso
X-User-Id: user123
{"status": "in-progress", ...}

# Marcar como completa
PUT /jornadas/{id}/progresso
X-User-Id: user123
{"status": "completed", ...}

# Adicionar XP
POST /learn/xp
X-User-Id: user123
{"amount": 500}
```

### 3. Resetar dados do usuário
```bash
# Resetar apenas progresso e XP
POST /learn/reset-progress
X-User-Id: user123

# Ou deletar tudo
DELETE /user-data
X-User-Id: user123
```

---

## Troubleshooting

### 404 - Not Found
- Verifique se o `X-User-Id` está correto
- Verifique se o ID do recurso existe

### 400 - Bad Request
- Verifique se o JSON está válido
- Verifique se todos os campos obrigatórios estão presentes

### 500 - Internal Server Error
- Verifique os logs em `backend/logs/server.log`
- Reinicie a API: `uvicorn main:app --reload`

---

## Changelog

### v1.0 - 2024-07-05
- Release inicial com 24 endpoints
- Suporte para Claude e DeepSeek
- CRUD completo de cards, jornadas e configurações
- Sistema de progresso e XP
