# HTTP Contract: Export Jornada to Anki

**Endpoint**: `POST /jornadas/{jornadaId}/export-anki`

**Date**: 2026-07-15 | **Feature**: Export Jornada para Anki

## Request

### Endpoint

```
POST /jornadas/{jornadaId}/export-anki
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jornadaId` | string | Yes | Identificador único da jornada (UUID ou slug) |

### Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `X-User-Id` | string | Yes | ID do usuário autenticado (middleware existente) |
| `Content-Type` | `application/json` | No | Request body (vazio) |

### Request Body

Empty (sem body necessário).

**Example**:
```bash
curl -X POST http://localhost:8000/jornadas/123/export-anki \
  -H "X-User-Id: user_abc123"
```

---

## Response

### Success Response (200 OK)

**Status**: `200 OK`

**Content-Type**: `application/octet-stream`

**Headers**:
```
Content-Disposition: attachment; filename="jornada-historia-medieval-2026-07-15.colpkg"
Content-Length: <file-size-bytes>
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Body**: Binary file (.colpkg = ZIP archive)

**Structure** (inside ZIP):
```
anki-exported.colpkg
├── collection.anki2    (SQLite database, Anki v11 schema)
└── media               (JSON: {})
```

**Example Response Headers**:
```
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="jornada-historia-medieval-2026-07-15.colpkg"
Content-Length: 45823
Transfer-Encoding: chunked
```

### Error Responses

#### 404 Not Found — Jornada Não Existe

**Condition**: Jornada com `jornadaId` não existe para o usuário.

**Status**: `404 Not Found`

**Content-Type**: `application/json`

**Body**:
```json
{
  "detail": "Jornada não encontrada"
}
```

---

#### 400 Bad Request — Jornada Sem Cards

**Condition**: Jornada existe mas tem 0 cards associados.

**Status**: `400 Bad Request`

**Content-Type**: `application/json`

**Body**:
```json
{
  "detail": "Nenhum card para exportar nesta jornada"
}
```

---

#### 500 Internal Server Error — Erro na Geração

**Condition**: Erro ao gerar arquivo `.colpkg` (erro de I/O, permissões, etc).

**Status**: `500 Internal Server Error`

**Content-Type**: `application/json`

**Body**:
```json
{
  "detail": "Erro ao exportar jornada para Anki"
}
```

---

## Semantic Constraints

### Business Rules

1. **Isolamento por Usuário**: Endpoint DEVE retornar 404 se jornada não pertence ao usuário (header X-User-Id)
2. **Validação de Conteúdo**: Rejeita jornadas vazias (0 cards) com 400
3. **Transação Segura**: Exportação não deve modificar dados da jornada (read-only)
4. **Performance**: Deve completar em < 5 segundos para jornadas de até 200 cards

### File Naming Convention

```
jornada-{slugified-nome}-{YYYY-MM-DD}.colpkg

