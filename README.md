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

## 💾 Persistência de Dados - SQLite

A partir da versão 2.0, a aplicação usa **SQLite** com `sql.js` para persistência de dados offline no navegador, substituindo o antigo sistema de localStorage puro.

### Como Funciona

- **Banco de Dados:** SQLite compilado para WebAssembly (sql.js) roda 100% no navegador
- **Persistência:** O banco é exportado e salvo em base64 no localStorage para sobreviver a refreshes e reboots do navegador
- **Migração Automática:** Dados existentes em localStorage antigo são migrados automaticamente na primeira execução
- **Tabelas Principais:**
  - `cards` - Cartões e seus metadados (intervalo, facilidade, repetições)
  - `card_options` - Opções de múltipla escolha para cartões
  - `attempts` - Histórico de tentativas/respostas do usuário
  - `jornadas` - Dados das fases (nome, ativa, ordem)
  - `jornada_perguntas` - Vinculação ordenada de cards à jornada
  - `jornada_progresso` - Histórico de conclusão, status (locked/unlocked/completed) e erros
  - `learn_stats` - Singleton de estatísticas globais (XP total)

### Dados Armazenados por Card

Cada cartão armazena:
- **Metadados:** ID, título, pergunta, resposta, tags, estado de aprendizagem, explicação técnica (`explanation`) e explicação simplificada (`10yearOld`).
- **Algoritmo SRS:** Intervalo (dias), fator de facilidade, número de repetições, próxima data de revisão
- **Histórico:** Todas as tentativas com timestamp, qualidade, tempo decorrido, e estado do SRS antes/depois

### Reset e Limpeza

Para resetar todos os cartões:
1. Clique em "Configurações" (engrenagem) na Navbar
2. Clique em "Resetar Cartões"
3. Um **modal de segurança customizado** listará todas as consequências da deleção. O botão **Cancelar** recebe o foco automático por segurança (pressione Enter para desistir). A limpeza só é executada se o usuário confirmar clicando em **Confirmar Reset**.

Isso remove:
- Banco SQLite (`flashcards:sqlite:db`)
- Backup antigo em localStorage (`flashcards:cards:v1`)
- Flag de migração (`flashcards:migration:completed`)

### Backup e Exportação
Para realizar o backup manual do banco de dados local do navegador:
1. Clique em "Configurações" (engrenagem) na Navbar.
2. Clique em "Backup / Restore".
3. Pressione o botão para baixar o arquivo físico do banco de dados SQLite (`.sqlite`) com o seu progresso e explicações salvas.

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
