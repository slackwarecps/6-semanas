# Phase 0: Research — Export Jornada para Anki

**Date**: 2026-07-15 | **Feature**: [spec.md](spec.md)

## Overview

Fase de pesquisa e validação técnica. A especificação não tinha [NEEDS CLARIFICATION] markers, então esta fase confirma decisões técnicas já evidentes no código existente e resolve qualquer ambiguidade durante a implementação.

## Decisions Made

### 1. Reutilização da Lógica do Skill `/exporta-sqlite-para-anki`

**Decision**: Extrair a lógica central de geração `.colpkg` do skill para um módulo Python reutilizável (`backend/services/anki_export.py`), mantendo o skill intacto.

**Rationale**: 
- Evita duplicação de código
- Garante que ambos (skill + feature) usam mesma formatação
- O skill continua independente

**Alternatives Considered**:
- ❌ Reimplementar tudo: duplicaria lógica complexa (separador 0x1F, config dconf/model, etc)
- ❌ Chamar skill como subprocess: overhead, frágil, difícil de debugar

**Implementation Detail**: 
- Refatorar `export.js` para extrair função `buildAnkiPackage(cards: Card[], outputPath: string)`
- Criar wrapper Python que chama Node.js via subprocess ou reimplanta logic mínima em Python
- ✅ **Escolhido**: Criar `backend/services/anki_export.py` em Python que reimplementa a lógica central (menos dependências, mais performático)

---

### 2. Relacionamento Cards ↔ Jornadas no Banco

**Decision**: Usar tabela de junção `jornada_perguntas` (M:M) que já existe no banco.

**Confirmed Structure**:
```sql
jornadas (user_id, id, nome, ativa, ...)
jornada_perguntas (user_id, jornadaId, cardId, ordem)
cards (user_id, id, seq, title, question, answer, tags, ...)
```

**Rationale**: 
- Banco já implementa esse relacionamento
- Função helper `_card_ids()` em `backend/routes/jornadas.py` já faz a query

**Query para exportação**:
```python
SELECT c.* FROM cards c
JOIN jornada_perguntas jp ON c.id = jp.cardId AND c.user_id = jp.user_id
WHERE jp.jornadaId = ? AND jp.user_id = ?
ORDER BY jp.ordem
```

---

### 3. Endpoint Backend: POST `/jornadas/{id}/export-anki`

**Decision**: Novo endpoint FastAPI que retorna arquivo `.colpkg` como attachment.

**HTTP Contract**:
```
POST /jornadas/{jornadaId}/export-anki
Headers: X-User-Id: {user_id}
Response: 200 OK
  - Content-Type: application/octet-stream
  - Content-Disposition: attachment; filename=jornada-{nome}-{date}.colpkg
  - Body: arquivo .colpkg (zip com collection.anki2 + media.json)
```

**Error Handling**:
- `404 Not Found`: Jornada não existe para esse user
- `400 Bad Request`: Jornada tem 0 cards
- `500 Internal Server Error`: Erro na geração do arquivo

**Rationale**:
- Isolamento por usuário (X-User-Id) via middleware existente
- Streaming de arquivo binary evita carregar em memória
- Segue padrão REST do projeto

---

### 4. Frontend: UI no Admin de Jornada

**Decision**: Botão "Exportar para Anki" na página `/admin/jornada` com feedback visual.

**Confirmed Location**: 
- Feature Angular: `src/app/features/admin-jornada/presentation/pages/`
- Componente existente: `admin-jornada.page.ts` recebe novo botão

**UX Flow**:
1. Admin vê botão "📥 Exportar para Anki" (ícone download)
2. Clica → spinner/toast aparece
3. Backend gera .colpkg
4. Download inicia automaticamente
5. Toast desaparece

**Rationale**:
- Reutiliza componente existente (sem nova feature isolada)
- Feedback visual = melhor UX
- Download automático = baixo atrito

---

### 5. Tecnologia: Geração do `.colpkg`

**Decision**: Python puro (SQLite CLI + zip) para gerar o arquivo `.colpkg`.

**Rationale**:
- Backend já é Python (FastAPI)
- SQLite CLI vem com macOS/Linux
- `zipfile` Python é nativa
- Evita dependência extra (não usar genanki)

**Alternativas Consideradas**:
- ❌ Usar biblioteca Python `genanki`: adiciona dependência, já temos lógica testada em Node
- ❌ Chamar skill Node.js: overhead, subprocess complexo
- ✅ **Reimplementar em Python**: ~200 linhas, mesma lógica que `export.js`

---

### 6. Validação de Caracteres Especiais

**Decision**: Preservar como-está (Unicode + emojis + acentos funcionam).

**Confirmed by Testing**:
- Banco SQLite suporta UTF-8 nativamente
- JSON.dumps/escaping HTML já trata caracteres especiais
- Anki importa `.colpkg` com UTF-8 sem problemas

---

## Unknowns Resolved

| Unknown | Resolution | Confirmed |
|---------|-----------|-----------|
| Existe relacionamento Cards ↔ Jornadas? | Sim, via `jornada_perguntas` (M:M) | ✅ |
| Qual formato retornar do backend? | `.colpkg` (ZIP) com streaming | ✅ |
| Isolamento por usuário? | X-User-Id header (existente) | ✅ |
| Reutilizar skill Node.js? | Não, reimplementar em Python | ✅ |
| Onde adicionar botão no frontend? | Admin-jornada page (feature Angular) | ✅ |

---

## Next Steps

→ **Phase 1: Design Artifacts**
- `data-model.md`: Entidades e relacionamentos
- `contracts/export-endpoint.md`: Contrato HTTP
- `quickstart.md`: Validação end-to-end
