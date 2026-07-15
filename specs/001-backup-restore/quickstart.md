# Quickstart: Backup & Restore Feature Validation

**Purpose**: Runnable guide to validate feature end-to-end after implementation  
**Branch**: `001-backup-restore`  
**Time**: ~15 minutes (including execution)

---

## Prerequisites

### Backend
- FastAPI running on `http://localhost:8000`
- SQLite database at `backend/database.sqlite`
- Endpoint `POST /backups` implemented and working

### Frontend
- Angular dev server running on `http://localhost:4200`
- Backup management page accessible at `/admin/backups` (or `/backups`)
- Authentication token obtained (test user logged in)

### System
- Disk space: ≥2x current database size
- Python 3.8+, Node.js 18+

---

## Setup

### 1. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
✅ Backend ready at `http://localhost:8000`

### 2. Start Frontend
```bash
cd ..  # Back to repo root
npm install  # If not done
npm start
```
✅ Frontend ready at `http://localhost:4200`

### 3. Verify Database
```bash
ls -lh backend/database.sqlite
# Should show SQLite database file (>1MB typical)

mkdir -p backend/backups
chmod 755 backend/backups
```
✅ Database exists and backup directory ready

---

## Validation Scenarios

### Scenario 1: Create Backup (Happy Path)

**Goal**: User creates backup and sees success message with file details

**Steps**:

1. Open browser → `http://localhost:4200/admin/backups` (or wherever page is)
   - Expected: Backup management page loads
   - ✅ Page title: "Gerenciamento de Backups"

2. Click button "Criar Backup"
   - Expected: Progress indicator appears
   - ✅ UI shows "Criando backup... 0%"

3. Wait for completion (should be <1 min for typical DB)
   - Expected: Progress reaches 100%
   - ✅ Page shows "Backup criado com sucesso!"

4. Verify success message contains:
   - ✅ Backup file name (e.g., `backup-servidor-15-07-2026-143022.sql`)
   - ✅ File size in MB (e.g., `2.50 MB`)
   - ✅ Creation date/time

5. Verify file exists on disk:
   ```bash
   ls -lh backend/backups/
   # Should show: backup-servidor-15-07-2026-143022.sql (2.5M)
   ```
   ✅ File exists and has correct size

**Acceptance Criteria**:
- [ ] Backup button disabled while operation in progress
- [ ] Progress bar shows realistic percentage (not stuck at 0% or jumping to 100%)
- [ ] Success message appears with correct file name, size, date
- [ ] File actually exists on disk with correct size
- [ ] Can create another backup after first completes

---

### Scenario 2: List Backups

**Goal**: User sees all existing backups in a sortable list

**Steps**:

1. On backups page, look for list/table of backups
   - Expected: Table with columns: Name, Date, Size, Status
   - ✅ At least one backup visible (from Scenario 1)

2. Verify most recent backup is first (descending date order)
   - Expected: Latest backup at top of list
   - ✅ Date order is correct (most recent first)

3. Check each backup entry contains:
   - ✅ File name (e.g., `backup-servidor-15-07-2026-143022.sql`)
   - ✅ Creation date (e.g., `15/07/2026 14:30:22`)
   - ✅ File size (e.g., `2.50 MB`)
   - ✅ Status badge (e.g., "Válido" in green)

4. Verify list updates when new backup created
   - Steps: Create another backup (Scenario 1 again)
   - Expected: New backup appears at top of list
   - ✅ List auto-updates or user clicks "Refresh"

**Acceptance Criteria**:
- [ ] All existing backups are listed
- [ ] Each backup shows name, date, size, status
- [ ] Most recent backup appears first
- [ ] List loads in <2 seconds
- [ ] Sorting by date works (newest first by default)

---

### Scenario 3: Download Backup

**Goal**: User can download backup file for external storage

**Steps**:

1. In backups list, find a backup entry
   - Expected: "Baixar" (Download) button visible next to each backup
   - ✅ Button is clickable

