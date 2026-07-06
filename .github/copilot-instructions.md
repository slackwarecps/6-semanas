# GitHub Copilot Instructions — Flashcards App

Estas instruções valem para todo o trabalho neste repositório.

## Visão geral

App de flashcards com repetição espaçada (SM-2) e modo Jornada gamificado.

- **Frontend:** Angular 21, componentes standalone, em `src/app`
- **Backend:** FastAPI + SQLModel (SQLite), em `backend/`
- **Documentação de features:** SDDs em `spec-docs/` (em português)

## Comandos

```bash
npm start          # gera índice de flashcards + ng serve
npm run build      # gera índice + ng build
npm test           # ng test (Karma/Jasmine)
cd backend && uvicorn main:app --reload   # backend local
```

## Arquitetura (obrigatório seguir)

Usar Clean Architecture por feature. Cada feature em `src/app/features/<nome>/`
deve ter até 4 camadas:

```text
domain/        entidades, value objects, interfaces de repositório (código puro, sem Angular)
application/   use cases (um arquivo por caso de uso: <acao>.use-case.ts)
data/          implementações de repositório, mappers
presentation/  pages, components, templates
```

Regras de dependência:

- `domain` não importa nada de Angular nem de outras camadas.
- `application` depende só de `domain`.
- `presentation` chama use cases — nunca repositórios ou adapters HTTP diretamente.
- Acesso a HTTP/storage/LLM fica em `src/app/infrastructure/` atrás de interfaces
  (`storage.interface.ts` é o modelo).

## Padrões de código

- **TypeScript estrito; evitar `any`.** Preferir tipos de união literais
  (ex.: `'playing' | 'failed' | 'completed'`).
- **Angular moderno:** usar signals/`computed()` para estado de página, `inject()`
  em vez de injeção por construtor e `loadComponent` nas rotas.
- **Não** usar `ChangeDetectorRef` ou `NgZone` manualmente. Se parecer
  necessário, o estado provavelmente deveria ser um signal.
- Migração em andamento: ver `spec-docs/REFATORACAO_ANGULAR_MODERNO_SDD.md`.
  Código novo já deve nascer no padrão novo.
- Não escrever `standalone: true` (é o default).
- Formatação via Prettier (`.prettierrc`: 100 colunas, aspas simples). Rodar
  `npx prettier --write` nos arquivos tocados.
- Seguir os sufixos de arquivo por camada: `.page.ts`, `.component.ts`,
  `.use-case.ts`, `.entity.ts`, `.value-object.ts`, `.repository.ts`,
  `.adapter.ts`, `.service.ts`.

## Idioma

- Documentação, SDDs, mensagens de commit e textos de UI: **português (PT-BR)**.
- Identificadores de código: inglês, exceto termos de domínio já consagrados no
  projeto (`Jornada`, `TestaResposta`, `traducao`).

## Testes

- Use cases, value objects e o `srs.calculator.ts` são código puro: testar com
  instâncias diretas e fakes em memória, **sem TestBed**.
- Modelo de referência: `complete-jornada.use-case.spec.ts`.
- Todo use case novo ou alterado deve ter ou atualizar seu `.spec.ts` no mesmo
  PR.
- Specs devem ficar ao lado do arquivo testado
  (`foo.use-case.ts` + `foo.use-case.spec.ts`).
- Lógica de negócio nova (vidas/XP/desbloqueio/SRS) não entra sem teste.
- Backend: testes em `backend/test_*.py` (pytest).

## Fluxo de trabalho

- Feature nova relevante começa com um SDD em `spec-docs/` antes da
  implementação, seguindo o formato dos existentes.
- Atualizar o `README.md` quando houver mudança arquitetural, nova dependência
  ou novo comando.
- **Nunca commitar sem autorização explícita.**
- Commits devem ser em PT-BR e com gitmoji.
- Branch de trabalho: `development`; PRs para `main`.
