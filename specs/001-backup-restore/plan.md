# Implementation Plan: Gerenciamento de Backups e Restauração do SQLite

**Branch**: `001-backup-restore` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-backup-restore/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

MVP de gerenciamento de backups para o app de flashcards. Usuários podem criar, listar, restaurar e deletar backups do banco SQLite via página administrativa. Backend usa API nativa do SQLite (`backup`/`VACUUM INTO`) para garantir consistência sem locks longos. Frontend Angular exibe progresso assíncrono. Backups armazenados em `backend/backups/` com timestamp no nome. Requisitos críticos: acesso autenticado (qualquer user), endpoints REST para CRUD, validação de integridade pré-restore, download de arquivos via UI.

## Technical Context

**Language/Version**: 
- Backend: Python 3.x (FastAPI)
- Frontend: TypeScript/Angular 21 (standalone components, modern signals)

**Primary Dependencies**: 
- Backend: FastAPI, SQLModel, SQLite
- Frontend: Angular 21, RxJS, standalone components

**Storage**: SQLite (file-based, `backend/database.sqlite`). Backups stored in `backend/backups/` (filesystem).

**Testing**: 
- Backend: pytest (existing test suite in `backend/test_*.py`)
- Frontend: Karma/Jasmine (existing tests in `src/app`)

**Target Platform**: Web service + web application (desktop/LAN, not mobile per spec assumption)

**Project Type**: Full-stack web application with administrative backup/restore UI

**Performance Goals** (from spec Success Criteria):
- Backup creation: <5 min for typical databases
- Restore: <30s for 100MB backup
- List load: <2s even with 20+ backups
- Backup operation: max 60s timeout without perceived UI degradation

**Constraints**: 
- No locks >30s during backup (use SQLite native backup API, not dump)
- Large database support (>500MB) without timeout
- Concurrent requests: Only 1 backup operation at a time (mutex/lock needed)
- During restore: Backup endpoints return HTTP 409; other app endpoints remain available
- Access control: Any authenticated user (no role-based restriction for MVP)

**Scale/Scope**: 
- Application scope: Flashcards app with ~10-100 users internal
- Feature scope: Single admin page with 4 main actions (create, list, restore, delete)
- Database size: Typical 10-500MB SQLite file; MVP must handle >500MB edge case

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Project Constitution**: Template not yet ratified (see `.specify/memory/constitution.md`). Using CLAUDE.md project guidelines as reference:

**Architecture Compliance** (Clean Architecture, per CLAUDE.md):
- ✅ Feature should follow `src/app/features/backup/` structure with layers: domain, application, data, presentation
- ✅ Domain layer: Pure TypeScript entities/value objects, no Angular dependencies
- ✅ Application layer: Use cases (one file per action), no direct HTTP/storage calls
- ✅ Data layer: Repository implementations, HTTP adapters
- ✅ Presentation layer: Pages/components, calls use cases only
- ✅ Infrastructure: HTTP/storage interfaces in `src/app/infrastructure/`

**Code Quality**:
- ✅ TypeScript strict mode; no `any` types
- ✅ Use signals/computed() for page state (modern Angular pattern)
- ✅ Prettier formatting (100 col, single quotes)
- ✅ File naming: `.page.ts`, `.component.ts`, `.use-case.ts`, etc.

**Testing**:
- ✅ Use cases must have `.spec.ts` in same directory (no TestBed, use fakes)
- ✅ Value objects & domain logic tested with plain instances
- ✅ Backend: pytest for business logic
- ✅ New logic requires new or updated tests in same PR

**Language**: Portuguese (PT-BR) for feature docs/SDDs/UI; English for code identifiers (except domain terms like "Jornada")

**No Violations Detected**: Constitution check passes. Feature can proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── main.py                 # FastAPI app entry
├── database.sqlite         # SQLite database file
├── backups/                # NEW: Backup storage directory
├── src/
│   ├── backups_service.py  # Business logic for backup operations
│   └── schemas.py          # Pydantic models for API responses
└── tests/
    └── test_backups.py     # NEW: pytest tests for backup logic

src/app/
├── features/backup/        # NEW: Feature following Clean Architecture
│   ├── domain/
│   │   ├── backup.entity.ts           # Backup entity
│   │   └── backup.repository.ts       # Repository interface
│   ├── application/
│   │   ├── create-backup.use-case.ts
│   │   ├── list-backups.use-case.ts
│   │   ├── restore-backup.use-case.ts
│   │   └── delete-backup.use-case.ts
│   ├── data/
│   │   ├── backup.repository.ts       # HTTP adapter
│   │   └── mappers/
│   ├── presentation/
│   │   ├── pages/
│   │   │   └── backups.page.ts        # Main backup management page
│   │   ├── components/
│   │   │   ├── backup-list.component.ts
│   │   │   ├── create-backup.component.ts
│   │   │   └── restore-dialog.component.ts
│   │   └── backup.routes.ts           # Route definitions
│   └── test/
│       ├── *.use-case.spec.ts         # Use case tests
│       └── *.component.spec.ts        # Component tests

├── infrastructure/
│   ├── http.adapter.ts                # HTTP client adapter
│   └── storage.interface.ts           # File download interface (NEW)

└── shared/
    └── models/                        # Shared DTOs
```

**Structure Decision**: Web application with split backend (FastAPI) + frontend (Angular 21). Backend provides REST API for backup operations; frontend implements admin page following Clean Architecture (domain → application → data → presentation). Backup files stored directly in `backend/backups/` directory (filesystem-based, no external storage for MVP).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
