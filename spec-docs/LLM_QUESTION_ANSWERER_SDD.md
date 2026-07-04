# SDD - LLM Question Answerer (Anthropic/LangChain)

## 1. VISÃO GERAL

### 1.1 Motivação

Os 540 cartões importados do diretório `/public/flashcards/` têm o campo `Card.question`
preenchido com um blob único de texto: **título + enunciado + 4 alternativas de múltipla
escolha** (formato `[ ] A - texto`, `[ ] B - texto`, etc). O campo `options: []` permanece
vazio — não há estrutura de alternativas com indicação de qual é correta.

Esta feature resolve a necessidade de **descobrir programaticamente qual alternativa é a
correta** para cada pergunta, usando uma LLM (Claude via Anthropic por exemplo). A saída é uma
resposta estruturada (schema Zod) com:
- Letra da opção correta (A/B/C/D)
- Texto completo da alternativa

exemplo de retorno da API
POST /simulado-server/analisa-respostas/v1
REQUEST

{
  pergunta:
}

RESPONSE:
{
  llm:anthropic
  modelo:sonnet
  tempo:1250ms
  tokens: 250k
  pergunta:{pergunta com opcoes}
  resposta:{opcao correta}
  tags:{tags da pergunta separado por virgula ex: Domain_4::Prompt_Engineering_Structured_Output,Domain_2::Tool_Design_MCP_Integration, Domain_5::Context_Management_Reliability}
}

### 1.2 Escopo

**Fase 1 (ESCOPO ATUAL):**
- Classe `AnthropicQuizSolver` que faz uma única chamada estruturada à API Anthropic
- Script Node standalone (`scripts/test-quiz-solver.ts`) para testar via terminal
- Documentação e exemplo de uso


---


---

## 5. DEPENDÊNCIAS
use venv do python e instale usando install requirements


### 5.3 O que NÃO instalar

- **`langchain` (pacote completo)** — não é necessário, só das partes (`@langchain/anthropic` + `@langchain/core`)
- **`@anthropic-ai/sdk` direto** — já vem como peer dependency de `@langchain/anthropic`

---

## 6. VARIÁVEIS DE AMBIENTE

### 6.1 `.env.example` (versionado)

```
LLM_CHOICE=ANTROPIC|DEEPSEEK
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5
```

### 6.2 `.env` (local, ignorado por git)

Usuário deve copiar `.env.example` para `.env` e preencher:
```
ANTHROPIC_API_KEY=sk-ant-...sua-chave...
ANTHROPIC_MODEL=claude-sonnet-5  # ou opus-4-8 ou haiku-4-5
```

**Cobertura no `.gitignore`:**
- Seção "Environment & Secrets" já cobre `.env`, `.env.local`, `.env.*.local`
- Nenhuma mudança necessária

---

## 7. SEGURANÇA

### 7.1 API Key Management

salve a chave no arquivo .env


