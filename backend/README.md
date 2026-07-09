# Backend — Pergunta e Resposta com LLM (Claude / DeepSeek)

Backend didático em **Python + FastAPI**. Recebe uma pergunta via HTTP e devolve a
resposta de um modelo de linguagem (Claude, via Anthropic, ou DeepSeek), usando
**LangChain** como camada de integração com os provedores.

## Requisitos Funcionais

1. A API deve expor um endpoint `POST /perguntar` que recebe:
   - `pergunta` (string, obrigatório): o texto da pergunta do usuário
   - `provedor` (string, opcional, default `"claude"`): `"claude"` ou `"deepseek"`
2. A API deve chamar o LLM escolhido via LangChain e devolver:
   - `resposta`: o texto gerado pelo modelo
   - `provedor`: qual provedor respondeu
   - `modelo`: qual modelo específico foi usado
3. Se `pergunta` vier vazia, a API deve responder erro 400.
4. Se `provedor` for inválido (diferente de `claude`/`deepseek`), a API deve responder erro 400.
5. As chaves de API (Anthropic e DeepSeek) devem vir de variáveis de ambiente (`.env`),
   nunca hardcoded no código.
6. O backend deve persistir os dados do app (cards, jornadas, progresso, config) em um
   banco **SQLite** próprio, com isolamento por usuário via coluna `user_id`,
   preenchida a partir do header `X-User-Id` (obrigatório nas rotas de dados; sem ele a
   API responde 422). Plano completo em `spec-docs/migration_backend_plan.md` na raiz.
7. A API deve expor o CRUD de cards cobrindo a `StorageInterface` do frontend:
   - `GET /cards` — lista os cards do usuário (ordenados por `seq`), com options,
     attempts e tags aninhados
   - `GET /cards/{id}` — busca um card (404 se não existir para aquele usuário)
   - `POST /cards` — upsert: cria atribuindo o próximo `seq` do usuário, ou atualiza
     preservando `createdAt`/`seq` e substituindo options/attempts
   - `DELETE /cards/{id}` — remove card, options e attempts (idempotente, 204)
8. A API deve expor configuração por usuário (ex.: `LLM_QUERY_DEFAULT`):
   - `GET /config/{chave}` — 404 se não existir (o frontend aplica seu default)
   - `PUT /config/{chave}` — upsert com corpo `{"valor": "..."}`
9. A API deve expor jornadas, progresso e XP por usuário:
   - `GET /jornadas` e `GET /jornadas/{id}` — jornadas com `cardIds` aninhados e ordenados
   - `POST /jornadas` — upsert (substitui as perguntas vinculadas)
   - `DELETE /jornadas/{id}` — remove jornada, perguntas e progresso
   - `GET`/`PUT /jornadas/{id}/progresso` — progresso da jornada (404 se não existir)
   - `GET`/`POST /learn/xp` — consulta e soma de XP
   - `POST /learn/reset-progress` — zera progresso de todas as jornadas e o XP
10. A API deve permitir o reset total do usuário ativo:
    - `DELETE /user-data` — apaga cards, jornadas, progresso, XP e config do usuário

## Estrutura

```
backend/
├── main.py             # aplicação FastAPI (bootstrap, CORS, rota /perguntar)
├── database.py          # entidades SQLModel + engine + get_session (SQLite)
├── restore_backup.py    # importa backup .sqlite legado do frontend para um user_id
├── routes/
│   ├── deps.py          # dependência get_user_id (header X-User-Id)
│   ├── cards.py         # CRUD de cards (GET/POST/DELETE /cards)
│   ├── config.py        # config por usuário (GET/PUT /config/{chave})
│   └── jornadas.py      # jornadas, progresso, XP e reset de dados do usuário
├── test_db.py           # testes do schema e do isolamento por usuário (pytest)
├── test_api.py          # testes das rotas REST multi-usuário (pytest)
├── database.sqlite      # (não versionado) banco criado no startup
├── requirements.txt     # dependências Python
├── .env.example         # template de variáveis de ambiente
└── .env                 # (não versionado) suas chaves reais
```

