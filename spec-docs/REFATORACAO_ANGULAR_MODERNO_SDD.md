# SDD - Refatoração para Angular moderno (signals, lazy loading, inject, testes)

## 1. VISÃO GERAL

### 1.1 Motivação

O projeto está bem organizado (Clean Architecture por feature: `domain` /
`application` / `data` / `presentation`, use cases coesos, value objects,
adapters de infraestrutura), mas o código das páginas ainda usa padrões
pré-Angular 16 que hoje geram atrito e boilerplate:

1. **Estado imperativo + change detection manual.** Páginas como
   `jornada-phase.page.ts` mantêm ~20 campos soltos de estado e chamam
   `ChangeDetectorRef.markForCheck()` e até `NgZone.run()` manualmente dentro
   de fluxos `async/await`. Isso é sintoma de luta contra a change detection
   em vez de uso do mecanismo nativo — no Angular 21 o idioma é **signals**.
   Hoje apenas 1 dos 72 arquivos TS usa `signal()`.
2. **Sem lazy loading.** As 13 páginas são importadas estaticamente em
   `app.routes.ts`, então todo o app vai num único bundle inicial.
3. **Injeção via construtor.** Construtores com até 7 dependências
   (ex.: `JornadaPhasePage`) em vez de `inject()`, o estilo recomendado atual.
4. **Quase nenhum teste.** Só 3 arquivos `.spec.ts` — sendo que os use cases e
   o `srs.calculator.ts` são puros e triviais de testar sem TestBed.
5. **Boilerplate na entidade `Card`.** Construtor copia 18 propriedades uma a
   uma sem agregar comportamento.
6. **Detalhes:** `standalone: true` redundante (é default desde o Angular 19);
   `CommonModule` inteiro importado onde bastariam pipes/diretivas específicos.

Esta refatoração **não muda comportamento visível** — é modernização interna
com o objetivo de manter o projeto simples e didático, servindo de referência
de "Angular 21 idiomático" para features futuras.

### 1.2 Princípios

- **Sem big-bang:** cada fase é independente, pequena e commitável isoladamente.
- **Comportamento preservado:** nenhuma mudança de UI, rota ou API.
- **Página-modelo primeiro:** a `JornadaPhasePage` é refatorada por completo
  como referência; as demais páginas seguem o padrão depois.
- **Testes antes de refatorar lógica:** o SRS e os use cases de jornada ganham
  testes ANTES de qualquer mudança neles, servindo de rede de segurança.

## 2. ESCOPO

### 2.1 Dentro do escopo

| # | Fase | O quê |
|---|------|-------|
| 1 | Lazy loading | Converter `app.routes.ts` para `loadComponent` |
| 2 | Rede de testes | Specs para `srs.calculator.ts` e use cases de jornada |
| 3 | Página-modelo | `JornadaPhasePage`: signals + `computed()` + `inject()`, remover `cdr`/`ngZone` |
| 4 | Demais páginas | Replicar o padrão nas outras 12 páginas |
| 5 | Entidade `Card` | Reduzir boilerplate do construtor |
| 6 | Limpeza | Remover `standalone: true`, trocar `CommonModule` por imports específicos |

### 2.2 Fora do escopo

- Mudanças de layout, UX ou rotas.
- Migração do backend (coberta por `migration_backend_plan.md`).
- Zoneless change detection (`provideZonelessChangeDetection`) — candidato
  natural a follow-up DEPOIS que todas as páginas usarem signals, mas não entra
  aqui para não acoplar risco.
- Migração de `FormsModule` para reactive/signal forms.

## 3. DESIGN POR FASE

### Fase 1 — Lazy loading das rotas

Mudança mecânica em `src/app/app.routes.ts`: remover os 14 imports estáticos e
trocar cada rota para o padrão:

```ts
{
  path: 'learn/jornada/:id',
  loadComponent: () =>
    import('./features/learn/presentation/pages/jornada-phase.page')
      .then(m => m.JornadaPhasePage)
}
```

**Critério de aceite:** `ng build` gera um chunk por página; navegação manual
por todas as 13 rotas funciona igual.