2. Click "Baixar" button on one backup
   - Expected: Browser "Save As" dialog appears
   - ✅ Dialog shows filename: `backup-servidor-15-07-2026-143022.sql`

3. Accept download (save to Downloads folder)
   - Expected: File downloads successfully
   - ✅ File appears in Downloads with correct name and size

4. Verify downloaded file is valid SQLite database:
   ```bash
   file ~/Downloads/backup-servidor-*.sql
   # Should output: SQLite 3.x database

   sqlite3 ~/Downloads/backup-servidor-*.sql "SELECT COUNT(*) FROM sqlite_master;"
   # Should return: >0 (tables exist)
   ```
   ✅ Downloaded file is valid SQLite database

**Acceptance Criteria**:
- [ ] Download button visible for each backup
- [ ] Clicking download triggers browser download dialog
- [ ] Downloaded file has correct name (matches backup)
- [ ] Downloaded file is valid SQLite database
- [ ] File size matches listed size

---

### Scenario 4: Restore Backup (with Validation)

**Goal**: User can restore database from backup with confirmation

**Preparation**:
1. Create a test flashcard in the app
   - Step: Open app → Create new flashcard (e.g., "Test Question")
   - ✅ Flashcard is visible in UI

2. Create backup of this state
   - Execute: Scenario 1 again, then Scenario 2 to verify
   - ✅ Backup exists with flashcard data

3. Modify database (to have different state)
   - Step: Delete the flashcard you just created OR edit it
   - ✅ App reflects the change

**Steps**:

1. Go to backups page
   - Expected: Backup from step 2 is listed
   - ✅ Backup visible in list

2. Click "Restaurar" (Restore) button on the backup
   - Expected: Confirmation dialog appears
   - ✅ Dialog says: "Isto é uma operação irreversível! Seus dados atuais serão substituídos. Tem certeza?"

3. Click "Cancelar" to test abort
   - Expected: Dialog closes, no restore happens
   - ✅ Database remains unchanged (app still shows the modification)

4. Click "Restaurar" button again
   - Expected: Confirmation dialog appears again
   - ✅ Dialog is shown

5. Click "Confirmar Restauração" button
   - Expected: Progress indicator shows "Restaurando... 0%"
   - ✅ Restore operation starts

6. Wait for completion (<30s for typical DB)
   - Expected: Progress reaches 100%
   - ✅ Message: "Banco de dados restaurado com sucesso!"

7. Verify data restored to backup state
   - Step: Reload page (Ctrl+R)
   - ✅ Flashcard from backup is back (the one deleted in step 3)

8. Verify app continues working
   - Step: Try to view/edit flashcards
   - ✅ App responds normally, no errors

**Backend Validation** (terminal):
```bash
# Verify database file was replaced
ls -l backend/database.sqlite
# Should show recent modification time

# Verify integrity
sqlite3 backend/database.sqlite "PRAGMA integrity_check;"
# Should return: "ok"
```

**Acceptance Criteria**:
- [ ] Restore button visible for each backup
- [ ] Clicking restore shows confirmation dialog (warning about destructiveness)
- [ ] User can cancel restore without side effects
- [ ] Restore operation shows progress (0-100%)
- [ ] After restore, data matches backup state
- [ ] Database integrity check passes (PRAGMA integrity_check = "ok")
- [ ] App continues working after restore (no errors)
- [ ] Other app endpoints remain available during restore

---

### Scenario 5: Delete Backup

**Goal**: User can remove backups to free disk space

**Preparation**:
1. Create at least 2 backups
   - Execute: Scenario 1 twice (creates 2 backup files)
   - ✅ At least 2 backups in list

**Steps**:

1. Go to backups page
   - Expected: Multiple backups listed
   - ✅ At least 2 backups visible

2. Find a backup to delete (preferably not the most recent)
   - Expected: "Deletar" (Delete) button visible next to each backup
   - ✅ Delete button is clickable

