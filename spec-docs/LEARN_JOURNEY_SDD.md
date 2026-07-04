# SDD - Jornada (`/learn` + `/admin/jornada`): modo de fases estilo Duolingo

## 1. VISÃO GERAL

### 1.1 Motivação

O app já tem 540 flashcards de múltipla escolha importados (`public/flashcards/001-...md` até
`540-...md`) e um motor de repetição espaçada (SM-2) no modo **Estudar** (`/study`). A rota
`/learn` já existe como esqueleto visual (3 colunas: menu esquerdo, centro 50%, direita 25%),
mas o centro e a direita são apenas placeholders (`learn.page.html`).

Esta feature transforma `/learn` numa segunda forma de progredir pelo conteúdo — um percurso
gamificado, com fases ("Jornadas"), vidas, aprovação/reprovação e XP, no estilo Duolingo. É
**complementar** ao modo Estudar, não o substitui.

Diferente de um corte automático das 540 perguntas em blocos fixos, o conteúdo de cada Jornada
é **curado manualmente** por uma tela administrativa (`/admin/jornada`): um CRUD master-detail
onde se cria a Jornada (nome, ordem, ativa/inativa) e se escolhe, dentre os 540 cards, quais
perguntas fazem parte dela.

### 1.2 História de usuário (fonte da verdade do produto)

> **Como** estudante usando o app de flashcards,
> **Eu quero** percorrer jornadas de perguntas (curadas manualmente, com o mesmo rigor de vidas
> do Duolingo) e, como administrador do conteúdo, montar essas jornadas escolhendo quais
> perguntas entram em cada uma,
> **Para que** eu sinta uma progressão de jogo, controlando exatamente o que é ensinado em cada
> etapa.

**Regras de produto — jogo (`/learn`):**

1. **Jornadas:** cada Jornada é um conjunto de perguntas definido manualmente pelo admin em
   `/admin/jornada` (quantidade livre, não precisa ser 15).
2. **Vidas:** cada Jornada começa com **3 vidas**. Toda resposta errada consome 1 vida —
   independente de quantas perguntas a Jornada tem.
3. **Reprovação imediata:** ao consumir a 3ª vida (3º erro), a Jornada é interrompida **na
   hora** — tela de "Você errou demais" — e reinicia do zero (1ª pergunta, 3 vidas, mesma ordem
   das perguntas; a ordem não é embaralhada).
4. **Aprovação:** completar todas as perguntas da Jornada com no máximo 2 erros marca a Jornada
   como **concluída**.
5. **Desbloqueio sequencial:** considerando só as Jornadas com `ativa = true`, ordenadas pelo
   campo `ordem` (definido no admin), cada Jornada só fica acessível depois que a anterior
   (na ordem, entre as ativas) for concluída. A primeira Jornada ativa (menor `ordem`) já vem
   desbloqueada por padrão.
6. **XP:**
   - `+10 XP` por resposta correta dentro de uma tentativa.
   - `+50 XP` de bônus ao concluir uma Jornada **pela primeira vez**.
   - XP só é persistido (somado ao total) quando a Jornada é concluída com sucesso — uma
     tentativa que falha (3 erros) não persiste XP nenhum, tudo é descartado ao reiniciar.
   - Refazer uma Jornada **já concluída** (prática livre) não soma XP de novo nem piora o
     `bestErrors` salvo — só atualiza `bestErrors` se o novo resultado tiver menos erros que o
     anterior.
7. **Persistência:** progresso (Jornadas concluídas/desbloqueadas, XP total) sobrevive a
   fechar/reabrir o navegador (mesmo mecanismo de persistência local já usado pelo resto do
   app — SQLite via `sql.js` + backup base64 em `localStorage`).
8. **Independência do SRS:** acertos/erros na Jornada **não alteram** `interval`/`easeFactor`
   dos cards no modo Estudar. É uma trilha de progresso à parte, sobre os mesmos cards.
