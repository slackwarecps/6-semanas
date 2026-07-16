# Tasks: Export Jornada para Anki

**Input**: Design documents from `/specs/002-export-jornada-anki/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per project's test-first policy (pytest for backend, Karma/Jasmine for frontend)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (FastAPI + SQLModel)
- **Frontend**: `src/app/features/admin-jornada/` (Angular feature)
- **Tests**: `backend/` (pytest), `src/` (Karma/Jasmine)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment validation

- [X] T001 Validate backend dependencies (FastAPI, SQLModel, SQLite) and Python environment
- [X] T002 Validate frontend dependencies (Angular 21, TypeScript) and Node environment
- [X] T003 Create directory structure for backend services: `backend/services/`

**Checkpoint**: Environment ready, dependencies validated

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and adapters that BOTH user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement Anki package generator in `backend/services/anki_export.py` (reuse logic from skill `/exporta-sqlite-para-anki`)
- [X] T005 [P] Create export HTTP adapter in `src/app/features/admin-jornada/infrastructure/export-jornada.adapter.ts` (POST request wrapper)
- [X] T006 Create helper function to query cards by `jornadaId` in `backend/routes/jornadas.py` (extend `_card_ids()`)
- [X] T007 [P] Add request validation middleware (jornada ownership check via X-User-Id header)

**Checkpoint**: Foundation ready - both user stories can now be implemented

---

## Phase 3: User Story 1 - Admin Exports Jornada to Anki (Priority: P1) 🎯 MVP

**Goal**: Enable admin to export a jornada's cards to .colpkg format ready for Anki import

**Independent Test**: Admin can click export button → receive .colpkg file → import successfully in Anki with all cards preserved

### Tests for User Story 1 (Test-First)

- [X] T008 [P] [US1] Unit test for Anki package generation in `backend/test_anki_export.py` (test card → Anki format transformation)
- [X] T009 [P] [US1] Contract test for export endpoint in `backend/test_export_endpoint.py` (test HTTP status codes: 200, 400, 404)
- [X] T010 [P] [US1] Integration test for full export flow in `backend/test_export_integration.py` (query → transform → zip → validate)

### Implementation for User Story 1

**Backend**:

- [X] T011 [P] [US1] Implement POST `/jornadas/{jornadaId}/export-anki` endpoint in `backend/routes/jornadas.py`
  - Validates jornada exists for user (X-User-Id header)
  - Returns 404 if not found
  
- [X] T012 [US1] Add query function to retrieve cards for jornada in `backend/routes/jornadas.py` 
  - Query: SELECT from cards JOIN jornada_perguntas WHERE jornadaId = ? AND user_id = ?
  - Order by jornada_perguntas.ordem
  - Depends on T006
  
- [X] T013 [US1] Add validation: reject export if jornada has 0 cards in `backend/routes/jornadas.py`
  - Returns 400 Bad Request with message "Nenhum card para exportar nesta jornada"
  - Depends on T011, T012
  
- [X] T014 [US1] Implement file naming logic in `backend/services/anki_export.py`
  - Format: `jornada-{slugified-nome}-{YYYY-MM-DD}.colpkg`
  - Handle special characters (/, \, :, *, etc) → replace with `-`
  - Depends on T004
  
- [X] T015 [US1] Call anki_export.py from endpoint to generate .colpkg file in `backend/routes/jornadas.py`
  - Pass cards list and output filename
  - Return as FileResponse with Content-Disposition: attachment
  - Depends on T004, T011, T013
  
- [X] T016 [US1] Add error handling in endpoint (500 on generation failure) in `backend/routes/jornadas.py`
  - Log error details for debugging
  - Return user-friendly error message
  
- [X] T017 [P] [US1] Add logging for export operations in `backend/routes/jornadas.py`
  - Log: jornada_id, user_id, card_count, timestamp
  - Depends on T011

**Frontend**:

- [X] T018 [P] [US1] Add "Exportar para Anki" button to admin-jornada page in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.html`
  - Button label: "📥 Exportar para Anki"
  - Clickable when jornada has cards
  
- [X] T019 [US1] Implement button click handler in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Call exportJornadaToAnki() from adapter (T005)
  - Subscribe to response and trigger download
  - Depends on T005, T018
  
