# SDD - Casa Desafio com Timer de 120 Minutos

## 1. VISÃO GERAL

### 1.1 Motivação

O modo Jornada (`/learn/jornada/:id`) oferece uma experiência de aprendizado gamificada com fases, vidas e XP. 
Essa feature introduz uma variante especial chamada **Casa Desafio** — uma Jornada com duração limitada (120 minutos) 
e um timer regressivo visual que reforça a pressão e a urgência.

O desafio foca em:
- Manter o jogador consciente do tempo restante
- Forçar decisões mais rápidas (mais realista para testes)
- Adicionar dimensão de gestão de tempo ao jogo

### 1.2 História de usuário

> **Como** estudante,
> **Eu quero** participar de uma Casa Desafio que dura 120 minutos com um timer regressivo visível,
> **Para que** eu experimente pressão de tempo ao responder perguntas, simulando uma prova real.

**Regras de produto:**

1. **Identificação:** uma Casa Desafio é uma Jornada com um flag especial `tipoJornada: 'desafio'` 
   (valor padrão é `'normal'` para Jornadas comuns).

2. **Duração fixa:** toda Casa Desafio dura exatamente **120 minutos** (não configurável por Jornada).

3. **Inicialização do timer:**
   - Ao entrar em `/learn/jornada/:id` (sendo um desafio), o timer começa a contar **regressivamente** 
     a partir de 120 minutos.
   - O `startTime` é registrado imediatamente no `sessionStorage` ou `localStorage` para que, mesmo 
     recarregando a página, o tempo decorrido seja recalculado corretamente.

4. **Exibição do timer:**
   - Ícone de relógio + tempo restante **no topo da página, acima da barra de progresso das perguntas** (`jornada-phase.page.html`).
   - Formato: `⏰ 1h 45m 30s` (horas, minutos, segundos).
   - Atualização a cada **1 segundo** (usando `setInterval` + `signal` ou property no component).
   - A cor muda de acordo com urgência:
     - Verde: > 30 minutos
     - Amarelo: 10-30 minutos  
     - Vermelho: < 10 minutos
   - Barra visual de progresso do tempo (0-120 min) abaixo do timer, mostrando graficamente quanto tempo falta.

5. **Limite de tempo ultrapassado:**
   - Se o jogador não terminar a Jornada antes dos 120 minutos acabarem, a Jornada é **automaticamente 
     finalizada** como `'failed'` (igual a quando perde todas as vidas).
   - Uma mensagem especial no diálogo de falha: "⏰ Tempo esgotado! Você não conseguiu completar o desafio 
     em 120 minutos."
   - O progresso é **descartado** (não persiste XP).

6. **Persistência de tempo decorrido:**
   - Caso o usuário saia e volte (recarga de página), o timer **continua do mesmo ponto** — não reseta.
   - Se recarregar a página durante um desafio em andamento, o `startTime` é recuperado de `sessionStorage`.
   - Se a aba for fechada/sessão encerrada, o progresso é perdido como em qualquer Jornada normal.

7. **Conclusão antes do tempo:**
   - Se o jogador completa todas as perguntas **antes de 120 minutos**, a Jornada termina normalmente 
     (status `'completed'`).
   - O tempo total gasto é registrado (já existe `timeSpentSeconds` em `completeJornadaUseCase`).
   - Bônus de XP: sem penalidade ou bônus extra por velocidade (fica para fase 2).

8. **Desafios não completados:**
   - Se o timer chegar a 0 e ainda houver perguntas restantes, falha automática.
   - Se o jogador errar 3 vezes (vidas zeradas) **antes** do tempo acabar, falha normal (com diálogo 
     de vidas zeradas, não de tempo).

9. **Tipo de Jornada:**
   - Campo `tipoJornada` em `JornadaProps` (não existe ainda):
     - `'normal'` (padrão): Jornada comum, sem timer.
     - `'desafio'`: Casa Desafio com timer de 120 minutos.
   - No admin (`/admin/jornada`), ao criar/editar uma Jornada, há um toggle: "Usar como Casa Desafio?".

### 1.3 Escopo desta fase de implementação