### Fase 2 — Rede de testes (antes de tocar em lógica)

Prioridade pela densidade de regra de negócio:

1. `infrastructure/srs-algorithm/srs.calculator.ts` — tabela de casos SM-2
   (card novo, acerto, erro, relearning, limites de ease factor).
2. `features/jornada/application/use-cases/get-journey-map.use-case.ts` —
   lógica de locked/unlocked/completed.
3. `features/jornada/application/use-cases/save-jornada.use-case.ts` e
   `delete-jornada.use-case.ts` — com repositórios fake em memória.
4. Value objects (`EaseFactor`, `Interval`, `CardId`) — validações de limite.

Todos são código puro: testes sem TestBed, só instanciar com fakes.
(`complete-jornada.use-case.spec.ts` já existe e serve de modelo.)

**Critério de aceite:** `ng test` verde; use cases de jornada e SRS cobertos.

### Fase 3 — Página-modelo: `JornadaPhasePage`

A maior página do app (382 linhas) vira a referência do padrão novo:

- Cada campo de estado vira `signal()`:
  `lives = signal(3)`, `phaseState = signal<'playing'|'failed'|'completed'>('playing')`, etc.
- Estado derivado vira `computed()`: ex. `currentQuestion = computed(() => this.questions()[this.currentIndex()])`.
- Dependências via `inject()`: `private route = inject(ActivatedRoute);` —
  construtor vazio some.
- **Remover `ChangeDetectorRef` e `NgZone` por completo** — com signals a
  atualização da view é automática, inclusive após `await`.
- Template atualizado para chamar os signals (`lives()` em vez de `lives`).
- Fluxo de vidas/XP/aprovação extraído para um serviço/estado testável se a
  extração for natural; caso contrário fica na página (não forçar).

**Critério de aceite:** jogar uma fase completa (acerto, erro, perder vidas,
reprovar, completar) se comporta identicamente; zero referências a
`ChangeDetectorRef`/`NgZone` no arquivo.

### Fase 4 — Demais páginas

Replicar o padrão da Fase 3, em ordem de tamanho/risco decrescente:
`browse-cards`, `study`, `admin-jornada`, `prepara-questoes-fase1`,
`dev-control-panel`, `import-cards`, `add-card`, `tag-cloud`,
`testa-resposta`, `learn`, `dashboard`, `backup-restore`.

Uma página (ou par de páginas pequenas) por commit. Verificação manual da
página após cada conversão.

### Fase 5 — Entidade `Card`

Substituir a cópia campo-a-campo do construtor por
`Object.assign(this, props)` (mantendo a classe e os getters `isDue` /
`isMultipleChoice`), preservando a API pública — nenhum chamador muda.

### Fase 6 — Limpeza final

- Remover `standalone: true` de todos os componentes (default desde v19).
- Trocar `CommonModule` por imports específicos (`DatePipe`, `NgClass`, …) —
  com a sintaxe `@if`/`@for` já disponível, na maioria dos casos o
  `CommonModule` sai inteiro.
- Rodar `prettier` no que foi tocado.

## 4. RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Regressão visual/comportamental ao migrar página para signals | Fase 3 valida o padrão numa única página antes de escalar; verificação manual por página na Fase 4 |
| Template esquecer os `()` de um signal (renderiza a função) | Compilador acusa na maioria dos casos; revisão do template a cada conversão |
| Lazy loading quebrar deep-link | Teste manual das 13 rotas na Fase 1 (mudança isolada num commit) |
| `Object.assign` na `Card` mascarar campo faltante | Testes de value objects/entidade da Fase 2 rodam antes da Fase 5 |

## 5. ORDEM DE EXECUÇÃO E ENTREGA

Cada fase = 1 ou mais commits pequenos, nesta ordem: **1 → 2 → 3 → 4 → 5 → 6**.
As fases 1 e 2 são independentes entre si e podem inverter. A fase 3 só começa
com a 2 concluída (rede de segurança). Nenhum commit sem autorização do Fabão.

**Follow-up sugerido (fora deste SDD):** após Fase 4, avaliar
`provideZonelessChangeDetection()` em `app.config.ts` e remover o zone.js do
bundle.
