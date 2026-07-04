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

## Estrutura

```
backend/
├── main.py             # aplicação FastAPI (rotas + lógica)
├── requirements.txt     # dependências Python
├── .env.example         # template de variáveis de ambiente
└── .env                 # (não versionado) suas chaves reais
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
