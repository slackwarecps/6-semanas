# SDD - Tela `/testa-resposta` (integração Angular ↔ Backend LLM)

## 1. VISÃO GERAL

### 1.1 Motivação

O backend em `/backend` (FastAPI + LangChain, ver `backend/main.py`) já expõe um endpoint
que recebe uma pergunta e devolve a resposta de um LLM (Claude ou DeepSeek). Falta uma tela
no app Angular para testar esse endpoint manualmente durante o desenvolvimento: digitar uma
pergunta, disparar a chamada e inspecionar a resposta completa (incluindo metadados como
modelo e provedor usados).

### 1.2 Escopo

- Nova rota `/testa-resposta` no Angular.
- Textarea grande para digitar a pergunta + botão "Responder".
- Estado de loading enquanto aguarda o backend.
- Exibição do JSON completo da resposta abaixo do botão.
- Configuração da URL do backend via variável de ambiente do Angular (não hardcoded).
- Ajuste mínimo no backend (CORS) para permitir a chamada do navegador — sem isso a
  integração não funciona.

---

## 2. ANÁLISE DO BACKEND (`/backend`)

- **Framework:** FastAPI, rodando via `uvicorn main:app --reload`.
- **Porta padrão:** `8000` (`http://127.0.0.1:8000`), conforme `backend/README.md`. Não há
  override de porta no `.env`/`.env.example` do backend.
- **Endpoint:** `POST /perguntar`
  - Request body:
    ```json
    { "pergunta": "texto da pergunta", "provedor": "claude" }
    ```
    - `pergunta`: string obrigatória (erro 400 se vazia).
    - `provedor`: opcional, `"claude"` (default) ou `"deepseek"` (erro 400 se inválido). **Quem
      decide o provedor é o backend (via `.env`/default do próprio `main.py`), não o Angular.**
      A tela `/testa-resposta` não envia esse campo — deixa o backend aplicar seu próprio
      default. Se no futuro o provedor precisar ser trocado, isso é feito configurando o
      backend, não a UI.
  - Response body (200):
    ```json
    { "resposta": "texto gerado", "provedor": "claude", "modelo": "claude-opus-4-8" }
    ```
  - Erros retornam `{"detail": "mensagem"}` com status 400.
- **CORS:** `main.py` **não tem** `CORSMiddleware` configurado. Uma chamada `fetch`/`HttpClient`
  feita do Angular (`http://localhost:4200`) para `http://127.0.0.1:8000` será bloqueada pelo
  navegador sem esse ajuste.
  - **Ação necessária no backend:** adicionar `CORSMiddleware` liberando (pelo menos) a origem
    `http://localhost:4200` para métodos `POST`/`GET` e headers `Content-Type`.
  - Isso é uma mudança pequena e isolada em `backend/main.py`; será feita junto com a
    implementação da tela, já que sem ela a feature não funciona.

---

## 3. VARIÁVEIS DE AMBIENTE NO ANGULAR

Importante alinhar expectativa: o Angular gera um bundle estático que roda no navegador, então
**não existe leitura de arquivo `.env` em runtime** (isso só funciona em Node, como no
`scripts/test-quiz-solver.ts`). O jeito idiomático de ter "variáveis de ambiente" em uma app
Angular é o mecanismo nativo de `environment.ts` + `fileReplacements`, substituído em tempo de
build. É isso que será usado aqui.

### Arquivos novos

- `src/environments/environment.ts` (usado em dev/serve):
  ```ts
  export const environment = {
    production: false,
    backendBaseUrl: 'http://127.0.0.1:8000',
  };
  ```
- `src/environments/environment.prod.ts` (usado no build de produção):
  ```ts
  export const environment = {
    production: true,
    backendBaseUrl: 'http://127.0.0.1:8000', // ajustar quando houver deploy real
  };
  ```

### Ajuste em `angular.json`

Adicionar `fileReplacements` na configuration `production` do target `build`:
```json
"fileReplacements": [
  { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
]
```

O componente/serviço nunca monta a URL manualmente — sempre importa `environment` e usa
`environment.backendBaseUrl`.

---

## 4. ARQUITETURA DA SOLUÇÃO

Seguindo o padrão já usado em `features/add-card`, `features/import-cards` etc. (standalone
components, camada `presentation/pages`, serviço injetável para a integração externa):

```
src/app/features/testa-resposta/
├── data/
│   └── services/
│       └── pergunta-llm.service.ts      # HttpClient -> POST {backendBaseUrl}/perguntar
└── presentation/
    └── pages/
        ├── testa-resposta.page.ts
        ├── testa-resposta.page.html
        └── testa-resposta.page.scss
```

### `pergunta-llm.service.ts`

- `@Injectable({ providedIn: 'root' })`, injeta `HttpClient` via constructor (mesmo estilo do
  resto do projeto).
- Tipos:
  ```ts
  export interface PerguntaRequest {
    pergunta: string;
  }

  export interface PerguntaResponse {
    resposta: string;
    provedor: string;
    modelo: string;
  }
  ```
  Repare que `PerguntaRequest` **não tem campo `provedor`** — o Angular só envia a pergunta;
  qual LLM responde é decisão exclusiva do backend (config/`.env` dele). O `provedor` que volta
  na `PerguntaResponse` é só informativo, pra exibir no JSON qual provedor respondeu.