3. Click "Deletar" button
   - Expected: Confirmation dialog appears
   - ✅ Dialog asks: "Tem certeza que deseja deletar este backup?"

4. Click "Cancelar"
   - Expected: Dialog closes, no deletion happens
   - ✅ Backup still in list

5. Click "Deletar" button again
   - Expected: Confirmation dialog appears
   - ✅ Dialog shown

6. Click "Confirmar Deleção"
   - Expected: Backup is removed from list immediately
   - ✅ Backup no longer visible in UI

7. Verify file deleted from disk:
   ```bash
   ls -lh backend/backups/
   # Deleted backup should NOT appear
   ```
   ✅ File removed from filesystem

8. Verify other backups unaffected
   - Expected: Other backups still in list
   - ✅ Only the deleted backup is gone

**Acceptance Criteria**:
- [ ] Delete button visible for each backup
- [ ] Clicking delete shows confirmation dialog
- [ ] User can cancel deletion without side effects
- [ ] After confirming, backup is removed from UI immediately
- [ ] Backup file is actually deleted from disk
- [ ] Other backups remain unaffected

---

### Scenario 6: Concurrent Backup Prevention

**Goal**: System prevents multiple simultaneous backups

**Steps**:

1. Go to backups page
   - ✅ Page loaded

2. Click "Criar Backup" button
   - ✅ Progress indicator appears (0%)

3. **Immediately** click "Criar Backup" button again (within 1 second)
   - Expected: Error message appears OR button remains disabled
   - ✅ No second backup operation starts

4. Error message should say: "Backup já em andamento"
   - ✅ Message is clear and in Portuguese

5. Wait for first backup to complete
   - ✅ Progress reaches 100%

6. Now try to create backup again
   - Expected: Works normally (lock released)
   - ✅ New backup starts successfully

**Acceptance Criteria**:
- [ ] Only one backup operation can run at a time
- [ ] Attempting second backup shows error message
- [ ] Error message is user-friendly
- [ ] After first backup completes, new backups work again

---

### Scenario 7: Corrupted Backup Detection

**Goal**: System detects and prevents restore of corrupted backups

**Preparation**:
1. Create a valid backup
   - Execute: Scenario 1
   - ✅ Backup file exists

2. Corrupt the backup file intentionally
   ```bash
   backup_file="backend/backups/backup-servidor-*.sql"
   # Truncate file (remove last 1000 bytes)
   truncate -s -1000 $backup_file
   ```
   ✅ File is now corrupted

**Steps**:

1. Go to backups page
   - Expected: Corrupted backup might show different status
   - ⚠️  Status might still show "Válido" (validation on demand)

2. Try to restore the corrupted backup
   - Click "Restaurar"
   - Click "Confirmar Restauração"
   - Expected: Error message: "Backup corrompido"
   - ✅ Restore is blocked

3. Try to download corrupted backup
   - Click "Baixar"
   - File downloads (download not validated)
   - ✅ Download still works (validation on restore only)

**Acceptance Criteria**:
- [ ] System validates backup integrity before restore
- [ ] Corrupted backup is rejected (HTTP 400)
- [ ] Error message is clear: "Backup corrompido"
- [ ] Download still works for corrupted backups (user responsibility)

---

### Scenario 8: Large Database Handling

**Goal**: System handles large databases (>500MB) without timeout

**Preparation** (if your DB is <100MB, skip this test):
1. Add large amount of test data to app
   - Or: Restore an existing large backup (if available)
   - ✅ Database is >500MB

**Steps**:

1. Create backup
   - Expected: Operation takes >30 seconds
   - ✅ Progress updates regularly (not stuck)

2. Monitor progress
   - Expected: Percentage increments smoothly (5%, 10%, 15%, ...)
   - ✅ No timeout error (operation continues beyond 60s if needed)

3. Wait for completion
   - Expected: Eventually reaches 100%
   - ✅ Completes successfully

