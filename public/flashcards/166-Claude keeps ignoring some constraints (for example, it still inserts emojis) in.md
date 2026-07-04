Title: Claude keeps ignoring some constraints (for example, it still inserts emojis) in a long prompt.
---

Claude keeps ignoring some constraints (for example, it still inserts emojis) in a long prompt. Which architecture solution?
[Resposta correta: A solução é chaining com um passo de revisão dedicado focado nas violações. A não resolve, pois o problema é atenção dividida, não tamanho de contexto. B não se aplica, pois as etapas são dependentes. D adiciona imprevisibilidade sem endereçar a violação.]

---
[ ] A - Increase the context window to fit more constraints.
[ ] B - Send the same input in several parallel requests.
[ ] C - Two-step chaining: one generates the content and another is a dedicated review that fixes the violations.
[ ] D - Switch to an agent with an open-ended goal.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