Examples:
- jornada-historia-medieval-2026-07-15.colpkg
- jornada-python-basico-2026-07-15.colpkg
- jornada-english-vocabulary-2026-07-15.colpkg
```

**Rules**:
- Nomes longos são truncados a 100 caracteres (nome + data)
- Caracteres inválidos (/, \, :, *, etc) são substituídos por `-`
- Acentos/caracteres especiais são removidos ou transliterados

---

## Data Format: .colpkg (Anki Package)

### Overview

`.colpkg` é um arquivo ZIP contendo:
1. `collection.anki2`: Banco SQLite com schema legado Anki (v11)
2. `media`: Arquivo JSON vazio `{}` (sem mídia nesta feature)

### collection.anki2 Schema

Tabelas principais:

| Tabela | Descrição |
|--------|-----------|
| `col` | Metadados da coleção (1 row) |
| `notes` | Anotações (uma por card) |
| `cards` | Cards agendados (uma por note) |
| `revlog` | Histórico de revisão (vazio na export) |
| `models` | Template de note types (1 row) |
| `decks` | Configuração de decks (1 row) |

### Card Structure (Anki Format)

Cada card exportado tem:

**Front** (campo):
```html
<b>Título do Card</b><br><br>Pergunta com alternativas?
[ ] A - Alternativa 1
[ ] B - Alternativa 2
[ ] C - Alternativa 3
[ ] D - Alternativa 4
```

**Back** (campo):
```
D - Resposta correta e explicação (se houver)
```

**Tags** (espaço-separado):
```
história medieval europa idade-média
```

---

## Testing Strategy

### Smoke Test (Manual)

1. Execute endpoint: `POST /jornadas/{id}/export-anki`
2. Verificar status 200 e arquivo retornado
3. Abrir arquivo em Anki → verificar que cards aparecem

### Contract Test (Automated)

```python
def test_export_endpoint_success(client, user_id):
    response = client.post(
        f"/jornadas/{jornada_id}/export-anki",
        headers={"X-User-Id": user_id}
    )
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/octet-stream"
    assert "jornada-" in response.headers["Content-Disposition"]
    assert len(response.content) > 0

def test_export_endpoint_not_found(client, user_id):
    response = client.post(
        "/jornadas/nonexistent/export-anki",
        headers={"X-User-Id": user_id}
    )
    assert response.status_code == 404

def test_export_endpoint_empty_jornada(client, user_id):
    # Jornada sem cards
    response = client.post(
        f"/jornadas/{empty_jornada_id}/export-anki",
        headers={"X-User-Id": user_id}
    )
    assert response.status_code == 400
```

---

## Integration Points

### Frontend Call

```typescript
// In export-jornada.adapter.ts
exportJornadaToAnki(jornadaId: string): Observable<Blob> {
  return this.http.post(
    `/jornadas/${jornadaId}/export-anki`,
    null,
    {
      responseType: 'blob',
      headers: { 'X-User-Id': this.currentUserId }
    }
  );
}

// Usage in component
this.adapter.exportJornadaToAnki(jornadaId).subscribe(
  (blob) => {
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jornada-${name}-${date}.colpkg`;
    a.click();
  }
);
```

### Backend Implementation

```python
# In backend/routes/jornadas.py
@router.post("/jornadas/{jornada_id}/export-anki")
def export_jornada_to_anki(
    jornada_id: str,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_user_id)
) -> FileResponse:
    # 1. Validate jornada exists
    # 2. Get cards for jornada
    # 3. Generate .colpkg
    # 4. Return as streaming response
```

---

## Backwards Compatibility

This is a **new endpoint** (no breaking changes). Existing endpoints remain unchanged:
- `GET /jornadas` (list)
- `GET /jornadas/{id}` (detail)
- `POST /jornadas` (create)
- `DELETE /jornadas/{id}` (delete)

No migration or versioning needed.

---

## Security Considerations

1. **Authentication**: Header X-User-Id MUST be validated (middleware existente)
2. **Authorization**: Endpoint MUST verify jornada belongs to authenticated user
3. **File Size Limit**: Implementar max 50MB para .colpkg (proteção contra DoS)
4. **Rate Limiting**: Considerar rate limit (ex: 10 exports por hora por usuário)
5. **Logging**: Log todas as exportações para auditoria

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Latency (p50) | < 2s | Jornadas pequenas (<50 cards) |
| Latency (p95) | < 5s | Jornadas médias (50-200 cards) |
| Throughput | ≥ 20 req/s | Sem rate limiting |
| Memory | < 100MB | Para jornadas até 500 cards |

---

## Example Curl Command

```bash
# Export jornada
curl -X POST http://localhost:8000/jornadas/abc123/export-anki \
  -H "X-User-Id: user_xyz" \
  -o jornada-historia.colpkg

# Verify file
file jornada-historia.colpkg  # output: ZIP archive data

# Import in Anki (manual)
# Open Anki → File → Import → select jornada-historia.colpkg
```
