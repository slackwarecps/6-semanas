# Research Phase 0: Backup & Restore Feature

**Date**: 2026-07-15 | **Branch**: `001-backup-restore`

## SQLite Backup Strategy

### Decision: Use SQLite Native Backup API (Python `sqlite3.Connection.backup()`)

**Rationale**: 
- Guarantees database consistency (atomic snapshot at specific moment)
- Avoids long locks on production database
- Works with database in active use (no need to stop app)
- Faster than text dump for large databases
- Built-in, no external tools or libraries needed

**Implementation**:
```python
import sqlite3

def backup_database(source_db_path: str, backup_file_path: str) -> int:
    """Create atomic backup using SQLite backup API."""
    source = sqlite3.connect(source_db_path)
    backup = sqlite3.connect(backup_file_path)
    source.backup(backup)  # Atomic copy
    backup.close()
    source.close()
    return os.path.getsize(backup_file_path)  # Return size in bytes
```

**Alternatives Considered**:
- ❌ SQL dump (`.schema` + `INSERT` statements): Slower for large files, requires parsing
- ❌ `VACUUM INTO`: Requires SQLite 3.27+; less flexible; copies to exact file size
- ❌ File copy: Non-atomic, may copy inconsistent state if locked
- ✅ **Selected**: `sqlite3.backup()` — atomic, fast, production-safe

**Compatibility**: Python `sqlite3` built-in (3.6+); no extra dependencies

---

## Async Backup Operations in FastAPI

### Decision: Async with Status Polling (not background tasks for MVP)

**Rationale**:
- Large backups (>500MB) can take 30-60s; HTTP timeout would be problematic
- AsyncIO + threading allows quick response without separate job queue
- Frontend polls `/backups/{id}/status` to show progress
- No additional infrastructure (Celery, Redis) needed for MVP
- Can upgrade to background job queue in P2 if needed

**Implementation Pattern**:
```python
import asyncio
from threading import Thread

class BackupState:
    in_progress = False
    current_backup_id = None
    percentual = 0

@app.post("/backups")
async def create_backup():
    if BackupState.in_progress:
        raise HTTPException(409, "Backup já em progresso")
    
    BackupState.in_progress = True
    backup_id = generate_id()
    BackupState.current_backup_id = backup_id
    
    # Run backup in thread (non-blocking)
    thread = Thread(target=do_backup, args=(backup_id,), daemon=True)
    thread.start()
    
    return {"id": backup_id, "status": "iniciado"}

@app.get("/backups/{backup_id}/status")
async def get_backup_status(backup_id: str):
    """Frontend polls this every 500ms to show progress."""
    return {"status": BackupState.in_progress, "percentual": BackupState.percentual}
```

**Alternatives Considered**:
- ❌ Sync POST (blocks HTTP, 60s timeout risky)
- ✅ **Selected**: Async + threading + polling (simple, effective)
- 📋 Future (P2): Dedicated background task queue (Bull, Celery)

---

## File Download Strategy in Angular

### Decision: Blob Download + Trigger Native Download

**Rationale**:
- Angular can fetch file via HTTP GET endpoint
- Convert response to Blob, trigger browser download
- No external library needed
- Works in all modern browsers
- User gets native "Save As" dialog

**Implementation**:
```typescript
// Backend: GET /backups/{id}/download returns binary file
@app.get("/backups/{backup_id}/download")
async def download_backup(backup_id: str):
    file_path = get_backup_path(backup_id)
    return FileResponse(file_path, media_type="application/octet-stream")

// Frontend: Angular service
export class BackupService {
  downloadBackup(backupId: string): Observable<Blob> {
    return this.http.get(`/backups/${backupId}/download`, {
      responseType: 'blob'
    });
  }
}

// Component: Trigger download
onDownload(backup: Backup): void {
  this.backupService.downloadBackup(backup.id).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}
```

**Alternatives Considered**:
- ❌ Base64 embed: Huge response size, slow, memory issues
- ❌ Streaming with JSZip: Overkill for single file
- ✅ **Selected**: FileResponse + Blob download (native, simple, performant)

---

## Concurrency Control: Single Backup Lock

### Decision: In-Memory Mutex + State Flag

**Rationale**:
- MVP scope: Only single backup operation at a time (P2 for queueing)
- Simple flag check at start of backup
- FastAPI is thread-safe for state mutations if single-threaded
- Lock acquired for entire backup operation
- Prevents race condition: "two admins click backup simultaneously"

**Implementation**:
```python
import threading
from fastapi import HTTPException

class BackupLock:
    _lock = threading.Lock()
    _backup_in_progress = False

@app.post("/backups")
async def create_backup():
    if not BackupLock._lock.acquire(blocking=False):
        raise HTTPException(409, "Backup já em andamento. Tente novamente em 30s.")
    
    try:
        BackupLock._backup_in_progress = True
        # Do actual backup work
        backup_id = await perform_backup()
        return {"id": backup_id, "status": "sucesso"}
    except Exception as e:
        raise HTTPException(500, str(e))
    finally:
        BackupLock._lock.release()
        BackupLock._backup_in_progress = False
```

**Alternatives Considered**:
- ❌ No lock (allow race): Corrupts backup files, violates spec acceptance criteria
- ✅ **Selected**: Threading lock + state flag (MVP-sufficient, no external dependencies)
- 📋 Future (P2): Job queue (Redis queue, Bull, or Celery) for true queueing

---

## Backup Integrity Validation