- [X] T020 [US1] Implement file download trigger in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Create blob URL from response
  - Create <a> element with download attribute
  - Click to trigger browser download
  - Depends on T019
  
- [X] T021 [P] [US1] Add error handling in component (display error toast/message) in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Handle 400 (empty jornada): "Nenhum card para exportar"
  - Handle 404 (not found): "Jornada não encontrada"
  - Handle 500 (server error): "Erro ao exportar jornada"
  - Depends on T019

**Checkpoint**: User Story 1 complete and independently testable
- Admin can export jornada ✅
- File downloads with correct naming ✅
- All cards included in .colpkg ✅
- Error cases handled ✅

---

## Phase 4: User Story 2 - Visual Feedback During Export (Priority: P2)

**Goal**: Show progress indicator during export for better UX (especially large jornadas)

**Independent Test**: Admin sees spinner/toast appear during export and disappear when complete; no impact if removed

### Tests for User Story 2 (Test-First)

- [X] T022 [P] [US2] Component test for loading state in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.spec.ts`
  - Verify isExporting signal becomes true when export starts
  - Verify isExporting becomes false when complete
  
- [X] T023 [P] [US2] Component test for UI visibility in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.spec.ts`
  - Verify spinner is shown when isExporting = true
  - Verify spinner is hidden when isExporting = false

### Implementation for User Story 2

**Frontend**:

- [X] T024 [P] [US2] Create `isExporting` signal in admin-jornada component `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Type: `Signal<boolean>` (Angular signals)
  - Initial value: false
  - Depends on T019
  
- [X] T025 [US2] Update export handler to manage loading state in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Set isExporting to true before API call
  - Set isExporting to false after completion (success or error)
  - Use finalize() operator to ensure cleanup
  - Depends on T024, T019
  
- [X] T026 [US2] Add progress spinner to template in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.html`
  - Show spinner when `isExporting()` is true
  - Hide spinner when `isExporting()` is false
  - Use Angular's `*ngIf` with signal
  - Depends on T024, T025
  
- [X] T027 [US2] Add/update toast notification for export completion in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts`
  - Show success toast: "Exportação completa"
  - Show error toast on failure (from T021)
  - Depends on T025
  
- [X] T028 [P] [US2] Add accessibility attributes to spinner in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.html`
  - aria-label: "Exportando jornada..."
  - role: "status"
  - Depends on T026
  
- [X] T029 [P] [US2] Style spinner and loading state in `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.scss`
  - Disable button while loading (pointer-events: none, opacity: 0.6)
  - Spinner animation (rotate, fade)
  - Depends on T026

**Checkpoint**: User Story 2 complete and independently testable
- Loading feedback appears during export ✅
- Feedback disappears when export completes ✅
- Works for all export scenarios (success and error) ✅
- UX is improved, feature still works without it ✅

---

## Phase 5: Edge Cases & Polish

**Purpose**: Handle edge cases and final validation

- [X] T030 [P] Add handling for special characters/Unicode in card content in `backend/services/anki_export.py`
  - Validate UTF-8 encoding in JSON fields
  - Test with emojis, accented characters, symbols
  - Depends on T004
  
- [X] T031 [P] Add handling for long card titles/questions in `backend/services/anki_export.py`
  - Verify no truncation in collection.anki2 generation
  - Test with 500+ character fields
  - Depends on T004
  
- [X] T032 [P] Add concurrent request handling in `backend/routes/jornadas.py`
  - Multiple simultaneous exports of same jornada should work
  - No race conditions or file corruption
  - Depends on T015
  
- [X] T033 Test tag preservation and formatting in `backend/services/anki_export.py`
  - Convert JSON array tags → space-separated Anki format
  - Remove "Tags:" prefix from legacy data
  - Depends on T004
  
- [X] T034 Performance validation: export 200-card jornada completes in < 5 seconds
  - Profile backend processing time
  - Verify file size is reasonable (< 10 MB)
  - Measure frontend download time
  - Depends on T015, T019
  