9. **Jornada desativada:** se o admin desativar (`ativa = false`) uma Jornada que já tinha
   progresso (unlocked/completed) salvo, ela some do mapa em `/learn` (não é mais jogável), mas
   o progresso salvo não é apagado — volta a aparecer se reativada.

**Regras de produto — administração (`/admin/jornada`):**

10. CRUD master-detail: master = lista de Jornadas (nome, ativa, ordem); detail = formulário da
    Jornada + seletor de quais dos 540 cards fazem parte dela.
11. Quantidade de perguntas por Jornada é **livre** (sem mínimo/máximo obrigatório).
12. Sem autenticação — rota interna acessível digitando a URL, consistente com o resto do app
    (uso pessoal, sem login em lugar nenhum hoje).

### 1.3 Escopo desta fase de implementação

- Nova página `/admin/jornada` — CRUD master-detail de Jornadas.
- Nova página de mapa de Jornadas no centro de `/learn` (substitui o placeholder).
- Novo painel de XP/progresso na coluna direita de `/learn` (substitui o placeholder).
- Nova rota `/learn/jornada/:id` com o fluxo de jogo (perguntas da Jornada, vidas, aprovação/
  reprovação).

### 1.4 Fora de escopo

- Autenticação/proteção da rota `/admin/jornada`.
- Reordenar perguntas dentro de uma Jornada por drag-and-drop (a ordem é a ordem de
  seleção/inserção no admin).
- Duplicar/clonar Jornada existente como atalho de criação.
- Embaralhar a ordem das perguntas dentro de uma Jornada durante o jogo.
- Streak diário, ligas, corações que recarregam com o tempo, gemas/moedas.
- Bônus de "perfeito" (0 erros) além do já definido no XP (seção 1.2).
- Qualquer alteração no algoritmo SM-2 do modo Estudar.
- Sincronização entre navegadores/dispositivos (tudo local, mesmo padrão atual).
- Recuperar/depender da ordem numérica original dos arquivos `001-540` — como a curadoria agora
  é manual (o admin busca e escolhe cards por título/tag), essa ordem original **não é
  necessária** para esta feature.

---

## 2. MODELO DE DADOS

Novas tabelas no `SqliteAdapter` (`src/app/infrastructure/storage/sqlite.adapter.ts`), seguindo
o mesmo padrão das tabelas `cards`/`card_options`/`attempts` já existentes (criadas em
`createTables()`, persistidas via `this.persist()` após cada escrita):

```sql
CREATE TABLE IF NOT EXISTS jornadas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  ativa INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS jornada_perguntas (
  jornadaId TEXT NOT NULL,
  cardId TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (jornadaId, cardId),
  FOREIGN KEY (jornadaId) REFERENCES jornadas(id),
  FOREIGN KEY (cardId) REFERENCES cards(id)
);

CREATE TABLE IF NOT EXISTS jornada_progresso (
  jornadaId TEXT PRIMARY KEY,
  status TEXT NOT NULL,        -- 'locked' | 'unlocked' | 'completed'
  bestErrors INTEGER,
  completedAt INTEGER,
  FOREIGN KEY (jornadaId) REFERENCES jornadas(id)
);

CREATE TABLE IF NOT EXISTS learn_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  totalXp INTEGER NOT NULL DEFAULT 0
);
```

Sem mudanças na tabela `cards` — nenhuma coluna nova é necessária ali; a curadoria manual usa o
`id`, `title` e `tags` já existentes para localizar/selecionar perguntas.

Novos métodos no `SqliteAdapter` (mesmo estilo dos métodos já existentes de `cards`/`attempts`):
- `saveJornada(jornada, cardIds: string[])` — upsert da linha em `jornadas` + apaga e
  reinsere todas as linhas de `jornada_perguntas` para aquele `jornadaId` (replace-all, mais
  simples que diff incremental).
