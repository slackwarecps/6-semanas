Title: Single-concern requests: 94% accuracy.
---

Single-concern requests: 94% accuracy. Multi-concern messages ("refund order #1234 and update shipping for #5678"): tool selection drops to 58% — the agent addresses one concern or mixes parameters. Most effective approach to improve reliability for multi-concern requests?
O que a pergunta pede: most effective approach to improve reliability for multi-concern requests → confiabilidade em pedidos com múltiplas demandas .

A pegadinha: O agente se confunde quando várias demandas vêm juntas → decompor em pedidos individuais.

Raciocínio: A raiz é a sobrecarga de processar várias demandas de uma vez. Decompor explicitamente em pedidos individuais antes de processar é o mais confiável e escalável. C (few-shot) ajuda mas é menos robusto que a decomposição estrutural; B reduz a clareza; D só remedia depois do erro. A . (C é defensável em provas que priorizam few-shot, mas a decomposição é estruturalmente mais forte.)

---
[ ] A - A preprocessing layer that decomposes multi-concern messages into individual requests, processes each, then combines results.
[ ] B - Consolidate related tools into fewer, general-purpose tools.
[ ] C - Add few-shot examples demonstrating reasoning and tool sequence for multi-concern requests.
[ ] D - Response validation that detects incomplete responses and re-prompts.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