4. Restore backup
   - Expected: Similar behavior (progress updates smoothly)
   - ✅ Restore completes without timeout

**Acceptance Criteria**:
- [ ] Backup handles large DB without HTTP timeout
- [ ] Progress updates regularly during operation
- [ ] Operation completes successfully even if >60 seconds
- [ ] Restore also completes successfully for large DB

---

## Edge Cases (Optional but Recommended)

### Edge Case 1: Backup During Active Use
**Goal**: Database remains consistent even if users are using app while backup runs

1. Start backup (Scenario 1)
2. While backup in progress, use app normally
   - Create/edit a flashcard
   - View questions
   - Navigate pages
3. App should remain responsive
   - ✅ App doesn't freeze or show errors

### Edge Case 2: Restore Backup + Immediate Requests
**Goal**: App handles requests during restore gracefully

1. Start restore (Scenario 4)
2. While restore in progress, make API request
   - Open another browser tab → API call
3. Expected: Request gets HTTP 409 or graceful error
   - ✅ Error message appears (not silent failure)

### Edge Case 3: No Backups Exist
**Goal**: UI gracefully handles empty state

1. Delete all backups
   - Execute: Scenario 5 for all backups
2. Open backups page
   - Expected: Empty state message
   - ✅ Message: "Nenhum backup encontrado. Crie um agora."

---

## Performance SLO Validation

| Metric | Target | How to Check |
|--------|--------|-------------|
| List Load Time | <2 seconds | Browser DevTools → Network tab |
| Backup Create | <5 min | Timer on page / browser console |
| Backup Restore (100MB) | <30 seconds | Timer on page |
| Download Initiation | <2 seconds | Browser DevTools |
| Concurrent Prevention | Immediate | Instant error on second attempt |

**How to Check**:
```javascript
// In browser console
console.time('backup');
// Click create backup
// When complete:
console.timeEnd('backup');
// Should log something like: "backup: 45234ms" (45 seconds)
```

---

## Acceptance Checklist

After running all scenarios, check:

- [ ] Scenario 1: Create backup works end-to-end
- [ ] Scenario 2: List shows all backups with metadata
- [ ] Scenario 3: Download works and file is valid
- [ ] Scenario 4: Restore works with confirmation and data integrity
- [ ] Scenario 5: Delete works and frees disk space
- [ ] Scenario 6: Concurrent backups prevented
- [ ] Scenario 7: Corrupted backups detected and rejected
- [ ] Scenario 8: Large databases handled without timeout
- [ ] All error messages are user-friendly (Portuguese, clear)
- [ ] Performance SLOs met
- [ ] App remains stable after all operations

---

## Debugging

### Backup Fails During Creation
```bash
# Check disk space
df -h  # Need >2x database size

# Check permissions
ls -ld backend/backups
# Should be writable by app user

# Check database integrity
sqlite3 backend/database.sqlite "PRAGMA integrity_check;"
```

### Restore Fails
```bash
# Check backup file exists
ls -lh backend/backups/backup-*.sql

# Check backup is valid
sqlite3 backend/backups/backup-*.sql "PRAGMA integrity_check;"
# Should return "ok"

# Check no connections to main database
sqlite3 backend/database.sqlite ".tables"
# Should work without locks
```

### UI Not Showing Progress
```javascript
// Check browser console for errors
console.log('Checking API...');

// Manually call status endpoint
fetch('/api/backups/backup-id/status')
  .then(r => r.json())
  .then(console.log);
```

---

## Next Steps

After validation passes:
1. ✅ Run unit & integration tests
2. ✅ Code review against CLAUDE.md requirements
3. ✅ Merge to `development` branch
4. ✅ Deploy to staging
5. ✅ User acceptance testing with real admin

---

## Timeline

- Scenarios 1-5: ~10 minutes (basic flow)
- Scenarios 6-8: ~5 minutes (edge cases)
- **Total**: ~15 minutes for full validation