- `loadAllJornadas(): JornadaRow[]` — `SELECT * FROM jornadas ORDER BY ordem ASC`.
- `loadJornadaById(id): JornadaRow | null` + `loadJornadaCardIds(id): string[]` (via
  `SELECT cardId FROM jornada_perguntas WHERE jornadaId = ? ORDER BY ordem ASC`).
- `deleteJornada(id)` — apaga linhas em `jornada_perguntas`, `jornada_progresso` e `jornadas`.
- `getJornadaProgress(id): JornadaProgressRow | null`, `upsertJornadaProgress(row)`.
- `getTotalXp(): number`, `addXp(amount: number)` (tabela `learn_stats`, singleton `id = 1`).

---

## 3. DOMÍNIO / APLICAÇÃO (novo bounded context `features/jornada`)

```
src/app/features/jornada/
├── domain/
│   ├── entities/
│   │   ├── jornada.entity.ts          # { id, nome, ativa, ordem, questionCardIds: string[], createdAt, updatedAt }
│   │   └── jornada-progress.entity.ts # { jornadaId, status: 'locked'|'unlocked'|'completed', bestErrors, completedAt }
│   └── value-objects/
│       └── journey-stats.value-object.ts  # { totalXp, jornadasCompletadas, totalJornadasAtivas }
├── data/
│   └── repositories/
│       ├── jornada.repository.ts            # CRUD admin (jornadas + jornada_perguntas)
│       └── jornada-progress.repository.ts    # progresso de jogo (jornada_progresso + learn_stats)
└── application/
    └── use-cases/
        ├── list-jornadas.use-case.ts          # grid master do admin (todas, ativas e inativas)
        ├── get-jornada-detail.use-case.ts      # jornada + perguntas vinculadas (p/ editar no admin)
        ├── save-jornada.use-case.ts            # cria/atualiza nome/ativa/ordem + substitui vínculos de perguntas
        ├── delete-jornada.use-case.ts
        ├── list-available-cards.use-case.ts    # todos os cards p/ o seletor do admin (reaproveita CardRepository.findAll())
        ├── get-journey-map.use-case.ts         # jornadas ativas ordenadas + status de progresso + XP total
        ├── get-jornada-questions.use-case.ts   # perguntas de uma jornada (para o jogo)
        └── complete-jornada.use-case.ts        # marca completed, desbloqueia próxima ativa, soma XP (1ª vez só)
```

### 3.1 `Jornada` (entidade)

```ts
export interface JornadaProps {
  id: string;
  nome: string;
  ativa: boolean;
  ordem: number;
  questionCardIds: string[]; // ordem de inserção = ordem de exibição no jogo
  createdAt: Date;
  updatedAt: Date;
}
```

`Jornada.create({ nome, ordem, questionCardIds })`: `ativa = false` por padrão (admin ativa
explicitamente depois de montar o conteúdo), `id` via `crypto.randomUUID()` (mesmo padrão de
`CardId.generate()`).

### 3.2 `GetJourneyMapUseCase`

1. Busca todas as Jornadas via `JornadaRepository.findAll()`, filtra `ativa === true`, ordena por
   `ordem` asc.
2. Para cada uma, busca o progresso (`JornadaProgressRepository.getProgress(jornadaId)`); se não
   existir registro: a **primeira** da lista ordenada vira `unlocked` por padrão, as demais
   `locked`.
3. Retorna `{ jornadas: Array<{ jornada, status, bestErrors }>, stats: JourneyStats }`, onde
   `JourneyStats` vem de `getTotalXp()` + contagem de `status === 'completed'` +
   `totalJornadasAtivas` (tamanho da lista filtrada).

### 3.3 `CompleteJornadaUseCase(jornadaId, errors, xpEarnedThisAttempt)`

1. Lê o progresso atual da Jornada.
2. Se já estava `'completed'`: só atualiza `bestErrors` se `errors < bestErrors` — **não** soma
   XP de novo.
