Title: The agent achieves 55% first-contact resolution (target 80%).
---

The agent achieves 55% first-contact resolution (target 80%). It escalates straightforward cases (standard damage replacements with photo evidence) while attempting complex situations needing policy exceptions. Most effective way to improve escalation calibration?
O que a pergunta pede: most effective way to improve escalation calibration → calibrar quando escalar.

A pegadinha: O agente escala o fácil e tenta o difícil — invertido . Precisa de critérios claros + exemplos.

Raciocínio: A calibração errada vem da falta de critérios claros de quando escalar. Defini-los explicitamente com exemplos dos dois lados corrige diretamente o comportamento invertido. B usa confiança como proxy (impreciso); C é pesado (treinar modelo); D escala por emoção, não por adequação ao caso. A .

---
[ ] A - Add explicit escalation criteria to the system prompt with few-shot examples of when to escalate vs resolve.
[ ] B - Self-report a confidence score (1-10) and route below a threshold.
[ ] C - A separate classifier trained on historical tickets.
[ ] D - Sentiment analysis that escalates when frustration exceeds a threshold.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
