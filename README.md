# 📚 Flashcards App - Sistema de Repetição Espaçada

Este é um aplicativo de Flashcards em Angular 19+ projetado sob os princípios de **Clean Architecture** e **DDD (Domain-Driven Design)**, focado no aprendizado e retenção a longo prazo de conceitos de engenharia de software e arquitetura de agentes.

---

## 🏗️ Arquitetura do Sistema

A aplicação é dividida em quatro camadas bem delimitadas, garantindo o desacoplamento de infraestrutura e dependências externas:

```
┌─────────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Angular)              │
│  Pages, Components, Pipes, Templates, Routing       │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│          APPLICATION LAYER (Use Cases)              │
│  Workflows, Use Cases, DTOs                         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│          DOMAIN LAYER (Business Logic)              │
│  Entities, Value Objects, Aggregates, Interfaces    │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│           DATA LAYER (Persistence)                  │
│  Repositories, Mappers, LocalStorage, JSON Static   │
└─────────────────────────────────────────────────────┘
```

1. **Domain (Domínio):** Contém a lógica de negócios pura, os Value Objects (`CardId`, `Interval`, `EaseFactor`, `Quality`, `Tag`), a entidade agregada `Card` e a entidade `Attempt`. Inverte a dependência por meio de interfaces como `ICardRepository` e `ISRSCalculator`.
2. **Application (Aplicação):** Contém os fluxos de trabalho (Use Cases) como `LoadFlashcardsUseCase`, `GetNextCardUseCase` e `RecordCardAttemptUseCase`.
3. **Data (Dados):** Implementa o repositório (`CardRepository`) realizando o mapeamento de entidades de domínio para o formato de persistência.
4. **Presentation (Apresentação):** Componentes standalone do Angular e páginas (`DashboardPage`, `StudyPage`) focados exclusivamente na interface de usuário e experiência do usuário (UX).

---

## ⚡ Algoritmo SRS (Algoritmo SM-2)

O aplicativo utiliza a fórmula **SuperMemo-2 (SM-2)** para calcular dinamicamente os intervalos ideais de revisão dos cartões com base na autoavaliação da facilidade de resposta:

- **Quality Score (Qualidades de Resposta):**
  - **1 (Again):** Erro completo ou esquecimento. Redefine o intervalo para 1 dia e zera as repetições corretas.
  - **2 (Hard):** Resposta correta, mas com grande esforço ou hesitação. Intervalo reiniciado para 1 dia, mas com ajuste de fator de facilidade.
  - **3 (Good):** Resposta correta com esforço esperado.
  - **4 (Easy):** Resposta correta de forma imediata e sem esforço.
  
- **Cálculo de Intervalo ($I$):**
  - Primeira repetição: 1 dia.
  - Segunda repetição: 3 dias.
  - Repetições subsequentes ($n > 2$): $I_{novo} = \lceil I_{anterior} \times EaseFactor \rceil$.

- **Ajuste de Ease Factor ($EF$):**
  - $EF_{novo} = EF_{anterior} + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$, onde $q$ é a qualidade (1 a 4).
  - O $EF$ é limitado entre o mínimo de `1.3` e o máximo de `5.0`.

---

## 🔐 Tela de Login e Sessão

A aplicação agora possui uma tela de login simples para controle de acesso inicial e proteção de rotas.
- **Rota Padrão:** O acesso à raiz (`/`) redireciona automaticamente para a tela de login.
- **Credenciais Padrão:** O sistema aceita o login com o usuário `admin` e a senha `Facil123`.
- **Fluxo:** Após a autenticação bem-sucedida, o usuário é redirecionado para a tela principal (`/dashboard`).
- **Proteção de Rotas:** O acesso à rota `/dashboard` está protegido pelo `authGuard`. Apenas usuários com sessão ativa (`localStorage`) podem acessá-lo.

---

## 📂 Estrutura do Diretório