## Restore de backup legado (Fase 5 da migração)

O script `restore_backup.py` importa o `.sqlite` exportado pela tela "Backup / Restore"
do frontend (o banco sql.js que vivia no localStorage do navegador) para o banco do
backend, amarrado a um usuário — preservando histórico, tags e as explicações geradas
por IA (sem regastar tokens de LLM). É idempotente (reexecutar sobrescreve, não duplica).

```sh
python restore_backup.py ~/Downloads/flashcards_backup_2026-07-05.sqlite --user fabao
# use --dry-run para só conferir as contagens sem gravar
```

## Limpeza de Ruído nas Tags

O script `clean_tags_noise.py` remove o ruído `"Tags:"` (gerado na importação original de metadados dos arquivos Markdown) da coluna `tags` da tabela `cards` no banco de dados SQLite.

```sh
python clean_tags_noise.py
```

## Banco de dados (Fase 1 da migração)

O schema espelha o banco local do frontend (`src/app/infrastructure/storage/sqlite.adapter.ts`),
com duas mudanças estruturais:

- **Multi-usuário:** toda tabela ganhou `user_id`, que participa da chave primária
  composta — o mesmo backup pode ser restaurado para mais de um usuário sem colisão de ids.
- **Sem `card_seq_counter`:** o `seq` dos cards passa a ser calculado por usuário no
  momento da inserção (implementação na Fase 2).

Tabelas: `cards`, `card_options`, `attempts`, `jornadas`, `jornada_perguntas`,
`jornada_progresso`, `learn_stats`, `app_config`. Os campos ficam em camelCase para
casar 1:1 com o JSON do frontend. O arquivo `database.sqlite` é criado automaticamente
no startup do FastAPI.

Para rodar os testes (banco + API):

```sh
pytest test_db.py test_api.py -v
```

Exemplo de uso multi-usuário (o header `X-User-Id` define de quem são os dados):

```sh
curl http://127.0.0.1:8000/cards -H "X-User-Id: fabao"
curl http://127.0.0.1:8000/cards -H "X-User-Id: walle"
```

## Como rodar

### 1. Criar e ativar um ambiente virtual

```sh
cd backend
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
```

### 2. Instalar as dependências

```sh
pip install -r requirements.txt
```

### 3. Configurar as variáveis de ambiente

```sh
cp .env.example .env
```

Edite o `.env` e preencha ao menos uma das chaves (`ANTHROPIC_API_KEY` e/ou
`DEEPSEEK_API_KEY`), dependendo de qual provedor você for usar.

### 4. Subir o servidor

```sh
uvicorn main:app --reload
```

O servidor sobe em `http://127.0.0.1:8000`. A documentação interativa (Swagger)
fica disponível em `http://127.0.0.1:8000/docs`.

### 5. Testar

```sh
curl -X POST http://127.0.0.1:8000/perguntar \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "O que é uma API REST?", "provedor": "claude"}'
```

Resposta esperada:

```json
{
  "resposta": "Uma API REST é...",
  "provedor": "claude",
  "modelo": "claude-opus-4-8"
}
```

Para usar DeepSeek, basta trocar `"provedor": "deepseek"` no corpo da requisição.

## Como funciona (didático)

- **FastAPI** cuida do servidor HTTP e da validação automática do corpo da requisição
  (via `pydantic.BaseModel`).
- **LangChain** abstrai a chamada ao LLM: `ChatAnthropic` e `ChatDeepSeek` são "chat
  models" com a mesma interface (`.ainvoke(texto)`), então trocar de provedor é só trocar
  qual classe é instanciada — o resto do código não muda.
- Cada chat model lê sua própria chave de API automaticamente da variável de ambiente
  (`ANTHROPIC_API_KEY` / `DEEPSEEK_API_KEY`), sem precisar passar a chave manualmente no
  código.
