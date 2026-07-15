# Data Model: Backup & Restore Feature

**Date**: 2026-07-15 | **Phase**: 1 Design | **Spec**: [spec.md](spec.md)

## Core Entities

### Backup

**Purpose**: Represents a single backup file and its metadata.

**Attributes**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string | ✅ | UUID v4 or timestamp-based | Extracted from filename (stem: `backup-servidor-15-07-2026-143022`) |
| `fileName` | string | ✅ | Pattern: `backup-servidor-DD-MM-YYYY-HHMMSS.sql` | Generated at creation time; must be unique |
| `createdAt` | ISO 8601 datetime | ✅ | UTC timestamp | File modification time on disk |
| `sizeBytes` | number | ✅ | > 0 | File size in bytes from filesystem stat |
| `status` | enum | ✅ | "válido" \| "corrompido" | Determined by PRAGMA integrity_check on demand |
| `filePath` | string | ✅ | Absolute path | `backend/backups/{fileName}` |

**State Diagram**:

```
[Created] → [Valid] ──→ [Deleted]
           ↓
        [Corrupted]
```

**Creation Rules**:
- Filename MUST follow pattern: `backup-servidor-DD-MM-YYYY-HHMMSS.sql`
- Only **one backup operation at a time** (mutex lock prevents concurrent creation)
- Backup file MUST contain valid SQLite database (checked on restore)
- Size MUST be > 0 bytes

**Deletion Rules**:
- Delete only removes file from disk
- No cascade effects (no other entity depends on Backup)

**Relationships**:
- None for MVP (no audit log, no user FK, no backup history table)
- In P3: May add `Audit.backup_id` FK for audit trail

---

### BackupOperation (Transient)

**Purpose**: Tracks in-progress backup/restore operations.

**Attributes**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string | ✅ | UUID | Unique per operation |
| `operationType` | enum | ✅ | "create" \| "restore" | What operation is happening |
| `backupId` | string | ✅ (for restore) | UUID | Which backup (null for create) |
| `status` | enum | ✅ | "iniciado" \| "em_progresso" \| "concluído" \| "erro" | Current state |
| `startedAt` | ISO 8601 datetime | ✅ | UTC timestamp | When operation started |
| `completedAt` | ISO 8601 datetime | ❌ | UTC timestamp | When finished (null if still running) |
| `percentual` | number | ✅ | 0-100 | Progress indicator |
| `errorMessage` | string | ❌ | Free text | Error description if status="erro" |

**Lifecycle**:

```
BackupOperation created → status: "iniciado"
                       ↓
              (progress updates every ~500ms)
                       ↓
              status: "em_progresso" (0-99%)
                       ↓
         [Success]         [Error]
             ↓                 ↓
    status: "concluído"    status: "erro"
    percentual: 100        errorMessage: "..."
```

**Storage**: 
- In-memory only (transient)
- Not persisted to database
- Lost on app restart (acceptable for MVP)
- Tracked in `BackupState` (global singleton)

**Cleanup**:
- Removed from state after HTTP polling stops (frontend stops asking)
- Auto-cleanup after 30 minutes of inactivity (future optimization)

---

## Validation Rules

### At Backup Creation

```
1. Check: Backup not already in progress
   If: BackupState.in_progress == true
   Then: Return HTTP 409 "Backup já em andamento"

2. Check: Disk space available
   If: Free space < 2x database size
   Then: Return HTTP 507 "Espaço em disco insuficiente"

3. Lock: Acquire mutex
   Effect: Prevents concurrent backup attempts

4. Create: SQLite backup() call
   Output: File written to backend/backups/

5. Verify: File exists and sizeBytes > 0
   Then: Return HTTP 200 with BackupOperation status

6. Release: Unlock mutex
```

### At Backup Restore

```
1. Check: Backup file exists
   If: Not found
   Then: Return HTTP 404 "Backup não encontrado"

2. Validate: PRAGMA integrity_check
   If: Returns != "ok"
   Then: Return HTTP 400 "Backup corrompido"

3. Confirm: User acknowledged (frontend confirmation dialog)
   UI sends: confirmRestore=true in request body

4. Lock: Acquire mutex
   Effect: Blocks new backups during restore

5. Close: All active connections to main database
   (Implementation: FastAPI dependency injection manages this)

6. Restore: SQLite backup() in reverse
   Input: backup file
   Output: overwrite backend/database.sqlite

7. Verify: Main database is accessible
   If: PRAGMA integrity_check == "ok"
   Then: Restore successful

8. Release: Unlock mutex
   Notify: Frontend restore complete, refresh UI
```

### At Backup Deletion

```
1. Check: Backup file exists
   If: Not found
   Then: Return HTTP 404

2. Delete: Remove file from disk
   rm backend/backups/{fileName}

3. Verify: File no longer exists
   Then: Return HTTP 200 "Deletado com sucesso"

4. Error handling: If deletion fails (permission, file locked)
   Then: Return HTTP 500 with error message
```

---

## Data Types & Enums

### BackupStatus

```typescript
enum BackupStatus {
  Valid = "válido",
  Corrupted = "corrompido"
}
```

### OperationStatus

```typescript
enum OperationStatus {
  Started = "iniciado",
  InProgress = "em_progresso",
  Completed = "concluído",
  Error = "erro"
}
```

### OperationType

```typescript
enum OperationType {
  Create = "create",
  Restore = "restore"
}
```

---

## Storage & Persistence

| Entity | Storage | Persistence | Scope |
|--------|---------|-------------|-------|
| **Backup** | Filesystem (`backend/backups/*.sql`) | Persistent (survives restart) | Instance-wide (shared) |
| **BackupOperation** | In-memory (`BackupState` global) | Transient (lost on restart) | Instance-wide (last operation only) |

**Rationale**:
- Backup files must persist (data recovery requirement)
- Operations are transient because frontend polls status; no need for persistence
- Single global `BackupState` acceptable for MVP (single admin using feature at a time)

---

## Relationships & Constraints

### Uniqueness

- `Backup.fileName`: MUST be globally unique (enforced by timestamp + counter if collision)
- `BackupOperation.id`: MUST be globally unique per operation

### Foreign Keys

- None for MVP (no related entities depend on Backup)

### Cascades

- Deleting `Backup`: Deletes file, no cascades needed
- No parent-child relationships

---

## Migration Notes

**For Backend (Python/FastAPI)**:
- ✅ No schema changes (backup files are self-contained)
- ✅ No database migrations needed
- ✅ No new tables (metadata extracted from filesystem)

**For Frontend (Angular)**:
- ✅ No database schema changes
- ✅ New types/interfaces in `domain/backup.entity.ts`
- ✅ No migrations needed (stateless, fetches from API)

**Future (P3) - If Audit Trail Added**:
```sql
CREATE TABLE backup_audit (
  id UUID PRIMARY KEY,
  backup_id UUID,
  user_id UUID,
  action VARCHAR (10), -- 'create', 'restore', 'delete'
  created_at TIMESTAMP,
  FOREIGN KEY (backup_id) REFERENCES backups(id)
);
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| Entities | 1 persistent (Backup), 1 transient (BackupOperation) |
| Storage | Filesystem + in-memory state |
| Persistence | Only Backup files; operations are ephemeral |
| Relationships | None (no FKs) |
| Migrations | None required for MVP |
| Validation | PRAGMA integrity_check, file exists, disk space |
| Concurrency | Single-backup mutex lock |
| Scaling | Suitable for <1000 users, <500MB databases |