```
src/app/
├── core/                               # Módulos singulares globais (guards, config)
├── shared/                             # Componentes e utilitários compartilhados
│   ├── components/                     # CardDisplay, SRSButtons, TagFilter
│   └── pipes/                          # MarkdownPipe para compilação HTML
├── features/                           # Funcionalidades de negócio estruturadas
│   ├── dashboard/                      # DashboardPage e Use Cases de estatísticas
│   │   ├── application/                # Use Cases & DTOs
│   │   └── presentation/               # Dashboard UI
│   ├── flashcard/                      # Bounded Context de cartões e progresso
│   │   ├── domain/                     # Entities, Value Objects, Factory
│   │   └── data/                       # Repositório de dados e fontes
│   ├── jornada/                        # Bounded Context de fases gamificadas (Duolingo style)
│   │   ├── domain/                     # Entidades e Value Objects (Jornada, Progresso, Stats)
│   │   ├── data/                       # Repositórios (Sqlite wrapper)
│   │   └── application/                # Casos de uso de negócios (Complete, Map, Save)
│   └── study/                          # Fluxo e página de sessões de estudo
└── infrastructure/                     # Tecnologias e bibliotecas de suporte
    ├── markdown-parser/                # Parser de Markdown baseado em marked
    ├── srs-algorithm/                  # Implementação matemática da SM-2
    └── storage/                        # Adaptador para SQLite/localStorage do navegador
```

---

## 💾 Persistência de Dados - Backend (FastAPI + SQLite)

A partir da versão 3.0 (migração concluída — ver `spec-docs/migration_backend_plan.md`),
**toda a persistência vive no backend** (`backend/`, FastAPI + SQLModel + SQLite), com
suporte multi-usuário. O banco local sql.js/WASM foi removido do frontend.

### Como Funciona

- **Banco de Dados:** arquivo `backend/database.sqlite`, criado automaticamente no startup do FastAPI
- **Multi-usuário:** toda requisição de dados leva o header `X-User-Id`, injetado pelo
  interceptor `src/app/infrastructure/http/user-id.interceptor.ts`. O usuário ativo é
  exibido na Navbar e persiste em `localStorage['active_user']` (`ActiveUserService`). A troca dinâmica de usuários pela interface foi desativada.
- **Adapters HTTP** (`src/app/infrastructure/storage/`):
  - `http-api.adapter.ts` — cards (implementa a `StorageInterface`)
  - `http-jornada.adapter.ts` — jornadas, progresso e XP
  - `http-config.adapter.ts` — configurações por usuário
  - `http-user-data.service.ts` — reset total dos dados do usuário
- **⚠️ O frontend exige o backend rodando em `http://127.0.0.1:8000`**
  (`uvicorn main:app` na pasta `backend/` — instruções em `backend/README.md`)
- **Restore de backups legados:** `backend/restore_backup.py` importa um `.sqlite`
  exportado pela tela Backup/Restore para o banco do backend
  (`python restore_backup.py backup.sqlite --user fabao`)
- **Limpeza de ruído de tags:** `backend/clean_tags_noise.py` limpa o prefixo `"Tags:"` indesejado importado na coluna `tags` dos cards no SQLite (`python clean_tags_noise.py`)
- **Tabelas Principais:**
  - `cards` - Cartões e seus metadados (intervalo, facilidade, repetições)
  - `card_options` - Opções de múltipla escolha para cartões
  - `attempts` - Histórico de tentativas/respostas do usuário
  - `jornadas` - Dados das fases (nome, ativa, ordem)
  - `jornada_perguntas` - Vinculação ordenada de cards à jornada
  - `jornada_progresso` - Histórico de conclusão, status (locked/unlocked/completed) e erros
  - `learn_stats` - Estatísticas por usuário (XP total)
  - `app_config` - Configurações por usuário (ex.: modelo LLM padrão)

### Dados Armazenados por Card

Cada cartão armazena:
- **Metadados:** ID, título, pergunta, resposta, tags, estado de aprendizagem, explicação técnica (`explanation`) e explicação simplificada (`10yearOld`).
- **Algoritmo SRS:** Intervalo (dias), fator de facilidade, número de repetições, próxima data de revisão
- **Histórico:** Todas as tentativas com timestamp, qualidade, tempo decorrido, e estado do SRS antes/depois

### Reset e Limpeza

A opção de resetar cartões via interface gráfica (botão Configurações) foi desativada. Para limpar os dados, recrie o arquivo de banco de dados `backend/database.sqlite` diretamente no servidor.
Isso removerá **todos os dados** de todos os usuários (cards, jornadas, progresso e XP).