- [X] T035 End-to-end validation: export and import in Anki
  - Export from app → download .colpkg
  - Import into Anki → verify all cards present
  - Verify formatting, tags, content
  - Depends on T015, T019
  
- [X] T036 [P] Update admin-jornada page README with new feature documentation in `src/app/features/admin-jornada/README.md`
  - Document new export button
  - Document supported formats
  - Add usage examples

**Checkpoint**: Feature complete, edge cases handled, performance validated

---

## Implementation Strategy

### MVP Scope (Phase 3 - User Story 1)
✅ Minimal Viable Product includes:
- Export button in admin page
- Endpoint implementation
- .colpkg generation
- Basic error handling
- Download trigger

**This is independently testable and delivers core value**

### Incremental Delivery
1. **Increment 1** (Phase 3): MVP - Core export functionality (User Story 1)
2. **Increment 2** (Phase 4): Enhanced UX - Loading feedback (User Story 2)
3. **Increment 3** (Phase 5): Polish - Edge cases and performance

### Parallel Execution Opportunities

**During Phase 2 (Foundational)**:
- T004 (Anki export service) and T005 (HTTP adapter) can run in parallel
- T007 (validation middleware) can run in parallel

**During Phase 3 (User Story 1)**:
- Backend tasks T011-T017 can start once T004-T007 are done
- Frontend tasks T018-T021 can start once T005 is done
- Backend and Frontend tasks are independent (different files, different concerns)

**During Phase 4 (User Story 2)**:
- All frontend tasks (T024-T029) run in parallel once Phase 3 is complete
- No backend changes needed

**During Phase 5 (Polish)**:
- Edge case tasks (T030-T033) run in parallel
- Performance validation (T034) and e2e test (T035) run after Phase 4

### Dependencies Graph

```
T001-T003 (Setup)
    ↓
T004, T005, T006, T007 (Foundational - parallel)
    ↓
T008-T010 (US1 Tests - parallel)
T011, T012, T013, T014, T015, T016, T017 (US1 Backend - sequential)
T018, T019, T020, T021 (US1 Frontend - sequential)
    ↓
T022-T023 (US2 Tests - parallel)
T024, T025, T026, T027, T028, T029 (US2 Frontend - sequential)
    ↓
T030-T035 (Polish - mostly parallel)
```

### Task Estimation

| Phase | Tasks | Estimated Duration | Blocker? |
|-------|-------|-------------------|----------|
| Phase 1 (Setup) | T001-T003 | 30 min | No |
| Phase 2 (Foundation) | T004-T007 | 2-3 hours | YES |
| Phase 3 (US1) | T008-T021 | 6-8 hours | YES (MVP) |
| Phase 4 (US2) | T022-T029 | 2-3 hours | No |
| Phase 5 (Polish) | T030-T036 | 2-3 hours | No |
| **TOTAL** | **36 tasks** | **~13-18 hours** | — |

---

## Success Metrics (from spec.md)

- ✅ SC-001: Admin exports 50 cards in < 5 seconds (validate in T034)
- ✅ SC-002: 100% of jornada cards in export (validate in T010, T035)
- ✅ SC-003: File opens in Anki without errors (validate in T035)
- ✅ SC-004: Tags preserved correctly (validate in T033, T035)
- ✅ SC-005: Empty jornada rejected with message (validate in T013, T021)
- ✅ SC-006: File named descriptively (validate in T014, T035)

---

## Testing Summary

### Backend Tests (pytest)
- **Unit**: Anki export transformation (T008)
- **Contract**: HTTP endpoint contracts (T009)
- **Integration**: Full export flow (T010)
- **Edge Cases**: Unicode, long fields, tags (T030-T033)

### Frontend Tests (Karma/Jasmine)
- **Unit**: Component state management (T022, T023)
- **Component**: Button click, loading state (T022-T023)
- **Manual E2E**: Full user flow (T035)

### All tests must PASS before marking task complete ✅

---

## Notes

- All file paths assume project structure from plan.md
- Backend routes extend existing `backend/routes/jornadas.py`
- Frontend reuses admin-jornada feature (no new feature directory)
- Tests are mandatory per project CLAUDE.md policy
- Prettier formatting required on all code
- Portuguese comments/docs for user-facing features
