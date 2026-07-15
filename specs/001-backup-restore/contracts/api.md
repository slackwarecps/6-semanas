# API Contract: Backup & Restore REST Endpoints

**Version**: 1.0 | **Date**: 2026-07-15 | **Base Path**: `/api/backups` or `/backups`

## Overview

REST API for managing SQLite database backups. All endpoints require user authentication (token in Authorization header). No role-based authorization for MVP (any authenticated user can access).

**Authentication**: Bearer token in `Authorization` header (existing FastAPI auth)  
**Response Format**: JSON (except file downloads)  
**Error Handling**: Standard HTTP status codes + JSON error body

---

## Endpoints

### 1. Create Backup

**POST** `/api/backups`

Create a new backup of the SQLite database. Returns immediately with operation ID; actual backup runs asynchronously in background.

**Request**:
```http
POST /api/backups HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

No request body required.

**Response** (201 Created):
```json
{
  "id": "backup-servidor-15-07-2026-143022",
  "status": "iniciado",
  "message": "Backup iniciado. Poll /backups/{id}/status para acompanhar progresso."
}
```

**Error Responses**:

| Status | Body | Reason |
|--------|------|--------|
| **409 Conflict** | `{"error": "Backup já em andamento"}` | Another backup operation in progress |
| **507 Insufficient Storage** | `{"error": "Espaço em disco insuficiente"}` | Not enough disk space (need 2x DB size) |
| **500 Internal Server Error** | `{"error": "Erro ao criar backup: ..."}` | Unexpected error during backup |

**Behavior**:
- Acquires mutex lock before starting
- Returns immediately (non-blocking)
- Frontend polls `/api/backups/{id}/status` every 500ms to show progress
- Background thread handles actual backup operation
- Lock released when backup completes (success or error)

**Example Flow**:
```
1. POST /api/backups
   Response: {"id": "backup-...", "status": "iniciado"}
2. GET /api/backups/backup-.../status (poll)
   Response: {"status": "em_progresso", "percentual": 35}
3. GET /api/backups/backup-.../status (poll again)
   Response: {"status": "em_progresso", "percentual": 89}
4. GET /api/backups/backup-.../status (poll again)
   Response: {"status": "concluído", "percentual": 100}
```

---

### 2. List Backups

**GET** `/api/backups`

Retrieve list of all backups with metadata. Scans filesystem and returns sorted list (newest first).

**Request**:
```http
GET /api/backups HTTP/1.1
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "backups": [
    {
      "id": "backup-servidor-15-07-2026-143022",
      "fileName": "backup-servidor-15-07-2026-143022.sql",
      "createdAt": "2026-07-15T14:30:22Z",
      "sizeBytes": 2621440,
      "status": "válido"
    },
    {
      "id": "backup-servidor-14-07-2026-090000",
      "fileName": "backup-servidor-14-07-2026-090000.sql",
      "createdAt": "2026-07-14T09:00:00Z",
      "sizeBytes": 2097152,
      "status": "válido"
    }
  ],
  "total": 2
}
```

**Error Response** (200 OK, empty list if no backups):
```json
{
  "backups": [],
  "total": 0
}
```

**SLO**:
- Response time: <2 seconds (even with 20+ backups)
- Must support sorting by date (most recent first)

**Notes**:
- Returns empty list if no backups exist
- Status is determined at list time (PRAGMA integrity_check not run; checked on restore)
- Newest backups appear first (reverse chronological)

---

### 3. Get Backup Status

**GET** `/api/backups/{backup_id}/status`

Poll current status of a backup operation (create or restore).

**Request**:
```http
GET /api/backups/backup-servidor-15-07-2026-143022/status HTTP/1.1
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": "backup-servidor-15-07-2026-143022",
  "operationType": "create",
  "status": "em_progresso",
  "percentual": 67,
  "startedAt": "2026-07-15T14:30:22Z",
  "completedAt": null
}
```

**After Completion** (201 Created for success):
```json
{
  "id": "backup-servidor-15-07-2026-143022",
  "operationType": "create",
  "status": "concluído",
  "percentual": 100,
  "startedAt": "2026-07-15T14:30:22Z",
  "completedAt": "2026-07-15T14:30:45Z"
}
```

**Error During Operation** (200 OK):
```json
{
  "id": "backup-servidor-15-07-2026-143022",
  "operationType": "create",
  "status": "erro",
  "percentual": 35,
  "startedAt": "2026-07-15T14:30:22Z",
  "completedAt": "2026-07-15T14:30:35Z",
  "errorMessage": "Disco cheio ao tentar criar backup"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Backup não encontrado"
}
```

**Frontend Usage**:
- Poll every 500ms
- Stop polling when `status` is "concluído" or "erro"
- Show progress bar based on `percentual`
- Display `errorMessage` if status is "erro"

---

### 4. Restore Backup

**POST** `/api/backups/{backup_id}/restore`

Restore database from a backup file. Requires user confirmation. Validates backup integrity before proceeding.

**Request**:
```http
POST /api/backups/backup-servidor-15-07-2026-143022/restore HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmRestore": true
}
```

**Response** (202 Accepted):
```json
{
  "id": "restore-op-uuid",
  "status": "iniciado",
  "backupId": "backup-servidor-15-07-2026-143022",
  "message": "Restauração iniciada. Poll /backups/{id}/status para acompanhar progresso."
}
```

**Error Responses**:

| Status | Body | Reason |
|--------|------|--------|
| **400 Bad Request** | `{"error": "Backup corrompido"}` | PRAGMA integrity_check failed |
| **404 Not Found** | `{"error": "Backup não encontrado"}` | File doesn't exist |
| **409 Conflict** | `{"error": "Backup em andamento. Tente novamente."}` | Another operation in progress |
| **400 Bad Request** | `{"error": "confirmRestore deve ser true"}` | Missing or false confirmation flag |

**Behavior**:
- Validates backup integrity before accepting
- Requires explicit `confirmRestore: true` (prevents accidental restore)
- Returns operation ID immediately (restore runs in background)
- Frontend polls `/api/backups/{id}/status` to show progress
- During restore: Other app endpoints continue working (but backup endpoints return 409)
- Database becomes read-only while restore in progress (implementation detail)

**Restore Lock Behavior**:
- When restore starts: All backup endpoints (create, restore, delete) return 409 until restore completes
- Non-backup endpoints: Continue working normally (serve UI, flashcards queries, etc.)
- After restore: Database connections refreshed, app continues with restored data

---

### 5. Download Backup

**GET** `/api/backups/{backup_id}/download`

Download backup file for external storage/archival.

**Request**:
```http
GET /api/backups/backup-servidor-15-07-2026-143022/download HTTP/1.1
Authorization: Bearer {token}
```

**Response** (200 OK):
```
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="backup-servidor-15-07-2026-143022.sql"
Content-Length: 2621440