### Backup e Exportação
Para fazer o backup dos dados atuais, basta copiar fisicamente o arquivo de banco de dados ativo do backend: `backend/database.sqlite`.

---

## 📚 Gerenciamento Avançado de Cartões

A rota `/browse-cards` atua como painel de gerenciamento, contando com as seguintes capacidades:

- **Busca por Pergunta e Tag (cumulativa):** Filtro de texto case-insensitive instantâneo aplicado sobre o campo Pergunta e/ou sobre as Tags associadas ao card.
- **Coluna de Identificador (ID):** Exibição explícita do ID exclusivo do banco de dados na extrema esquerda de cada card.
- **Exibição de Tags e Estatísticas (SRS):** Cada card possui três linhas: a primeira exibe os dados textuais/ações, a segunda exibe as tags associadas e a terceira exibe estatísticas do algoritmo de repetição espaçada (estado de aprendizado, repetições, intervalo, fator de facilidade, próxima revisão e histórico de tentativas).
- **Paginação Dinâmica:** Controle de quantidade de registros por página ajustável através de combobox (3, 10, 50 ou 100 itens).

---

## 🏷️ Nuvem de Tags

A rota `/tag-cloud` oferece uma visualização analítica das palavras-chave mais utilizadas nos flashcards:

- **Matriz de Frequência:** Analisa todas as tags cadastradas no banco de dados e calcula o peso proporcional de cada uma.
- **Renderização Dinâmica:** Exibe as palavras com tamanho de fonte calculado dinamicamente de acordo com sua popularidade (entre 0.85rem e 2.5rem).
- **Esquema de Cores Dinâmico:** Cada tag recebe uma cor HSL randômica harmoniosa com efeitos dinâmicos no hover.

---

## 🃏 Exportar Perguntas para Anki (.colpkg)

