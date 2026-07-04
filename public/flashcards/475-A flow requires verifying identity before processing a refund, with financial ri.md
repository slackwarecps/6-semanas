Title: A flow requires verifying identity before processing a refund, with financial risk if the order fails.
---

A flow requires verifying identity before processing a refund, with financial risk if the order fails. Which approach guarantees the sequence?
[Resposta correta: Quando erros têm consequências financeiras ou legais, o controle de ordem é problema de orquestração e deve usar código determinístico, não a conformidade probabilística do LLM. Prompt e few-shot não garantem a ordem, e remover a ferramenta impede o próprio reembolso, tratando disponibilidade em vez de orquestração.]

---
[ ] A - Instruct the order in the system prompt and trust the model's compliance
[ ] B - Use programmatic enforcement with deterministic code to control the orchestration
[ ] C - Remove the refund tool from the allowedTools list
[ ] D - Add few-shot examples showing the correct order

---
Tags: Domain_2::Tool_Design_MCP_Integration
