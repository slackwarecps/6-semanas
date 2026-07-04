# Plano de Teste — Tela `/testa-resposta`

## Contexto

Outro agente está implementando a tela `/testa-resposta` seguindo o spec
`spec-docs/TESTA_RESPOSTA_SDD.md`. Este documento não implementa nada — define como **verificar,
depois que a implementação estiver pronta, se ela bate com o spec e funciona de ponta a ponta**
(Angular → backend FastAPI → LLM real).

Levantamento feito antes de escrever este plano (read-only):
- No momento em que este plano foi escrito, **nada da feature existia ainda**: não havia
  `src/app/features/testa-resposta/`, não havia `src/environments/`, não havia
  `fileReplacements` no `angular.json`, não havia rota `testa-resposta` em `app.routes.ts`, e
  `backend/main.py` ainda **não tinha CORS** configurado.
- O backend (`backend/.env`) já tem `ANTHROPIC_API_KEY` e `DEEPSEEK_API_KEY` preenchidas
  (não vazias) e `ANTHROPIC_MODEL`/`DEEPSEEK_MODEL` definidos — dá pra fazer teste **real**
  (chamando o LLM de verdade), não só mock.
- O venv do backend (`backend/venv`) já tem `fastapi`, `uvicorn`, `langchain-anthropic`,
  `langchain-deepseek`, `python-dotenv` instalados — o backend deve subir sem passo extra de
  instalação.
- Exemplo de chamada válida documentado em `backend/postman/chamada1.http`: porta `8000`,
  `POST /perguntar` com `{"pergunta": "...", "provedor": "claude"}`.
- `package.json`: `npm start` roda `generate-flashcards-index.js` e depois `ng serve` (porta
  padrão do Angular dev server é `4200`, sem override em `angular.json`).

## Checklist de conformidade com o spec (revisão de código, antes de rodar nada)

Ler os arquivos criados/alterados pelo outro agente e conferir contra
`spec-docs/TESTA_RESPOSTA_SDD.md`:

1. **`src/environments/environment.ts` e `environment.prod.ts`** existem e expõem
   `backendBaseUrl` (não hardcoded na página/serviço).
2. **`angular.json`** tem `fileReplacements` na configuration `production` apontando para
   `environment.prod.ts`.
3. **`pergunta-llm.service.ts`**:
   - Injeta `HttpClient` via constructor.
   - Monta a URL usando `environment.backendBaseUrl` (não string hardcoded tipo
     `http://127.0.0.1:8000` direto no serviço).
   - `PerguntaRequest` envia **apenas `{ pergunta }`** — **crítico**: confirmar que o campo
     `provedor` NÃO é enviado pelo Angular (decisão explícita do Fabão: quem escolhe o
     provedor é o `.env` do backend, não a UI).
4. **`testa-resposta.page.ts/html`**:
   - Textarea grande vinculada a `pergunta`.
   - Botão "Responder" desabilitado quando `pergunta` vazia/em branco ou `isLoading`.
   - Estado de loading visível durante a chamada.
   - JSON completo da resposta (`resposta`, `provedor`, `modelo`) exibido abaixo do botão
     após sucesso.
   - Bloco de erro tratado (não `alert()`) exibido em caso de falha.
5. **`app.routes.ts`** tem `{ path: 'testa-resposta', component: TestaRespostaPage }`.
6. **`backend/main.py`** tem `CORSMiddleware` importado e configurado liberando
   `http://localhost:4200` (métodos GET/POST, todos os headers).

Qualquer desvio encontrado aqui vira uma observação antes mesmo de rodar a aplicação.

## Teste end-to-end (aplicação rodando de verdade)

1. **Subir o backend**:
   ```sh
   cd backend && source venv/bin/activate && uvicorn main:app --reload
   ```
   Confirmar que sobe em `http://127.0.0.1:8000` sem erro (chaves já estão no `.env`).

2. **Checar CORS/health rapidamente via curl** (fora do navegador, para isolar backend de
   frontend):
   ```sh
   curl -i -X POST http://127.0.0.1:8000/perguntar \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:4200" \
     -d '{"pergunta": "O que é uma API REST?"}'
   ```
   Confirmar: status 200, JSON com `resposta`/`provedor`/`modelo`, e presença do header
   `access-control-allow-origin` na resposta (prova que o CORS foi configurado certo).

3. **Subir o Angular**: `npm start` (ou `ng serve`), abrir `http://localhost:4200/testa-resposta`.

4. **Usar o Chrome (via `claude-in-chrome`)** para dirigir o fluxo real na UI e validar
   visualmente:
   - Caso feliz: digitar uma pergunta simples (ex: "O que é uma API REST?"), clicar
     "Responder", observar o estado de loading aparecer e sumir, e o JSON completo aparecer
     abaixo do botão com `resposta` preenchida e `provedor`/`modelo` condizentes com o
     `backend/.env`.
   - Ler o console do navegador (`read_console_messages`) e a aba de rede
     (`read_network_requests`) para confirmar que a chamada foi para
     `http://127.0.0.1:8000/perguntar`, sem erro de CORS, e que o **request body enviado não
     contém o campo `provedor`** (fechando o ponto crítico do checklist acima).
   - Caso de borda: clicar "Responder" com a textarea vazia — botão deve permanecer
     desabilitado / nenhuma chamada de rede disparada.
   - Caso de erro: derrubar o backend (matar o processo `uvicorn`) e tentar responder de
     novo — confirmar que aparece mensagem de erro tratada na tela (não tela quebrada, sem
     `alert()` bloqueante).

5. **Teste de build de produção** (garante que `fileReplacements` funciona):
   ```sh
   npm run build
   ```
   Confirmar que o build passa sem erro e que o bundle usa `environment.prod.ts` (checar, por
   exemplo, que não há erro de "environment not found" e que o `backendBaseUrl` esperado
   aparece no bundle gerado, via `grep` no `dist/`).

## Critérios de aceite (resumo)

- Código bate com o checklist de conformidade acima (em especial: sem `provedor` no request,
  URL via `environment`, CORS configurado no backend).
- Fluxo feliz na UI real (via Chrome) funciona ponta a ponta com resposta de LLM real.
- Pergunta vazia não dispara chamada.
- Erro de backend indisponível é tratado na UI sem quebrar a tela.
- `npm run build` (produção) passa sem erro.

## Observações / riscos a reportar se aparecerem

- Se o outro agente **não** adicionar CORS no backend, o teste via Chrome vai falhar com erro
  de CORS no console — reportar isso como não conformidade com o spec, não tentar corrigir eu
  mesmo (é o outro agente que implementa).
- Se o outro agente incluir campo `provedor` no request do Angular (ex: seletor de provedor na
  UI), reportar como desvio do que foi combinado com o Fabão.