O comando `/exporta-sqlite-para-anki` (Claude Code skill em
`.claude/skills/exporta-sqlite-para-anki/`) gera um pacote `.colpkg` importável
diretamente no [Anki](https://apps.ankiweb.net/) a partir das perguntas em
`public/flashcards/*.md`, sem precisar abrir o app.

### Como usar

Dentro do Claude Code, na raiz do projeto:

```
/exporta-sqlite-para-anki --quantidade 10
/exporta-sqlite-para-anki --ids 001,005,010
/exporta-sqlite-para-anki --intervalo 001-020
/exporta-sqlite-para-anki --todas
/exporta-sqlite-para-anki --quantidade 5 --output public/anki/lote1.colpkg
```

Ou rodando o script Node diretamente:

```bash
node .claude/skills/exporta-sqlite-para-anki/export.js --quantidade 10
```

| Parâmetro | Descrição |
|---|---|
| `--quantidade N` | Exporta as N primeiras perguntas (ordem de `public/flashcards/index.json`) |
| `--ids 001,010,050` | Exporta só as perguntas com esses IDs (prefixo numérico do arquivo) |
| `--intervalo 001-020` | Exporta o intervalo de IDs, inclusive |
| `--todas` | Exporta todas as perguntas do banco |
| `--output caminho` | Caminho de saída (padrão: `public/anki/anki-exported.colpkg`) |

Use exatamente um entre `--quantidade`, `--ids`, `--intervalo` ou `--todas`.

### O que vira o quê no card do Anki

- **Front:** `<b>Título</b><br><br>Pergunta`
- **Back:** `Alternativa correta: X - texto` + explicação (de `public/flashcards-metadata.json`, quando existir)
- **Tags:** as tags do card, separadas por espaço (formato nativo do Anki, sem vírgula)

O pacote gerado usa o schema legado do Anki (`collection.anki2`, `ver=11`) — o
mesmo formato produzido pela biblioteca `genanki` — e já foi validado
ponta a ponta com a biblioteca oficial `anki` (Python) via `import_anki_package`.
Detalhes de implementação e armadilhas já corrigidas (separador `0x1F` entre
campos, `col.tags` como `{}`, `id` do note type como string, etc.) estão
documentados em `.claude/skills/exporta-sqlite-para-anki/SKILL.md`.

> Se o Anki pedir para "atualizar para o v3 scheduler" ao importar, é um aviso
> normal da coleção do usuário — não tem relação com o arquivo gerado.

---

## 📋 Auditoria de Flashcards

O comando `/auditoria-flashcards` (Claude Code skill em `.claude/skills/auditoria-flashcards/`) realiza a varredura completa dos arquivos Markdown em `public/flashcards/*.md` e cruza os dados contra o banco SQLite do backend (`backend/database.sqlite`), verificando contagens, tags, cartões sem alternativas de múltipla escolha e identificando cartões órfãos.

---

## ⚙️ Preparação de Questões em Lote (Fase 1)

A rota `/prepara-questoes-fase1` permite processar e classificar cartões em lote utilizando inteligência artificial:
- **Modo Preencher card**: Traduz a questão, define a resposta correta e gera explicações didáticas (para adultos tech leads e versão simplificada para crianças de 10 anos).
- **Modo Atualizar tags de cenário**: Classifica semanticamente cada cartão dentro de um dos 6 cenários do exame e mapeia seus respectivos domínios (Domain 1 a 5).
- **Tratamento de Domínios Ausentes**: Se a pergunta não for classificada em nenhum dos domínios oficiais, ela recebe a tag `ForaDosDominios`.

---

## 🎮 Jornadas de Aprendizado (Modo Fases)

A partir da versão 2.2, o aplicativo inclui uma trilha de aprendizagem gamificada no estilo **Duolingo** na rota `/learn`:

- **Jornadas Curadas:** Conjuntos de cartões organizados sequencialmente através da interface administrativa `/admin/jornada`.
- **Sistema de Vidas:** O aluno inicia cada jornada com **3 vidas**. Cada erro consome uma vida. Errar 3 vezes interrompe a jornada imediatamente (reprovação), exigindo reinício do zero na mesma ordem.
- **Aprovação e Desbloqueio:** Concluir a jornada com no máximo 2 erros marca a fase como finalizada e desbloqueia a próxima jornada ativa na ordem.
- **Distribuição de XP:**
  - `+10 XP` por acerto durante a tentativa.
  - `+50 XP` de bônus na primeira conclusão bem-sucedida.
  - O XP só é computado de forma definitiva ao vencer a fase (tentativas que falham não geram XP).
- **Independência do SRS:** O progresso do modo jornadas é independente do modo de repetição espaçada (SM-2) do modo Estudar.
- **Cópia de Perguntas:** Permite copiar o texto da pergunta em andamento diretamente para a área de transferência, exibindo um toast temporário de confirmação.
- **Navegação entre Perguntas:** Adiciona botões de controle integrados à barra inferior (primeira, anterior, próxima e última pergunta) para navegar de forma direta pelas questões da jornada.

---

## 🤖 Responder com IA (Integração com LLM)

A partir da versão 2.1, os usuários podem obter auxílio de inteligência artificial diretamente no gerenciador de cartões (`/browse-cards`):

- **Fluxo:** Ao lado do botão de deleção de cada cartão, existe a opção **🤖 IA**.
- **Bottom Sheet:** Ao clicar, o sistema abre uma gaveta inferior (Bottom Sheet) que consulta o backend para formular a resposta correta da pergunta.
- **Atualização Automatizada:** O usuário pode clicar em **Atualizar Card** para salvar a resposta retornada diretamente na propriedade `answer` do cartão no banco SQLite local.
- **Tratamento de Erros:** Caso o backend (FastAPI) apresente falha de conexão ou erro HTTP (ex. 422, 500), a mensagem é apresentada no Bottom Sheet juntamente com o botão de fechamento.

---

## 🚀 Como Executar

O projeto tem duas partes que rodam separadamente:

- **Frontend** (Angular): a aplicação em si — funciona sozinha, offline, para estudar os cards com SRS.
- **Backend** (FastAPI): opcional, só é necessário para o botão **🤖 IA** no gerenciador de cards (`/browse-cards`). Sem ele no ar, o app funciona normalmente, apenas o assist de IA fica indisponível.

### Pré-requisitos
- Node.js (v18+) e Angular CLI (instalado via npm)
- Python 3.10+ (apenas se for usar o backend de IA)

### 1. Backend (opcional — assist de IA)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# edite o .env e preencha ANTHROPIC_API_KEY e/ou DEEPSEEK_API_KEY

uvicorn main:app --reload
```

O servidor sobe em `http://127.0.0.1:8000` (Swagger em `http://127.0.0.1:8000/docs`). Esse endereço já é o default configurado em `src/environments/environment.ts` (`backendBaseUrl`), então não precisa mudar nada no frontend. Mais detalhes em [`backend/README.md`](./backend/README.md).

### 2. Frontend

```bash
npm install
npm start
```
Após inicializado, acesse `http://localhost:4200/`.

> O `.env.example` na raiz do projeto é usado apenas pelo script opcional `npm run test:quiz-solver` (chamada direta ao Claude via LangChain, fora da aplicação Angular) — não é necessário para rodar o app normalmente.

### 3. Backend com Docker & Deploy para VPS

O backend pode ser executado em containers Docker e publicado de forma automatizada na VPS:

- **Executar via Docker Compose:**
  ```bash
  docker compose up -d --build
  ```
  O servidor backend iniciará mapeando a porta externa `8001` para a interna `8000`. No ambiente VPS, ele utiliza a rede externa `coolify` e as labels do Traefik para responder sob o domínio `six-week-project.fabao.eng.br` via HTTPS.

- **Deploy Automático para VPS (via SCP):**
  Existe um script de deploy (`deploy_to_vps.sh`) que compacta o projeto local, envia para a VPS `bikinibottonsvr` na pasta `~/apps/bkp6week`, extrai o conteúdo e reinicia os containers executando o build:
  ```bash
  ./deploy_to_vps.sh
  ```


---

## 🧪 Rodando os Testes Unitários

Para garantir que a lógica matemática do SRS e as transições de estado do domínio estejam corretas, execute os testes unitários integrados via **Vitest**:

```bash
npm test
```

Para rodar uma única execução não-interativa (Single Run) nos testes:
```bash
npx ng test --watch=false
```

## 🧪 Rodando os Testes End-to-End (E2E)

Para validar a integridade dos fluxos completos de negócio da interface com o banco de dados (como o CRUD de Jornadas no Painel Admin), execute os testes end-to-end com o **Playwright**:

```bash
# Certifique-se de que o backend (port 8000) e o frontend (port 4200) estão rodando
npm run test:e2e
```

## REGRAS DO EXAME

Aqui estão os 6 cenários possíveis descritos no guia (o exame apresenta 4 deles, sorteados aleatoriamente):

1. Customer Support Resolution Agent — agente de suporte ao cliente com Claude Agent SDK e ferramentas MCP (get_customer, lookup_order, process_refund, escalate_to_human).
2. Code Generation with Claude Code — uso do Claude Code no fluxo de desenvolvimento, com slash commands, CLAUDE.md e plan mode vs execução direta.
3. Multi-Agent Research System — sistema de pesquisa com coordenador delegando a subagentes (busca web, análise de documentos, síntese, geração de relatórios).
4. Developer Productivity with Claude — ferramentas de produtividade com Agent SDK, usando tools built-in (Read, Write, Bash, Grep, Glob) e servidores MCP.
5. Claude Code for Continuous Integration — integração do Claude Code em pipelines CI/CD para code review, geração de testes e feedback em PRs.
6. Structured Data Extraction — extração de dados estruturados de documentos com validação via JSON schemas.


## DOMINIOS DO EXAME
Aqui estão os 5 domínios de conteúdo do exame, com seus pesos:

1. Agentic Architecture & Orchestration — 27% do conteúdo pontuado
2. Tool Design & MCP Integration — 18%
3. Claude Code Configuration & Workflows — 20%
4. Prompt Engineering & Structured Output — 20%
5. Context Management & Reliability — 15%

---

## 🤖 IA Context Files
O repositório possui arquivos de contexto específicos para o assistente de IA:
- **`CLAUDE.md`**: Diretrizes, padrões e comandos executivos para o *Claude Code*.
- **`GEMINI.md`**: Diretrizes, padrões, persona (*walle*) e comandos operacionais para o *Gemini (Antigravity)*.