- Adicionar campo `tipoJornada` à entidade `Jornada` (domain).
- Atualizar o schema SQLite (adicionar coluna `tipo_jornada`).
- Criar um value object `DesafioTimer` para encapsular a lógica de tempo (estado, cálculo de tempo restante).
- Criar um use case `InitiateDesafioUseCase` para iniciar o timer ao entrar na página.
- Atualizar `JornadaPhasePage` para:
  - Detectar se é desafio e carregar o timer.
  - Exibir o timer regressivo no cabeçalho.
  - Finalizar automaticamente se tempo acabar.
  - Recuperar o `startTime` se houver recarga.
- Atualizar template HTML da página de Jornada para exibir o timer.
- Atualizar admin (`/admin/jornada`) para toggle de desafio.
- Testes unitários para `DesafioTimer` e a lógica de tempo.

### 1.4 Fora de escopo

- Ranking de velocidade ou pontuação extra por tempo (futuro).
- Sistema de lives que recarregam com o tempo.
- Notificações sonoras quando tempo está acabando.
- Sincronização de tempo entre múltiplas abas/dispositivos.
- Pausar o timer manualmente.
- Modo treino (desafio sem penalidade de tempo).

---

## 2. MODELO DE DADOS

### 2.1 Atualização de `JornadaProps` (domain)

```typescript
export interface JornadaProps {
  id: string;
  nome: string;
  ativa: boolean;
  ordem: number;
  pontosTentativas: number;
  questionCardIds: string[];
  tipoJornada: 'normal' | 'desafio';  // NOVO
  createdAt: Date;
  updatedAt: Date;
}

export class Jornada {
  // ... campos existentes ...
  readonly tipoJornada: 'normal' | 'desafio';

  constructor(props: JornadaProps) {
    // ... inicializar campo novo ...
    this.tipoJornada = props.tipoJornada;
  }

  static create(props: { 
    nome: string; 
    ordem: number; 
    pontosTentativas?: number; 
    questionCardIds?: string[]; 
    ativa?: boolean;
    tipoJornada?: 'normal' | 'desafio';  // NOVO
  }): Jornada {
    // ...
    tipoJornada: props.tipoJornada ?? 'normal',  // default 'normal'
  }
}
```

### 2.2 Schema SQLite

Adicionar coluna à tabela `jornadas`:

```sql
ALTER TABLE jornadas ADD COLUMN tipo_jornada TEXT DEFAULT 'normal';
```

### 2.3 Value Object: `DesafioTimer`

Nova classe em `src/app/features/jornada/domain/value-objects/desafio-timer.value-object.ts`:

```typescript
export interface DesafioTimerProps {
  startTimeMs: number;  // timestamp de início (Date.now())
  durationMinutes: number;  // 120
}

export class DesafioTimer {
  readonly startTimeMs: number;
  readonly durationMinutes: number;
  readonly durationMs: number;

  constructor(props: DesafioTimerProps) {
    this.startTimeMs = props.startTimeMs;
    this.durationMinutes = props.durationMinutes;
    this.durationMs = props.durationMinutes * 60 * 1000;
  }

  // Tempo decorrido em milissegundos
  getElapsedMs(nowMs: number = Date.now()): number {
    return Math.max(0, nowMs - this.startTimeMs);
  }

  // Tempo restante em milissegundos
  getRemainingMs(nowMs: number = Date.now()): number {
    return Math.max(0, this.durationMs - this.getElapsedMs(nowMs));
  }

  // Tempo restante em segundos
  getRemainingSeconds(nowMs: number = Date.now()): number {
    return Math.floor(this.getRemainingMs(nowMs) / 1000);
  }

  // Indicador se tempo acabou
  isExpired(nowMs: number = Date.now()): boolean {
    return this.getRemainingMs(nowMs) <= 0;
  }

  // Formato legível: "1h 45m 30s"
  getFormattedRemaining(nowMs: number = Date.now()): string {
    const secondsRemaining = this.getRemainingSeconds(nowMs);
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  // Cor de urgência
  getUrgencyColor(nowMs: number = Date.now()): 'green' | 'yellow' | 'red' {
    const remainingMinutes = this.getRemainingSeconds(nowMs) / 60;
    if (remainingMinutes > 30) return 'green';
    if (remainingMinutes > 10) return 'yellow';
    return 'red';
  }
}
```

### 2.4 Persistência em `JornadaProgressRepository`

Adicionar suporte a persistir `desafioStartTime` ao salvar progresso:

```typescript
export interface JornadaProgressProps {
  jornadaId: string;
  status: 'unlocked' | 'completed' | 'failed';
  bestErrors: number | null;
  completedAt: Date | null;
  currentQuestionIndex: number;
  currentErrors: number;
  currentLives: number;
  lastActiveAt: Date;
  desafioStartTimeMs?: number;  // NOVO: timestamp de início do desafio
}
```

---

## 3. ARQUITETURA

### 3.1 Estrutura de arquivos

```
src/app/features/jornada/
  domain/
    entities/
      jornada.entity.ts          (atualizar com tipoJornada)
      jornada-progress.entity.ts (adicionar desafioStartTimeMs)
    value-objects/
      desafio-timer.value-object.ts  (NOVO)
  application/
    use-cases/
      initiate-desafio.use-case.ts    (NOVO)
  data/
    repositories/
      jornada-progress.repository.ts  (atualizar)

src/app/features/learn/
  presentation/
    pages/
      jornada-phase.page.ts      (atualizar com timer)
      jornada-phase.page.html    (atualizar template)
      jornada-phase.page.scss    (adicionar estilos de timer)

src/app/features/admin-jornada/
  presentation/
    components/
      jornada-form.component.ts  (adicionar toggle tipoJornada)
```

### 3.2 Fluxo de inicialização

1. Usuário acessa `/learn/jornada/:id`.
2. `JornadaPhasePage.ngOnInit()` carrega jornada e detecta se é desafio.
3. Se é desafio:
   - Cria `DesafioTimer` com `startTimeMs = Date.now()`.
   - Persiste em `sessionStorage` como chave `desafio_start_${jornadaId}`.
   - Inicia um `setInterval` para atualizar o timer a cada 1s.
   - Exibe timer no cabeçalho.
4. A cada atualização do timer, verifica se tempo acabou.
5. Se acabou e ainda há perguntas: finaliza como `'failed'` com mensagem de tempo.

---

## 4. IMPLEMENTAÇÃO (por arquivo)

### 4.1 `desafio-timer.value-object.ts`

Criar classe conforme seção 2.3 (valor object puro, sem dependências).

### 4.2 `jornada.entity.ts`

Adicionar campo `tipoJornada` ao construtor e factory method.

### 4.3 `jornada-progress.entity.ts`

Adicionar campo `desafioStartTimeMs` ao construtor.

### 4.4 `initiate-desafio.use-case.ts` (NOVO)

```typescript
export class InitiateDesafioUseCase {
  constructor(private progressRepository: JornadaProgressRepository) {}

  async execute(jornadaId: string): Promise<DesafioTimer> {
    const progress = await this.progressRepository.getProgress(jornadaId);
    
    let startTimeMs = Date.now();
    
    // Se houver progresso salvo do desafio, recupera o startTime
    if (progress?.desafioStartTimeMs) {
      startTimeMs = progress.desafioStartTimeMs;
    }

    const timer = new DesafioTimer({
      startTimeMs,
      durationMinutes: 120
    });

    // Salva o startTime no progresso
    await this.progressRepository.saveProgress(new JornadaProgress({
      jornadaId,
      status: progress?.status ?? 'unlocked',
      bestErrors: progress?.bestErrors ?? null,
      completedAt: progress?.completedAt ?? null,
      currentQuestionIndex: progress?.currentQuestionIndex ?? 0,
      currentErrors: progress?.currentErrors ?? 0,
      currentLives: progress?.currentLives ?? 3,
      lastActiveAt: new Date(),
      desafioStartTimeMs: startTimeMs
    }));

    return timer;
  }
}
```

### 4.5 `jornada-phase.page.ts` (atualizar)

Adicionar propriedades:

```typescript
export class JornadaPhasePage implements OnInit {
  // ... propriedades existentes ...
  isDesafio = false;
  desafioTimer: DesafioTimer | null = null;
  timerDisplay = '';
  timerColor: 'green' | 'yellow' | 'red' = 'green';
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    // ... existentes ...
    private initiateDesafioUseCase: InitiateDesafioUseCase,
    // ...
  ) {}

  async validateAccessAndLoad(): Promise<void> {
    // ... código existente ...
    
    if (currentItem?.jornada.tipoJornada === 'desafio') {
      this.isDesafio = true;
      this.desafioTimer = await this.initiateDesafioUseCase.execute(this.jornadaId);
      this.startTimerInterval();
    }

    // ... resto do código ...
  }

  private startTimerInterval(): void {
    if (!this.desafioTimer) return;

    this.timerIntervalId = setInterval(() => {
      if (!this.desafioTimer) return;

      const now = Date.now();
      this.timerDisplay = this.desafioTimer.getFormattedRemaining(now);
      this.timerColor = this.desafioTimer.getUrgencyColor(now);

      if (this.desafioTimer.isExpired(now)) {
        this.handleDesafioTimeout();
      }

      this.cdr.markForCheck();
    }, 1000);
  }

  private async handleDesafioTimeout(): Promise<void> {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.showFailedDialog = true;
    this.phaseState = 'failed';
    
    // Mensagem customizada para timeout
    // (pode ser um novo field ou usar lógica na template)

    this.currentIndex = 0;
    this.errors = 0;
    this.lives = this.pontosTentativas;
    
    await this.saveCurrentProgress();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }
  }
}
```

### 4.6 `jornada-phase.page.html` (atualizar)

Adicionar timer no cabeçalho/navbar:

```html
<div class="jornada-header">
  <div class="jornada-title">
    <h1>{{ jornadaNome }}</h1>
  </div>

  <!-- Timer do Desafio -->
  <div *ngIf="isDesafio && desafioTimer" class="desafio-timer" [class]="'timer-' + timerColor">
    <span class="timer-icon">⏰</span>
    <span class="timer-text">{{ timerDisplay }}</span>
  </div>

  <!-- Vidas (corações) -->
  <div class="hearts-container">
    <span *ngFor="let _ of heartArray" class="heart" [class.empty]="_ >= lives">❤️</span>
  </div>
</div>
```

### 4.7 `jornada-phase.page.scss` (adicionar estilos)

```scss
.desafio-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;

  .timer-icon {
    font-size: 18px;
  }

  &.timer-green {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.timer-yellow {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }

  &.timer-red {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    animation: pulse-red 1s infinite;
  }
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 4.8 Admin: `jornada-form.component.ts` (atualizar)

Adicionar toggle:

```typescript
export class JornadaFormComponent {
  // ... propriedades existentes ...
  isDesafio = false;

  get tipoJornada(): 'normal' | 'desafio' {
    return this.isDesafio ? 'desafio' : 'normal';
  }
}
```

### 4.9 Admin: template HTML (atualizar)

```html
<label>
  <input type="checkbox" [(ngModel)]="isDesafio" />
  Usar como Casa Desafio (120 minutos)?
</label>
```

---

## 5. TESTES

### 5.1 `desafio-timer.value-object.spec.ts`

Testes da lógica pura de cálculo de tempo:

```typescript
describe('DesafioTimer', () => {
  it('deve calcular tempo restante corretamente', () => {
    const startTime = 1000;
    const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
    const now = startTime + 60 * 60 * 1000; // 1 hora depois
    
    expect(timer.getRemainingSeconds(now)).toBe(60 * 60); // 1 hora = 3600 segundos
  });

  it('deve retornar 0 quando tempo acabar', () => {
    const startTime = 1000;
    const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
    const now = startTime + 120 * 60 * 1000 + 1000; // 120 minutos + 1 segundo
    
    expect(timer.getRemainingSeconds(now)).toBe(0);
  });

  it('deve indicar urgência com cores corretas', () => {
    const startTime = 1000;
    const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });

    // > 30 min = green
    const now1 = startTime + 50 * 60 * 1000;
    expect(timer.getUrgencyColor(now1)).toBe('green');

    // 10-30 min = yellow
    const now2 = startTime + 20 * 60 * 1000;
    expect(timer.getUrgencyColor(now2)).toBe('yellow');

    // < 10 min = red
    const now3 = startTime + 5 * 60 * 1000;
    expect(timer.getUrgencyColor(now3)).toBe('red');
  });
});
```

### 5.2 `initiate-desafio.use-case.spec.ts`

Testes do use case (fake repository).

---

## 6. CONCLUSÃO

Esta feature adiciona dimensão de **pressão de tempo** ao modo Jornada, transformando certos desafios 
em experiências mais realistas de prova. O design mantém compatibilidade com Jornadas normais e permite 
futura expansão (bônus de velocidade, modos especiais, etc.).

**Próximas fases (futuro):**
- Ranking de velocidade
- Bônus de XP por aceleração
- Modo treino (desafio prática)
- Notificações de tempo crítico