### Decision: SQLite PRAGMA integrity_check Before Restore

**Rationale**:
- SQLite provides built-in integrity check command
- Fast (~1-2s for 100MB file)
- Detects corruption before attempting restore
- User sees clear error message if backup is corrupted
- No external tools needed

**Implementation**:
```python
def validate_backup_integrity(backup_file_path: str) -> bool:
    """Check if backup file is valid SQLite database."""
    try:
        conn = sqlite3.connect(backup_file_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        result = cursor.fetchone()
        conn.close()
        
        # PRAGMA returns "ok" if valid
        return result[0] == "ok"
    except sqlite3.DatabaseError:
        return False

@app.post("/backups/{backup_id}/restore")
async def restore_backup(backup_id: str):
    backup_path = get_backup_path(backup_id)
    
    if not validate_backup_integrity(backup_path):
        raise HTTPException(400, f"Backup corrompido. Tente outro backup.")
    
    # Proceed with restore...
```

**Alternatives Considered**:
- ❌ No validation: Risk of data loss, silent failures
- ✅ **Selected**: PRAGMA integrity_check (fast, built-in, reliable)
- 📋 Future: Checksums (MD5/SHA256) for extra verification

---

## REST API Endpoint Design

### Decision: Standard RESTful Routes + Status Polling

**Rationale**:
- Standard REST conventions (GET, POST, DELETE)
- Async operations tracked via status endpoint
- Clear error codes (409 conflict, 400 bad request, 500 server error)
- Aligns with existing FastAPI patterns in project

**Endpoints**:

| Method | Path | Purpose | Response |
|--------|------|---------|----------|
| **POST** | `/api/backups` | Create backup | `{id, status, createdAt}` |
| **GET** | `/api/backups` | List all backups | `[{id, fileName, createdAt, sizeBytes, status}]` |
| **GET** | `/api/backups/{id}/status` | Poll backup progress | `{status, percentual, errorMessage?}` |
| **POST** | `/api/backups/{id}/restore` | Restore from backup | `{status, message}` |
| **GET** | `/api/backups/{id}/download` | Download backup file | Binary blob (application/octet-stream) |
| **DELETE** | `/api/backups/{id}` | Delete backup file | `{success, message}` |

**Notes**:
- 409 Conflict: Returned when backup already in progress
- 400 Bad Request: Returned when backup corrupted before restore
- All timestamps in ISO 8601 format (UTC)

---

## Data Model & Storage

### Decision: Flat File Storage + Metadata in Response

**Rationale**:
- Backups stored as `.sql` files directly in `backend/backups/`
- No database table needed to track backups (scan filesystem)
- Simpler for MVP, no schema migrations
- Metadata (name, size, date) extracted from file at runtime

**Implementation**:
```python
from pathlib import Path
from datetime import datetime

class BackupMetadata:
    id: str
    fileName: str
    createdAt: datetime
    sizeBytes: int
    status: str  # "válido" or "corrompido"

def scan_backups() -> List[BackupMetadata]:
    """List all backups by scanning backend/backups/ directory."""
    backup_dir = Path("backend/backups")
    backups = []
    
    for file in sorted(backup_dir.glob("backup-*.sql"), reverse=True):
        backups.append(BackupMetadata(
            id=file.stem,
            fileName=file.name,
            createdAt=file.stat().st_mtime,
            sizeBytes=file.stat().st_size,
            status="válido"  # Validate on demand in restore
        ))
    
    return backups
```

**Alternatives Considered**:
- ❌ Database table (backups table): Over-engineered for MVP
- ✅ **Selected**: Filesystem scan (simple, no migrations, stateless)
- 📋 Future: Database tracking for audit trail (P3)

---

## HTTP Timeout & Large File Handling

### Decision: 120s Timeout for Sync Ops + Async for >10MB

**Rationale**:
- FastAPI default timeout ~30-60s (can be 120s)
- Backup >500MB needs async to avoid timeout
- List/download operations are fast (<2s)
- Restore uses async status polling
- Graceful degradation if network slow

**Implementation**:
```python
# For CREATE/RESTORE: Quick response + background work
POST /backups → {id, status: "iniciado"} [non-blocking]
GET /backups/{id}/status → {percentual: 45} [polling]

# For LIST/DOWNLOAD: Sync (fast enough)
GET /backups → [{...}] [sync, <2s]
GET /backups/{id}/download → binary [sync, streaming]
```

**Constraints from Spec**:
- ✅ SC-001: User can create backup in <5 min (polls status)
- ✅ SC-003: List loads in <2s (filesystem scan)
- ✅ SC-004: Restore 100MB in <30s (async, depends on disk speed)
- ✅ SC-007: Backup won't timeout (async status polling)

---

## Framework/Library Choices Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | FastAPI | Already used in project, async-first, minimal |
| **Database** | SQLite native API | Consistency, no locks, built-in |
| **File Storage** | Filesystem (`backend/backups/`) | Simple, works for MVP, stateless |
| **Concurrency** | Threading + flag | No external deps, single-threaded FastAPI safe |
| **Frontend** | Angular 21 (signals) | Already used, modern pattern, reactive |
| **Validation** | PRAGMA integrity_check | Built-in, no external deps |
| **Download** | FileResponse + Blob | Native browser API, no deps |

---

## Unknowns Resolved

✅ All research questions answered; no blockers identified.

**Next Phase**: Phase 1 (data-model.md, contracts, quickstart.md)
