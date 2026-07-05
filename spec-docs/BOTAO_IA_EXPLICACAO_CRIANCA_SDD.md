# SDD - Botão "🤖 IA" preenche também Explicação e Explique-para-criança

## 1. VISÃO GERAL

### 1.1 Motivação

Em `/browse-cards`, cada linha do grid tem um botão **🤖 IA** que abre uma gaveta
(bottom sheet), consulta o backend FastAPI (`POST /perguntar`) e permite salvar a
resposta gerada no campo `answer` do card. A tela `/study` já tem duas caixas
expansíveis ("Mostrar explicação" / "explique para uma criança") que hoje mostram
**"Sem info"** sempre que os campos `Card.explanation`/`Card.tenYearOld` estão
vazios — o que é frequente, porque hoje só é possível preenchê-los manualmente
pelo modal de edição.

Esta feature evolui o botão IA para, na mesma chamada, também gerar e permitir
salvar `explanation` (explicação técnica) e `tenYearOld` (a mesma explicação,
simplificada como se fosse para uma criança de 10 anos) — reaproveitando o fluxo
já existente de "gerar → revisar na gaveta → confirmar para persistir".

### 1.2 Gap descoberto durante a investigação (faz parte do escopo)

Hoje `responderComIA()` (`browse-cards.page.ts`) envia **só `card.question`**
para `/perguntar` — as alternativas (`card.options`) nunca são enviadas, mesmo o
`SYSTEM_PROMPT` do backend pedindo para "copiar a linha da alternativa correta,
exatamente como aparece na pergunta". O arquivo de exemplo
`backend/postman/chamada1.http` confirma que o endpoint foi desenhado para
receber a pergunta **com as alternativas embutidas**, no formato
`[ ] LETRA - texto` (ele manda o markdown inteiro do card 001: título + pergunta
+ alternativas + tags). Ou seja, o LLM responde parcialmente "às cegas" hoje.

**Decisão de produto:** o LLM deve receber a pergunta **junto com as
alternativas** formatadas, e decidir sozinho qual é a correta e gerar as duas
explicações — sem depender do gabarito (`option.isCorrect`) que a app já tem
internamente (que vem do `flashcards-metadata.json` na importação). Ou seja, o
LLM responde de forma independente/auditável, não apenas "explica o gabarito
existente".

### 1.3 Escopo

- Backend (`backend/main.py`): saída estruturada do LLM com 3 campos
  (`resposta`, `explicacao`, `explicacaoCrianca`) em vez de só texto livre.
- Frontend (`browse-cards.page.ts`/`.html`): enviar pergunta + alternativas
  formatadas; exibir e persistir os 2 campos novos junto com a resposta.
- Fora de escopo: tela `/testa-resposta` (não será alterada), gabarito
  (`option.isCorrect`) e pipeline de importação de markdown/metadata.

---

## 2. CONTRATO DA API — ANTES x DEPOIS

### Request (`POST /perguntar`)

**Antes:**
```json
{ "pergunta": "texto da pergunta (sem alternativas)", "provedor": "claude" }
```

**Depois** (mesmo shape, só muda o que o Angular monta em `pergunta`):
```json
{
  "pergunta": "texto da pergunta\n\n[ ] A - texto\n[ ] B - texto\n[ ] C - texto\n[ ] D - texto",
  "provedor": "claude"
}
```
`PerguntaRequest` (Pydantic) não muda de shape — só o conteúdo do campo
`pergunta` passa a incluir as alternativas.

### Response (200)

**Antes:**
```json
{ "resposta": "[ ] D - texto da alternativa", "provedor": "claude", "modelo": "claude-opus-4-8" }
```

**Depois:**
```json
{
  "resposta": "[ ] D - texto da alternativa",
  "explicacao": "Explicação técnica de por que D está correta e as demais não.",
  "explicacaoCrianca": "Versão simples da mesma explicação, para uma criança de 10 anos.",
  "provedor": "claude",
  "modelo": "claude-opus-4-8"
}
```

---

## 3. BACKEND — `backend/main.py`

Único arquivo do backend (não há `routers/`/`services/` separados).

### 3.1 Novo modelo de saída estruturada do LLM

Usado só internamente na chamada (não é o response HTTP diretamente):
```python
class RespostaEstruturada(BaseModel):
    resposta: str = Field(
        description="A linha completa da alternativa correta, copiada exatamente "
        "como aparece na pergunta, incluindo '[ ]', a letra e o hífen."
    )
    explicacao: str = Field(
        description="Explicação técnica/conceitual de por que essa é a alternativa "
        "correta e por que as outras estão erradas."
    )
    explicacaoCrianca: str = Field(
        description="A mesma explicação, reescrita de forma simples, como se "
        "estivesse explicando para uma criança de 10 anos."
    )
```

