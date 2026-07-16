# Implementation Plan: Export Jornada para Anki

**Branch**: `002-export-jornada-anki` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-export-jornada-anki/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Adiciona um botão "Exportar para Anki" na página `/admin/jornada` que permite exportar todos os flashcards de uma jornada específica em formato `.colpkg` (compatível com Anki). Reutiliza a lógica do skill `/exporta-sqlite-para-anki` adaptando-a para filtrar por `jornadaId` e adiciona um endpoint FastAPI + UI Angular para disparar a exportação.

## Technical Context

**Language/Version**: TypeScript 5+ (frontend, Angular 21 com signals) + Python 3.12 (backend, FastAPI)

**Primary Dependencies**: Angular 21, FastAPI, SQLModel, SQLite CLI (node.js child_process)

**Storage**: SQLite (`backend/database.sqlite`). Tabelas relevantes: `jornadas`, `jornada_perguntas`, `cards`

**Testing**: Karma/Jasmine (frontend), pytest (backend). Testes obrigatórios para use cases e lógica de negócio.

**Target Platform**: Web application (browser + Node.js/Python server)

**Project Type**: Web application (frontend Angular + backend FastAPI)

**Performance Goals**: Export de ~200 cards deve completar em < 5 segundos; download deve iniciar imediatamente

**Constraints**: Isolamento por usuário (X-User-Id header). Apenas admins podem exportar.

**Scale/Scope**: Aplicação existente com ~540 cards em múltiplas jornadas; feature é isolated e não afeta outras áreas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on project CLAUDE.md (Clean Architecture, TypeScript strict, Angular moderno, Testes obrigatórios):

- ✅ **Clean Architecture by Feature**: Feature será em `src/app/features/admin-jornada` (já existe) com camadas domain/application/data/presentation
- ✅ **TypeScript Strict**: Sem `any`, tipos literais, signals para estado de página
- ✅ **Angular Moderno**: Signals/computed() para estado, `inject()` em vez de constructor injection, `loadComponent` nas rotas
- ✅ **Testes Obrigatórios**: Use cases (se houver) + lógica de exportação backend precisam de testes (pytest)
- ✅ **Formatação**: Prettier (100 colunas, aspas simples)
- ✅ **Idioma**: Código em inglês (identificadores), documentação e UX em português (PT-BR)
- ✅ **No NEEDS CLARIFICATION markers**: Spec foi validada sem ambiguidades

**Gate Status**: ✅ **PASS** — Feature cumpre todos os princípios do projeto. Pode prosseguir para Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-export-jornada-anki/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

#### Frontend (Angular)

```text
src/app/features/admin-jornada/
├── presentation/
│   └── pages/
│       ├── admin-jornada.page.ts        # Página com novo botão + dialog de exportação
│       ├── admin-jornada.page.html      # Template (botão + loader/toast)
│       └── admin-jornada.page.scss      # Estilos
└── infrastructure/
    └── export-jornada.adapter.ts        # HTTP call ao endpoint de exportação (reutiliza ExportService)
```

#### Backend (FastAPI)

```text
backend/
├── routes/
│   ├── jornadas.py                      # Novo endpoint POST /jornadas/{id}/export-anki
│   └── dependencies.py                  # (já existente)
├── models/                              # (já existente)
│   └── card_models.py                   # Reuso de Card, JornadaPergunta models
├── services/
│   ├── export_service.py                # (novo ou refatorado) Filtra cards por jornada + gera .colpkg
│   └── anki_export.py                   # Reutiliza lógica do skill /exporta-sqlite-para-anki
├── database.py                          # (já existente) Models de acesso ao SQLite
└── tests/
    └── test_export_service.py           # Testes da exportação (pytest)
```

**Structure Decision**: Feature segue Clean Architecture por feature (angular) + separação backend/frontend com reutilização de lógica existente. O export será tratado como um serviço isolado no backend (`export_service.py`) que pode ser chamado por múltiplos endpoints futuros. Frontend usa um adapter para fazer HTTP call ao endpoint.

## Complexity Tracking

> Constitution Check passed ✅ — No violations to justify. Feature aligns with all project principles.

---

## Phase Completion Status

✅ **Phase 0 (Research)**: Complete
- research.md generated with all design decisions documented
- No NEEDS CLARIFICATION markers remain

✅ **Phase 1 (Design & Contracts)**: Complete
- data-model.md: Entidades, relacionamentos, transformações
- contracts/export-endpoint.md: HTTP contract com examples
- quickstart.md: Validação end-to-end e test scenarios

→ **Phase 2 (Implementation Tasks)**: Ready for `/speckit-tasks`
