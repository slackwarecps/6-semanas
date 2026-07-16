# Phase 1: Data Model — Export Jornada para Anki

**Date**: 2026-07-15 | **Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

## Overview

Modelo de dados para a feature de exportação de jornadas para Anki. Descreve entidades, relacionamentos, validações e transformações necessárias.

## Domain Entities

### Jornada (Journey/Quest)

**Representa**: Uma coleção gamificada de flashcards que o usuário estuda em sequência.

**Attributes**:
- `id` (str, PK): Identificador único por usuário
- `user_id` (str, PK): Isolamento por usuário
- `nome` (str, required): Título legível (ex: "História Medieval")
- `ativa` (bool, default=False): Se jornada está ativa/habilitada
- `ordem` (int, default=0): Posição na lista de jornadas
- `tipoJornada` (str, default='normal'): Tipo (normal/desafio)
- `duracao` (int, default=120): Duração estimada em minutos
- `pontosTentativas` (int, default=3): Vidas/tentativas
- `createdAt` (int, epoch ms): Timestamp criação
- `updatedAt` (int, epoch ms): Timestamp última modificação

**Validations**:
- `nome` não vazio e < 255 caracteres
- `ordem` >= 0
- `duracao` > 0
- `createdAt` e `updatedAt` > 0

**Relationships**:
- 1:N com `JornadaPergunta` (muitas perguntas por jornada)

---

### Card (Flashcard)

**Representa**: Um flashcard individual com pergunta, resposta, tags e histórico de estudo.

**Attributes**:
- `id` (str, PK): Identificador único por usuário
- `user_id` (str, PK): Isolamento por usuário
- `seq` (int): Número sequencial do card (~1-540)
- `title` (str, required): Título/tópico do card
- `question` (str, required): Pergunta + alternativas (format: "Pergunta?\n[ ] A - Alt1\n[ ] B - Alt2...")
- `answer` (str, required): Alternativa correta (format: "B - Texto resposta")
- `explanation` (str, optional): Justificativa/explanation
- `tags` (str, optional): Tags em JSON array (ex: '["história", "medieval"]')
- `state` (str): Estado estudo (ex: 'new', 'learning', 'review', 'suspended')
- `interval` (int): Intervalo revisão (dias)
- `easeFactor` (float): Fator de dificuldade (SM-2 algorithm)
- `repetitions` (int): Total de repetições
- `nextReviewDate` (int, epoch ms): Data próxima revisão
- `flagged` (int, default=0): Se card está marcado
- `createdAt` (int, epoch ms): Timestamp criação
- `updatedAt` (int, epoch ms): Timestamp última modificação

**Validations**:
- `title` não vazio e < 255 caracteres
- `question` e `answer` não vazios
- `tags` é JSON array válido (ou null/empty)
- `seq` > 0
- Estado deve ser um de: 'new', 'learning', 'review', 'suspended'

**Relationships**:
- N:M com `Jornada` via `JornadaPergunta`

---

### JornadaPergunta (JourneyQuestion/Junction)

**Representa**: Relacionamento M:M entre Jornada e Card, preservando ordem.

**Attributes**:
- `user_id` (str, PK): Isolamento por usuário
- `jornadaId` (str, FK): Referência à jornada
- `cardId` (str, FK): Referência ao card
- `ordem` (int): Posição do card dentro da jornada (1, 2, 3, ...)

**Validations**:
- `ordem` > 0
- `jornadaId` e `cardId` devem existir
- Combinação (user_id, jornadaId, cardId) é única

**Relationships**:
- N:1 com `Jornada` (muitos cards por jornada)
- N:1 com `Card` (many jornadas share um card)

---

## Transformations for Export

### Card → Anki Card

Durante a exportação, cada `Card` é transformado para o formato Anki:

| Source (DB) | → | Target (Anki) | Notes |
|-------------|---|---------------|-------|
| `title` + `question` | → | **Front** | HTML format: `<b>title</b><br><br>question` |
| `answer` | → | **Back** | Escapado HTML, preserva separador 0x1F |
| `tags` (JSON array) | → | **Tags** | Espaço-separado (ex: "história medieval") |
| `explanation` | → | *(optional)* | Descartado na MVP (pode ser adicionado ao Back depois) |

**HTML Escaping**: 
- Aplicado apenas ao conteúdo do usuário (title/question/answer)
- Tags HTML estruturais (`<b>`, `<br>`, `<hr>`) não são escapadas

**Tag Cleanup**:
- Remove prefixo "Tags:" (resíduo do seed antigo)
- Converte para espaço-separado (Anki format)
- Remove tags vazias

---

## Constraints & Business Rules

### Export Constraints

1. **Filtragem por Jornada**: Apenas cards dessa jornada são inclusos
2. **Validação de Conteúdo**: Rejeita jornada com 0 cards
3. **Isolamento de Usuário**: X-User-Id header garante que usuário só vê seus dados
4. **Performance**: Export de ~200 cards deve completar em < 5 segundos

### Data Integrity

1. **Unicode**: Preservar caracteres especiais, emojis, acentos
2. **Sequência**: Cards devem manter ordem definida em `JornadaPergunta.ordem`
3. **Tags**: Preservar exatamente como armazenado (JSON → espaço-separado Anki)

---

## Database Queries Reference

### Query: Recuperar Cards de uma Jornada (em ordem)

```sql
SELECT c.*
FROM cards c
JOIN jornada_perguntas jp ON c.id = jp.cardId AND c.user_id = jp.user_id
WHERE jp.jornadaId = ? AND jp.user_id = ?
ORDER BY jp.ordem ASC
```

### Query: Validar Jornada Existe e tem Cards

```sql
SELECT COUNT(jp.cardId) as total_cards
FROM jornada_perguntas jp
WHERE jp.jornadaId = ? AND jp.user_id = ?
```

---

## Diagram: Export Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Admin clica "Exportar para Anki" em jornada X               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend chama POST /jornadas/{id}/export-anki              │
│ Header: X-User-Id: user123                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: Valida jornada existe + tem cards                  │
│ Query: SELECT COUNT(*) FROM jornada_perguntas               │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
    (0 cards)            (> 0 cards)
    ▼                       ▼
  400 ─────────────────────▶ Backend: Recupera cards em ordem
  Bad Request             SELECT c.* FROM cards c
                          JOIN jornada_perguntas...
                                    │
                                    ▼
                          Transform cada Card
                          → Anki Format (Front/Back)
                                    │
                                    ▼
                          Gera collection.anki2
                          (SQLite legado, ver=11)
                                    │
                                    ▼
                          ZIP: collection.anki2 + media.json
                          → jornada-{nome}-{date}.colpkg
                                    │
                                    ▼
                          200 OK + arquivo (stream)
                                    │
                                    ▼
                          Frontend: Download inicia
                          Toast: "Exportação completa"
```

---

## Next Steps

→ **Phase 1 Contracts**: Define HTTP endpoint contract em `contracts/export-endpoint.md`
→ **Phase 1 Quickstart**: Descreve validação end-to-end em `quickstart.md`