### 3.2 `RespostaResponse` (contrato HTTP de saída)

```python
class RespostaResponse(BaseModel):
    resposta: str
    explicacao: str
    explicacaoCrianca: str
    provedor: str
    modelo: str
```

### 3.3 Chamada ao LLM com saída estruturada

Trocar o `llm.ainvoke([...])` cru (que hoje devolve só `AIMessage.content`, uma
string) por `llm.with_structured_output(RespostaEstruturada)` — capacidade
nativa do LangChain, suportada tanto por `ChatAnthropic` quanto por
`ChatDeepSeek`, sem precisar de parsing manual de JSON:

```python
structured_llm = llm.with_structured_output(RespostaEstruturada)
resultado = await structured_llm.ainvoke([
    ("system", SYSTEM_PROMPT),
    ("human", request.pergunta),
])

return RespostaResponse(
    resposta=resultado.resposta,
    explicacao=resultado.explicacao,
    explicacaoCrianca=resultado.explicacaoCrianca,
    provedor=request.provedor,
    modelo=modelo,
)
```

### 3.4 Reescrever `SYSTEM_PROMPT`

O prompt atual **proíbe explicitamente** qualquer explicação:
> "Não inclua explicação, justificativa, markdown ou qualquer texto adicional
> além dessa linha."

Precisa virar algo como:
> "A pergunta a seguir é de múltipla escolha, com alternativas no formato
> '[ ] LETRA - texto'. Identifique a alternativa correta e devolva três coisas:
> (1) a linha completa da alternativa correta, exatamente como aparece,
> incluindo '[ ]', a letra e o hífen; (2) uma explicação técnica do motivo pelo
> qual ela está correta e as demais erradas; (3) a mesma explicação, simplificada
> como se fosse para uma criança de 10 anos."

As `Field(description=...)` do Pydantic reforçam o formato esperado de cada
campo individualmente.

### 3.5 Logging

Manter o padrão atual (a `resposta` já é truncada em 200 chars no log) e
adicionar logs equivalentes para `explicacao`/`explicacaoCrianca` (tamanho, e um
trecho truncado), no mesmo `logger.info(...)` de `LLM RESPONSE`.

### 3.6 Atualizar `backend/postman/chamada1.http`

Ajustar o comentário/exemplo para refletir o novo response esperado (3 campos),
já que esse arquivo documenta o contrato manualmente para testes via REST
Client.

### 3.7 Risco a observar

`with_structured_output` no `ChatDeepSeek` (`langchain-deepseek==1.1.0`) é
baseado em tool-calling — vale testar manualmente com `"provedor": "deepseek"`
além do `"claude"` (default) antes de considerar pronto, já que não há
precedente de structured output nesse backend hoje (só existe este endpoint).

---

## 4. FRONTEND

### 4.1 `src/app/features/testa-resposta/data/services/pergunta-llm.service.ts`

Estender `PerguntaResponse` (compartilhada com `browse-cards`):
```ts
export interface PerguntaResponse {
  resposta: string;
  explicacao: string;
  explicacaoCrianca: string;
  provedor: string;
  modelo: string;
}
```

### 4.2 `src/app/features/browse-cards/presentation/pages/browse-cards.page.ts`

- **Novo helper privado** `formatQuestionWithOptions(card: Card): string` —
  monta a pergunta + alternativas no formato `[ ] LETRA - texto` (mesmo formato
  usado nos arquivos markdown fonte e no exemplo do Postman), ordenando por
  `option.order`. Reutiliza `card.question` e `card.options` (já existentes no
  domínio: `MultipleChoiceOption.id`/`.text`/`.order`).
- **`responderComIA(card, event)`**: trocar `pergunta: card.question` por
  `pergunta: this.formatQuestionWithOptions(card)`. Adicionar dois novos campos
  de estado do componente (mesmo padrão de `bottomSheetAnswer`):
  `bottomSheetExplicacao = ''` e `bottomSheetExplicacaoCrianca = ''`, resetados
  no início da função e preenchidos com `result.explicacao` /
  `result.explicacaoCrianca` junto com `bottomSheetAnswer = result.resposta`.