3. Se é a primeira conclusão: grava `status: 'completed'`, `bestErrors: errors`,
   `completedAt: now`, soma `xpEarnedThisAttempt + 50` ao total via `addXp(...)`.
4. Desbloqueio da próxima: recalcula a lista de Jornadas ativas ordenadas por `ordem` (igual ao
   `GetJourneyMapUseCase`), localiza a posição da Jornada atual nessa lista e, se houver uma
   próxima na sequência e ela ainda não tiver progresso registrado (ou estiver `'locked'`),
   grava `status: 'unlocked'` para ela. Isso lida naturalmente com o caso de uma Jornada
   intermediária ter sido desativada — a "próxima" é sempre a próxima **ativa** na ordem, não
   necessariamente `ordem + 1`.

### 3.4 `SaveJornadaUseCase`

Recebe `{ id?: string, nome, ordem, ativa, questionCardIds }`. Se `id` ausente, cria nova
Jornada (`Jornada.create`); caso contrário, carrega a existente e aplica as mudanças, preservando
`createdAt`. Chama `JornadaRepository.save(jornada)`, que faz o replace-all das linhas em
`jornada_perguntas` (ver seção 2). Não mexe em `jornada_progresso` — alterar as perguntas de uma
Jornada que já tem progresso salvo não reresolve o progresso (fora de escopo tratar
recontagem/recalculo de erros já registrados).

---

## 4. UI / COMPONENTES (presentation layer)

### 4.1 `/admin/jornada` — `AdminJornadaPage` (nova, master-detail)

Reaproveita `NavbarComponent` e o padrão visual/estrutural já usado em `browse-cards.page` e
`add-card.page` (tabelas + formulário standalone, sem biblioteca de grid externa).

- **Master (topo da página):** tabela com todas as Jornadas (ativas e inativas), via
  `ListJornadasUseCase`. Colunas: Nome, Ativa (toggle inline, chama `SaveJornadaUseCase` direto
  ao alternar), Ordem, Qtd. de perguntas (`questionCardIds.length`), Ações (Editar / Excluir).
  Botão "+ Nova Jornada" no topo, que abre o painel de detail em branco.
- **Detail (abaixo, abre ao clicar "Editar" ou "+ Nova Jornada"):**
  - Formulário: Nome (`<input>` texto), Ordem (`<input type="number">`), Ativa
    (`<input type="checkbox">` ou toggle).
  - Seletor de perguntas: tabela com todos os 540+ cards (`ListAvailableCardsUseCase`, que
    reaproveita `CardRepository.findAll()` — sem paginação na v1, 540 linhas é tratável numa
    `<table>` com scroll interno). Colunas: checkbox de seleção, Título, Tags. Campo de busca
    (`<input>` de texto) que filtra a lista client-side por `title` (case-insensitive,
    `includes`). Contador "X perguntas selecionadas" acima da tabela.
  - Botões "Salvar" (chama `SaveJornadaUseCase`, depois recarrega a master e fecha o detail) e
    "Cancelar" (fecha sem salvar).
- Exclusão: confirmação simples (`confirm()` nativo do browser, mesmo padrão já usado em
  `navbar.component.ts` para "Resetar Cartões") antes de chamar `DeleteJornadaUseCase`.

### 4.2 `/learn` — `LearnPage` (reescreve o placeholder central/direito, página já existente)

- Injeta `GetJourneyMapUseCase`.
- **Coluna central** (`learn__column--center`): novo componente
  `shared/components/journey-map/journey-map.component`, recebendo a lista de
  `{ jornada, status, bestErrors }`. Lista vertical dos nós (uma lista simples cumpre a função;
  zig-zag horizontal como no Duolingo é puramente estético e fica a critério de quem
  implementar). Cada nó mostra o `nome` da Jornada e o estado visual:
  - ✅ estilo diferenciado se `completed`.
  - 🔓 destacado/clicável se `unlocked`.
  - 🔒 acinzentado, não clicável, se `locked`.
  - Clique em nó `unlocked` ou `completed` → `routerLink="/learn/jornada/{{ jornada.id }}"`.
  - Se a lista de jornadas ativas estiver vazia (admin não criou/ativou nenhuma ainda), mostrar
    mensagem "Nenhuma jornada disponível ainda" em vez de lista vazia.
