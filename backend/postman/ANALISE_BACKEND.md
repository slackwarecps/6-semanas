# 🔍 Análise do Backend - Flashcards API

## 📊 Visão Geral da Arquitetura

### Stack Tecnológico

```
┌─────────────────────────────────────┐
│    Fastapi (Python Web Framework)   │
├─────────────────────────────────────┤
│  SQLModel (ORM + Data Validation)   │
├─────────────────────────────────────┤
│  SQLite (Database)                  │
├─────────────────────────────────────┤
│  LangChain (LLM Integration)        │
├─────────────────────────────────────┤
│  Claude API + DeepSeek API          │
└─────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Módulos

### 1. **main.py** (Core API)
- ✅ FastAPI app initialization
- ✅ CORS middleware (localhost:4200)
- ✅ Global exception handler
- ✅ Request/Response logging
- ✅ LLM integration (Claude + DeepSeek)
- ✅ Structured output with Pydantic

**Endpoints:**
- `GET /` - Status
- `POST /perguntar` - Query LLM

### 2. **routes/cards.py** (Card Management)
- ✅ CRUD operations
- ✅ User isolation via X-User-Id
- ✅ Nested relationships (options, attempts)
- ✅ Sequential ordering (seq)
- ✅ Atomic operations

**Endpoints:**
- `GET /cards` - List all
- `GET /cards/{id}` - Get one
- `POST /cards` - Create/Update (upsert)
- `DELETE /cards/{id}` - Delete

**Key Features:**
- Preserves `createdAt` and `seq` on update
- Replaces `options` and `attempts` completely
- Idempotent delete

### 3. **routes/config.py** (Configuration)
- ✅ User-specific settings
- ✅ Key-value store
- ✅ Upsert semantics

**Endpoints:**
- `GET /config/{chave}` - Get config
- `PUT /config/{chave}` - Set config

**Common Keys:**
- `LLM_QUERY_DEFAULT` - LLM provider
- `THEME` - UI theme
- `LANGUAGE` - Preferred language

### 4. **routes/jornadas.py** (Learning Paths)
- ✅ Journey management
- ✅ Progress tracking
- ✅ XP/Stats system
- ✅ Complete reset functionality

**Endpoints:**
- `GET /jornadas` - List
- `GET /jornadas/{id}` - Get one
- `POST /jornadas` - Create/Update
- `DELETE /jornadas/{id}` - Delete
- `GET /jornadas/{id}/progresso` - Get progress
- `PUT /jornadas/{id}/progresso` - Update progress
- `GET /learn/xp` - Get XP
- `POST /learn/xp` - Add XP
- `POST /learn/reset-progress` - Reset all progress
- `DELETE /user-data` - ⚠️ Delete all user data

### 5. **database.py** (Data Models)
- ✅ SQLModel schema definitions
- ✅ User isolation (composite keys)
- ✅ Relationship handling

**Models:**
```
Card
├── CardOption
└── Attempt

Jornada
└── JornadaPergunta
    └── JornadaProgresso

AppConfig
LearnStats
```

### 6. **routes/deps.py** (Dependencies)
- ✅ X-User-Id extraction
- ✅ Session management

---

## 🗄️ Database Schema

### Tables

| Table | Purpose | Columns |
|-------|---------|---------|
| `card` | Flashcards | id, user_id, seq, title, question, answer, tags, state, interval, easeFactor, repetitions, createdAt, updatedAt, nextReviewDate, traducao, explanation, tenYearOld |
| `card_option` | Multiple choice options | user_id, cardId, optionId, text, isCorrect, optionOrder |
| `attempt` | Learning attempts | user_id, cardId, attemptId, timestamp, quality, elapsedTime, wasCorrect, userAnswer, easeFactorBefore/After, intervalBefore/After |
| `jornada` | Learning paths | id, user_id, nome, ativa, ordem, createdAt, updatedAt |
| `jornada_pergunta` | Card linkage to journeys | user_id, jornadaId, cardId, ordem |
| `jornada_progresso` | Journey progress | user_id, jornadaId, status, bestErrors, completedAt, currentQuestionIndex, currentErrors, currentLives, lastActiveAt, bestTime |
| `app_config` | User settings | user_id, chave, valor |
| `learn_stats` | User statistics | user_id, totalXp |

### Key Design Decisions

1. **Composite Primary Keys**: (user_id, resource_id)
   - Ensures complete user isolation
   - No cross-user data leaks

2. **Denormalized Tags**: Stored as JSON string
   - Flexible tag management
   - No separate tag table needed

3. **Attempt ID Format**: `{cardId}:{index}`
   - Matches legacy frontend behavior
   - Simple recovery mechanism

4. **Seq Counter**: Per-user sequential numbering
   - Maintains card order
   - Auto-incremented on create

---

## 🔄 Data Flow

### Card Lifecycle

```
CREATE /cards
  ├─ Generate next seq
  ├─ Insert Card
  ├─ Insert Options
  └─ Insert Attempts
     │
     ↓ Returns CardDTO

GET /cards/{id}
  ├─ Load Card
  ├─ Load Options
  ├─ Load Attempts
  └─ Convert to DTO

POST /cards (update)
  ├─ Load existing Card
  ├─ Update fields
  ├─ Preserve createdAt & seq
  ├─ Delete old Options/Attempts
  ├─ Insert new Options/Attempts
  └─ Returns updated CardDTO

DELETE /cards/{id}
  ├─ Delete Options
  ├─ Delete Attempts
  ├─ Delete Card (if exists)
  └─ Returns 204 (idempotent)