- **`confirmarAtualizacaoCard()`**: hoje preserva `explanation`/`tenYearOld` do
  card original (`this.bottomSheetCard.explanation`/`.tenYearOld`) — trocar
  para usar os novos campos gerados: `explanation: this.bottomSheetExplicacao
  || undefined` e `tenYearOld: this.bottomSheetExplicacaoCrianca || undefined`
  (mesmo padrão `|| undefined` já usado em `study.page.ts`/`browse-cards.page.ts`
  para os outros formulários de edição).
- **`cancelarBottomSheet()`**: resetar também os dois novos campos, junto com
  `bottomSheetAnswer`.

### 4.3 `src/app/features/browse-cards/presentation/pages/browse-cards.page.html`

No bloco `*ngIf="!isGeneratingAnswer && !bottomSheetError && bottomSheetAnswer"`,
adicionar dois `preview-group` extras, reaproveitando as classes existentes
(`.preview-group`, `.preview-label`, `.preview-box`):
```html
<div class="preview-group">
  <span class="preview-label">Explicação</span>
  <div class="preview-box explanation-box">{{ bottomSheetExplicacao }}</div>
</div>
<div class="preview-group">
  <span class="preview-label">Explique como para uma criança</span>
  <div class="preview-box child-box">{{ bottomSheetExplicacaoCrianca }}</div>
</div>
```

### 4.4 `src/app/features/browse-cards/presentation/pages/browse-cards.page.scss`

Adicionar `.explanation-box`/`.child-box` (pequena variação visual de
`.answer-box`) para diferenciar as 4 caixas na gaveta.

---

## 5. FORA DE ESCOPO

- **`testa-resposta.page.ts`/`.html`** (página de teste manual do endpoint) não
  será alterada — continua funcionando (ignora os campos novos), mas não os
  exibe. Pode ser um follow-up separado.
- Gabarito (`option.isCorrect`) já existente e pipeline de importação de
  markdown/metadata — nenhum dos dois é alterado por esta feature.

---

## 6. ARQUIVOS A CRIAR/MODIFICAR (checklist de implementação)

**Criar:**
- [x] `spec-docs/BOTAO_IA_EXPLICACAO_CRIANCA_SDD.md` (este documento)

**Modificar:**
- [ ] `backend/main.py` — `RespostaEstruturada`, `RespostaResponse`,
      `with_structured_output`, `SYSTEM_PROMPT`, logging
- [ ] `backend/postman/chamada1.http` — exemplo de response atualizado
- [ ] `src/app/features/testa-resposta/data/services/pergunta-llm.service.ts`
      — `PerguntaResponse` com os 2 campos novos
- [ ] `src/app/features/browse-cards/presentation/pages/browse-cards.page.ts`
      — `formatQuestionWithOptions`, estado da gaveta, `confirmarAtualizacaoCard`,
      `cancelarBottomSheet`
- [ ] `src/app/features/browse-cards/presentation/pages/browse-cards.page.html`
      — 2 `preview-group` novos na gaveta
- [ ] `src/app/features/browse-cards/presentation/pages/browse-cards.page.scss`
      — estilos `.explanation-box`/`.child-box`

---

## 7. VERIFICAÇÃO

1. **Backend isolado**: subir
   `cd backend && source venv/bin/activate && uvicorn main:app --reload`,
   chamar `POST /perguntar` (via `chamada1.http` atualizado ou curl) com uma
   pergunta + alternativas reais, conferir que a resposta JSON tem `resposta`
   (ainda no formato `[ ] LETRA - texto`, sem regressão), `explicacao` e
   `explicacaoCrianca` preenchidos e coerentes. Testar com
   `"provedor": "claude"` (default) e, se possível, `"deepseek"`.
2. **Frontend end-to-end**: `npm start`, abrir `/browse-cards`, clicar em
   "🤖 IA" numa pergunta sem `explanation`/`tenYearOld`, conferir as 4 caixas na
   gaveta (Pergunta, Explicação, Explique-p/-criança, Resposta), clicar
   "💾 Atualizar Card".
3. **Confirmar persistência**: reabrir o modal de edição do mesmo card (ou ir
   em `/study` navegar até ele) e verificar que os cards flip "Mostrar
   explicação"/"explique para uma criança" (já existentes) agora mostram o
   conteúdo real em vez de "Sem info".
4. Rodar `npx tsc --noEmit -p tsconfig.app.json`,
   `npx ng build --configuration development` e `npx ng test --watch=false`
   (suite atual: 12 testes) para garantir que nada quebrou.