- **Coluna direita** (`learn__column--right`): novo componente
  `shared/components/xp-panel/xp-panel.component`, recebendo `JourneyStats` — mostra XP total,
  "X/Y jornadas concluídas" (Y = `totalJornadasAtivas`) e uma barra de progresso simples.

### 4.3 `/learn/jornada/:id` — `JornadaPhasePage` (nova página de jogo)

Reaproveita `CardDisplayComponent` (já suporta `card`, `showAnswer`, `selectedOptionId`) e
`NavbarComponent`. **Não** reaproveita `SrsButtonsComponent` (específico do vocabulário
Again/Hard/Good/Easy do SRS — não se aplica aqui).

Estado local do componente:

```ts
questions: Card[] = [];        // perguntas da Jornada, ordem fixa (igual a jornada_perguntas.ordem)
currentIndex = 0;
lives = 3;
errors = 0;
sessionXp = 0;
selectedOptionId: string | null = null;
showFeedback = false;
phaseState: 'playing' | 'failed' | 'completed' = 'playing';
```

Fluxo:
1. `ngOnInit`: lê `id` da rota; se a Jornada não estiver `unlocked`/`completed` no mapa (chamar
   `GetJourneyMapUseCase` de novo ou receber via resolver), redireciona para `/learn`. Carrega as
   perguntas via `GetJornadaQuestionsUseCase(id)`.
2. `selectOption(optionId)`: guarda seleção, `showFeedback = true` (mostra se acertou/errou,
   reaproveitando os estilos de opção correta/errada do `CardDisplayComponent`/CSS existente).
3. `confirm()`:
   - Se errou: `lives--`, `errors++`. Se `lives === 0` → `phaseState = 'failed'`.
   - Se acertou: `sessionXp += 10`.
   - Caso contrário, avança: `currentIndex++`, reseta `selectedOptionId`/`showFeedback`.
   - Se era a última pergunta (`currentIndex === questions.length`) e `phaseState` ainda é
     `'playing'` → `phaseState = 'completed'` e chama
     `CompleteJornadaUseCase.execute(id, errors, sessionXp)`.
4. Tela `failed`: mensagem + botão "Tentar novamente" → reseta todo o estado local (mesmas
   perguntas, mesma ordem, `lives = 3`, `errors = 0`, `sessionXp = 0`, `currentIndex = 0`).
5. Tela `completed`: mensagem de sucesso + XP total ganho nessa tentativa (`sessionXp + 50`) +
   botão "Voltar ao mapa" (`routerLink="/learn"`).

---

## 5. ROTEAMENTO

Em `src/app/app.routes.ts`, adicionar (mantendo a rota `/learn` já existente):

```ts
import { AdminJornadaPage } from './features/admin-jornada/presentation/pages/admin-jornada.page';
import { JornadaPhasePage } from './features/learn/presentation/pages/jornada-phase.page';
...
{ path: 'admin/jornada', component: AdminJornadaPage },
{ path: 'learn/jornada/:id', component: JornadaPhasePage },
```

(Opcional) adicionar links "🛠️ Admin Jornada" e/ou "🎮 Jornada" em `navbar.component.html`,
junto dos demais `routerLink`.

---

## 6. FLUXO RESUMIDO

```
/admin/jornada
  → cria/edita Jornada: nome, ordem, ativa, seleciona perguntas dentre os 540 cards
  → salva (SaveJornadaUseCase)

/learn
  → GetJourneyMapUseCase → mapa das jornadas ativas (ordenadas) + XP total
  → clique em jornada unlocked/completed
/learn/jornada/:id
  → GetJornadaQuestionsUseCase → perguntas da jornada (ordem fixa)
  → loop de perguntas, 3 vidas
      ├─ 3 erros → tela "failed" → Tentar novamente (reinicia do zero)
      └─ todas respondidas com ≤2 erros → tela "completed"
            → CompleteJornadaUseCase (XP + desbloqueio da próxima jornada ativa)
            → volta para /learn
```