- Método `perguntar(request: PerguntaRequest): Promise<PerguntaResponse>` — chama
  `POST ${environment.backendBaseUrl}/perguntar` via `firstValueFrom(this.http.post(...))`,
  enviando `{ pergunta }` apenas.
- Repassa erros (`HttpErrorResponse`) para o componente tratar (ver seção 6).

### `testa-resposta.page.ts`

- Componente standalone, `imports: [CommonModule, FormsModule, NavbarComponent]` (mesmo padrão
  do `AddCardPage`).
- Estado local: `pergunta: string`, `isLoading: boolean`, `resposta: PerguntaResponse | null`,
  `erro: string | null`. **Sem campo/seletor de provedor na UI** — decisão confirmada com o
  Fabão: quem escolhe o provedor é o `.env` do backend, o Angular não deve ter esse controle.
- `async onResponder()`:
  1. Valida que `pergunta` não está vazia/em branco (não chama o backend se vazio).
  2. `isLoading = true`, limpa `erro`/`resposta` anteriores.
  3. Chama `perguntaLlmService.perguntar(...)`.
  4. Em sucesso: guarda em `resposta`. Em falha: guarda mensagem tratada em `erro`.
  5. `isLoading = false` no `finally`.

---

## 5. FLUXO DE TELA (UX)

1. Textarea grande (`rows` generoso, `resize: vertical`) para digitar a pergunta.
2. Botão **"Responder"**:
   - Desabilitado enquanto `isLoading` ou pergunta vazia.
   - Enquanto `isLoading`: mostra spinner/texto "Consultando..." no lugar do texto do botão.
3. Abaixo do botão:
   - Se `erro`: bloco de erro visível (mensagem + status HTTP se disponível).
   - Se `resposta`: bloco com o JSON completo formatado (`<pre>{{ resposta | json }}</pre>` ou
     `JSON.stringify(resposta, null, 2)`), exibindo `resposta`, `provedor` e `modelo`.

---

## 6. TRATAMENTO DE ERROS

- **Pergunta vazia:** validação no client, nem chama o backend.
- **Backend retorna 400** (`provedor` inválido / pergunta vazia no servidor): mostra
  `error.error?.detail` do `HttpErrorResponse`.
- **Backend fora do ar / CORS bloqueado / timeout:** mostra mensagem genérica ("Não foi possível
  conectar ao backend. Verifique se ele está rodando em `{backendBaseUrl}`.") — ajuda a debugar
  já que essa é justamente uma tela de teste de integração.
- Nenhum uso de `alert()` aqui (diferente do `AddCardPage`) — o erro fica embutido na própria
  tela, já que o objetivo é inspecionar a resposta/erro completo.

---

## 7. ROTEAMENTO

Em `src/app/app.routes.ts`, adicionar:
```ts
import { TestaRespostaPage } from './features/testa-resposta/presentation/pages/testa-resposta.page';
...
{ path: 'testa-resposta', component: TestaRespostaPage },
```

Não é estritamente necessário adicionar link na navbar (a rota já fica acessível digitando a
URL), mas pode-se opcionalmente incluir um item "🧪 Testar Resposta LLM" no dropdown de
Configurações do `navbar.component.html`, se fizer sentido para o Fabão.

---

## 8. ALTERAÇÕES NO BACKEND

- `backend/main.py`: adicionar `CORSMiddleware` (do `fastapi.middleware.cors`) liberando origem
  `http://localhost:4200` (porta padrão do `ng serve`), métodos `GET`/`POST`, todos os headers.
  Sem isso, a chamada do Angular falha por CORS mesmo com o backend no ar.

---

## 9. ARQUIVOS A CRIAR/MODIFICAR (checklist de implementação)

**Criar:**
- [ ] `src/environments/environment.ts`
- [ ] `src/environments/environment.prod.ts`
- [ ] `src/app/features/testa-resposta/data/services/pergunta-llm.service.ts`
- [ ] `src/app/features/testa-resposta/presentation/pages/testa-resposta.page.ts`
- [ ] `src/app/features/testa-resposta/presentation/pages/testa-resposta.page.html`
- [ ] `src/app/features/testa-resposta/presentation/pages/testa-resposta.page.scss`

**Modificar:**
- [ ] `angular.json` — `fileReplacements` na configuration `production`
- [ ] `src/app/app.routes.ts` — nova rota `testa-resposta`
- [ ] `backend/main.py` — `CORSMiddleware`
- [ ] (opcional) `src/app/shared/components/navbar/navbar.component.html` — link de acesso

---

## 10. FORA DE ESCOPO

- Autenticação/autorização na chamada ao backend.
- Persistência do histórico de perguntas testadas.
- Deploy do backend (URL de produção real) — `environment.prod.ts` fica com o mesmo
  `127.0.0.1:8000` por enquanto, só a estrutura fica pronta para trocar depois.