[binary SQL file data]
```

**Error Responses**:

| Status | Body | Reason |
|--------|------|--------|
| **404 Not Found** | `{"error": "Backup não encontrado"}` | File doesn't exist or was deleted |
| **500 Internal Server Error** | Text error message | File can't be read from disk |

**Client Behavior** (JavaScript/Angular):
```typescript
// Fetch file as blob
fetch('/api/backups/{id}/download', {
  headers: { 'Authorization': 'Bearer token' }
})
.then(r => r.blob())
.then(blob => {
  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-servidor-15-07-2026-143022.sql';
  a.click();
  URL.revokeObjectURL(url);
});
```

---

### 6. Delete Backup

**DELETE** `/api/backups/{backup_id}`

Delete a backup file from storage. Requires confirmation (sent from UI).

**Request**:
```http
DELETE /api/backups/backup-servidor-15-07-2026-143022 HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirm": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Backup deletado com sucesso"
}
```

**Error Responses**:

| Status | Body | Reason |
|--------|------|--------|
| **404 Not Found** | `{"error": "Backup não encontrado"}` | Already deleted or doesn't exist |
| **400 Bad Request** | `{"error": "confirm deve ser true"}` | Missing confirmation |
| **409 Conflict** | `{"error": "Não é possível deletar durante backup"}` | Backup/restore in progress |
| **500 Internal Server Error** | `{"error": "Erro ao deletar: ..."}` | File permission issue |

**Notes**:
- Requires explicit `confirm: true` to prevent accidents
- Cannot delete while backup/restore operation in progress (409)
- No cascade effects (other features don't reference backup files)

---

## Common Response Schemas

### Error Response (400/404/500)
```json
{
  "error": "Human-readable error message",
  "code": "error_code" // Optional: machine-readable code
}
```

### Timestamps
- Format: ISO 8601 (UTC)
- Example: `2026-07-15T14:30:22Z`
- All times are server time; client should not assume timezone

---

## Authentication & Authorization

**Current Implementation**: FastAPI `Depends(get_current_user)`

**For MVP**:
- ✅ All endpoints require authentication token
- ✅ No role-based access control (any authenticated user can create/restore/delete backups)
- ✅ Username/user ID not tracked in response (no audit logging for MVP)

**Future (P3)**:
- Admin-only access control
- Audit trail (track who did what)
- Separate roles: viewer, operator, admin

---

## Rate Limiting (MVP)

**Not implemented for MVP.**

**Future (P2)**:
- Max 1 backup creation per 60 seconds
- Max 5 API calls per second per user
- Max backup file size limit (e.g., 10GB)

---

## Timeouts & Constraints

| Constraint | Value | Reason |
|-----------|-------|--------|
| HTTP Request Timeout | 120s | Backup/restore may take time |
| File Download Timeout | 300s | Large backup files may take time |
| Max Concurrent Operations | 1 | Only one backup/restore at a time |
| Max Backup File Size | N/A (MVP) | Limited by disk space; future: 10GB |

---

## Testing & Validation

**Happy Path Tests**:
1. Create backup → Poll status → Backup completes
2. List backups → Verify all files present
3. Restore backup → Verify data restored
4. Delete backup → Verify file removed

**Error Path Tests**:
1. Create backup while one in progress → 409
2. Download non-existent backup → 404
3. Restore corrupted backup → 400
4. Delete backup while restore in progress → 409

**Performance SLO**:
- List: <2 seconds
- Create: Returns immediately (background task <30s for typical DB)
- Restore: <30s for 100MB (varies with disk I/O)
- Download: Streams data (speed depends on disk I/O)

---

## Summary

| Endpoint | Method | Purpose | Status | Async |
|----------|--------|---------|--------|-------|
| `/api/backups` | POST | Create | 201 | ✅ |
| `/api/backups` | GET | List | 200 | ❌ |
| `/api/backups/{id}/status` | GET | Poll progress | 200 | ❌ |
| `/api/backups/{id}/restore` | POST | Restore | 202 | ✅ |
| `/api/backups/{id}/download` | GET | Download | 200 | ❌ |
| `/api/backups/{id}` | DELETE | Delete | 200 | ❌ |