---

## 7. ARQUIVOS A CRIAR/MODIFICAR (checklist de implementação)

**Criar:**
- [ ] `src/app/features/jornada/domain/entities/jornada.entity.ts`
- [ ] `src/app/features/jornada/domain/entities/jornada-progress.entity.ts`
- [ ] `src/app/features/jornada/domain/value-objects/journey-stats.value-object.ts`
- [ ] `src/app/features/jornada/data/repositories/jornada.repository.ts`
- [ ] `src/app/features/jornada/data/repositories/jornada-progress.repository.ts`
- [ ] `src/app/features/jornada/application/use-cases/list-jornadas.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/get-jornada-detail.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/save-jornada.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/delete-jornada.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/list-available-cards.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/get-journey-map.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/get-jornada-questions.use-case.ts`
- [ ] `src/app/features/jornada/application/use-cases/complete-jornada.use-case.ts`
- [ ] `src/app/features/admin-jornada/presentation/pages/admin-jornada.page.ts` (+ `.html`, `.scss`)
- [ ] `src/app/features/learn/presentation/pages/jornada-phase.page.ts` (+ `.html`, `.scss`)
- [ ] `src/app/shared/components/journey-map/journey-map.component.ts` (+ `.html`, `.scss`)
- [ ] `src/app/shared/components/xp-panel/xp-panel.component.ts` (+ `.html`, `.scss`)

**Modificar:**
- [ ] `src/app/infrastructure/storage/sqlite.adapter.ts` — tabelas `jornadas`,
      `jornada_perguntas`, `jornada_progresso`, `learn_stats` + métodos de acesso (seção 2)
- [ ] `src/app/app.routes.ts` — rotas `admin/jornada` e `learn/jornada/:id`
- [ ] `src/app/features/learn/presentation/pages/learn.page.ts` (+ `.html`, `.scss`) — mapa via
      jornadas ativas em vez do placeholder atual
- [ ] `src/app/shared/components/navbar/navbar.component.html` — (opcional) links de acesso

---

## 8. VERIFICAÇÃO / TESTES SUGERIDOS

- **Unitário:** `GetJourneyMapUseCase` retorna a jornada de menor `ordem` (entre as ativas) como
  `unlocked` e as demais `locked` quando não há progresso salvo.
- **Unitário:** `CompleteJornadaUseCase` não soma XP duas vezes ao completar a mesma Jornada de
  novo (replay de uma já `completed`).
- **Unitário:** `CompleteJornadaUseCase` desbloqueia a próxima Jornada **ativa** na ordem, mesmo
  que a jornada seguinte por `ordem + 1` esteja desativada (pula para a próxima ativa).
- **Unitário:** `SaveJornadaUseCase` faz replace-all correto das perguntas vinculadas ao editar
  uma Jornada existente (não duplica nem deixa perguntas antigas orfãs em `jornada_perguntas`).
- **Manual:** em `/admin/jornada`, criar 2-3 Jornadas com perguntas diferentes, marcar todas como
  ativas com ordens 1/2/3; ir em `/learn` e confirmar que só a primeira está desbloqueada;
  completá-la com ≤2 erros libera a próxima.
- **Manual:** numa Jornada, errar a 3ª pergunta e confirmar reinício imediato do zero (vidas e
  progresso zerados, XP da tentativa descartado).
- **Manual:** desativar em `/admin/jornada` uma Jornada que está `unlocked`/`completed` no jogo e
  confirmar que ela some do mapa em `/learn` sem quebrar a navegação; reativar e confirmar que
  ela volta com o progresso preservado.