```

### Journey Lifecycle

```
CREATE /jornadas
  ├─ Insert Jornada
  ├─ Delete old JornadaPerguntas
  ├─ Insert new JornadaPerguntas
  └─ Returns JornadaDTO

PUT /jornadas/{id}/progresso
  ├─ Load or create JornadaProgresso
  ├─ Update all fields
  ├─ Commit transaction
  └─ Returns ProgressoDTO

POST /learn/xp
  ├─ Load or create LearnStats
  ├─ Increment totalXp
  ├─ Commit
  └─ Returns new total

DELETE /user-data
  ├─ Delete all Attempts
  ├─ Delete all CardOptions
  ├─ Delete all Cards
  ├─ Delete all JornadaPerguntas
  ├─ Delete all JornadaProgressos
  ├─ Delete all Jornadas
  ├─ Delete all LearnStats
  ├─ Delete all AppConfigs
  └─ Returns 204
```

---

## 🔐 Security Features

### User Isolation

```python
# Every query includes user_id check
session.exec(
    select(Card).where(
        Card.user_id == user_id,  # ← Mandatory
        Card.id == card_id
    )
)
```

### Headers

- `X-User-Id` - Required for all endpoints
- `Content-Type: application/json` - For POST/PUT
- CORS restricted to localhost:4200

### No Authentication Layer

⚠️ **Note**: API relies on X-User-Id header for isolation
- No JWT/Session validation
- Suitable for trusted environments
- Frontend responsible for X-User-Id management

---

## 📊 Response Patterns

### Success (200-204)

```json
{
  "id": "card-001",
  "title": "React Hooks",
  ...
}
```

### 404 - Not Found

```json
{
  "detail": "Card 'card-001' não encontrado."
}
```

### 400 - Bad Request

```json
{
  "detail": "A pergunta não pode estar vazia."
}
```

### 500 - Server Error

```json
{
  "detail": "Erro interno do servidor. Verifique os logs."
}
```

---

## 📝 Logging

### Log Format

```
2024-07-05 20:19:51 | INFO     | >> REQUEST  GET /cards | client=127.0.0.1
2024-07-05 20:19:51 | INFO     | << RESPONSE GET /cards | status=200 | duration=0.045s
```

### Log Location

```
backend/logs/server.log
```

### Logged Information

- Request method, path, client IP
- Request body (for POST/PUT)
- Response status, duration
- LLM requests/responses
- Exceptions and stack traces

---

## 🎯 API Constraints & Behaviors

### Immutable Fields

On **UPDATE** (POST /cards):
- ✅ `createdAt` - Preserved
- ✅ `seq` - Preserved
- ✅ All others - Overwritten

On **UPDATE** (POST /jornadas):
- ✅ `createdAt` - Preserved
- ✅ `cardIds` - **Completely replaced**

### Upsert Semantics

```python
# GET config/LLM_QUERY_DEFAULT → 404 if new
# PUT config/LLM_QUERY_DEFAULT → creates or updates
# POST learn/xp → creates or updates stats
```

### Idempotent Operations

```python
DELETE /cards/nonexistent      # 204
DELETE /cards/nonexistent      # 204 (same)
POST /learn/reset-progress     # 204
POST /learn/reset-progress     # 204 (same)
```

---

## 🚀 Performance Considerations

### Optimizations

1. **Batch Loading** (cards.py:list_cards)
   ```python
   # Load all options/attempts once
   options_por_card = {}
   for option in session.exec(select(CardOption)):
       options_por_card.setdefault(option.cardId, []).append(option)
   # Avoid N+1 queries
   ```

2. **Sequential Ordering**
   ```python
   order_by(Card.seq)  # Maintains card order
   ```

3. **Composite Keys**
   - User isolation built-in
   - No filtering needed

### Query Count per Endpoint

| Endpoint | Queries |
|----------|---------|
| GET / | 1 |
| POST /perguntar | 1 (LLM call) |
| GET /cards | 3 (cards + options + attempts) |
| GET /cards/{id} | 3 (card + options + attempts) |
| POST /cards | 5 (select + delete + insert×3) |
| DELETE /cards/{id} | 3 (options + attempts + card) |

---

## 📋 Dependencies

```
fastapi              - Web framework
sqlmodel            - ORM + validation
sqlalchemy          - Database layer
pydantic            - Data validation
langchain-anthropic - Claude integration
langchain-deepseek  - DeepSeek integration
python-dotenv       - Environment variables
uvicorn             - ASGI server
```

---

## 🔧 Development Notes

### Database Initialization

```python
@app.on_event("startup")
async def log_startup():
    create_db_and_tables()
```

- Runs on startup
- Creates schema if needed
- Database file: `backend/database.sqlite`

### Environment Variables

```
ANTHROPIC_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
ANTHROPIC_MODEL=claude-opus-4-8
DEEPSEEK_MODEL=deepseek-chat
```

### Running

```bash
cd backend
uvicorn main:app --reload  # Dev with hot reload
uvicorn main:app           # Production
```

---

## 📈 Summary

| Aspect | Status |
|--------|--------|
| Architecture | ✅ Modular, well-organized |
| Data Model | ✅ Proper normalization |
| User Isolation | ✅ Complete via composite keys |
| Error Handling | ✅ Consistent responses |
| Logging | ✅ Comprehensive |
| Performance | ✅ Optimized queries |
| Security | ⚠️ Client-side header management |
| Documentation | ✅ Excellent inline comments |

---

**Analysis Date:** 2024-07-05
**API Version:** 1.0
**Total Endpoints:** 24
**Modules:** 6
