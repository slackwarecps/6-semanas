# Plano de Implementação: SQLite no Backend (Multi-Usuários)

Abaixo estão as 5 fases atômicas de entrega para migrarmos a persistência de dados do Frontend (Angular/WASM) para o Backend (Python/FastAPI) com suporte a múltiplos usuários usando o Header `X-User-Id`. Cada fase pode ser concluída e validada isoladamente sem quebrar o projeto.

---

## 🏗 Fase 1: Setup do Banco de Dados no Backend (SQLModel)

**Objetivo:** Preparar a infraestrutura de dados no Python, sem alterar rotas ainda.

**O que será feito:**
- Atualizar `requirements.txt` (incluir `sqlmodel`).
- Criar `backend/database.py` e definir as entidades (`Card`, `CardOption`, `Attempt`) usando **SQLModel**, garantindo que todas tenham a coluna `user_id` indexada.
- Criar a função para fornecer sessões do banco (`get_session`).
- Integrar a criação do arquivo `database.sqlite` na inicialização do FastAPI (`main.py`).

**Como Testar:**
- Escrever um teste rápido no backend (`test_db.py` usando `pytest`) ou script isolado para inserir dois cartões manualmente vinculados a usuários diferentes e consultar. O backend continua respondendo normalmente.

---

## 🛣 Fase 2: Criação da API REST de Storage (Multi-Usuário)

**Objetivo:** Expor os endpoints necessários para o frontend manipular o banco, garantindo o isolamento de usuários.

**O que será feito:**
- Criar `backend/routes/cards.py` com os endpoints que cobrem a `StorageInterface`:
  - `GET /cards` (lê `X-User-Id` e retorna só os cards daquele user)
  - `GET /cards/{id}`
  - `POST /cards` (salva o card atribuindo ele ao `X-User-Id`)
  - `DELETE /cards/{id}`
- Adicionar os roteadores em `main.py`.

**Como Testar:**
- Acessar a doc Swagger (`http://localhost:8000/docs`).
- Fazer uma requisição simulando `X-User-Id: fabao` e outra com `X-User-Id: walle`. Confirmar que os cartões não se misturam.

---

## 🔌 Fase 3: Conexão do Frontend (HttpApiAdapter)

**Objetivo:** Fazer o Angular usar o backend real em vez do banco local, mantendo o usuário estático num primeiro momento.

**O que será feito:**
- Criar `HttpApiAdapter` no Angular (`src/app/infrastructure/storage/http-api.adapter.ts`), que implementa a `StorageInterface` usando o `HttpClient`.
- Injetar o header `X-User-Id` estaticamente (ex: hardcoded para `'fabao'`) nas requisições do adapter ou via Interceptor HTTP.
- Alterar o `CardRepository` para depender do `HttpApiAdapter` em vez do `SqliteAdapter`.

**Como Testar:**
- Subir ambos (Angular e FastAPI). Abrir o frontend. Se criarmos um card na interface, ele deve aparecer no backend e persistir caso a página seja recarregada, consultando a API via Network tab.

---

## 👥 Fase 4: Seletor de Usuários Dinâmico na UI

**Objetivo:** Permitir que múltiplos usuários usem o frontend no mesmo navegador, alternando o ambiente.

**O que será feito:**
- Na Navbar (ou página de login/home), criar um campo/seletor simples: "Usuário Logado".
- Salvar essa preferência de forma persistente (`localStorage.setItem('active_user', ...)`).
- Alterar a lógica do Interceptor/Adapter da Fase 3 para ler este valor ao enviar o header `X-User-Id`.
- Ao trocar de usuário, forçar a limpeza dos estados visuais de tela e o reload das listas de cartões.

**Como Testar:**
- Criar cards como "User A", ir na NavBar, trocar para "User B". A lista de cards deve ficar vazia. Trocar para "User A" novamente, e a lista ressurge.

---

## 🧹 Fase 5: Migração de Legado e Limpeza Técnica

**Objetivo:** Limpar a casa e, **CRITICAMENTE**, não perder dados antigos (para evitar gastos desnecessários de tokens regerando explicações via LLM).

**O que será feito:**
- **Backup:** Exportar o banco de dados atual (que está em Base64 no LocalStorage do navegador) para um arquivo físico seguro (ex: `backup_antigo.json`) como garantia primária.
- **Restore:** Criar um script (no Python ou Node/Angular) que leia o arquivo de backup e insira os registros no novo banco de dados do backend, amarrando a um `user_id` da sua escolha.
- **Importante:** Garantir que todo o histórico de repetições, tags e *explicações geradas pela IA* sejam restaurados na íntegra no novo banco, poupando chamadas caras na API do Claude/DeepSeek.
- Deletar o `SqliteAdapter`, `MigrationService` legado, e as bibliotecas antigas como `sql.js` do frontend **apenas após** o restore ser validado com sucesso.

**Como Testar:**
- Realizar o backup manual, rodar o script de restore e validar na tela se os dados antigos (com explicações IA intactas) apareceram com sucesso via API. Só então rodar um Build do Angular (`npm run build`) validando a redução de tamanho.
