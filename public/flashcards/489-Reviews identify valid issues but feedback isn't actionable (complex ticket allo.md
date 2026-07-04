Title: Reviews identify valid issues but feedback isn't actionable ("complex ticket allocation logic" without saying what to change).
---

Reviews identify valid issues but feedback isn't actionable ("complex ticket allocation logic" without saying what to change). Adding "always include specific fix suggestions" still produces inconsistent output. What prompting technique would most reliably produce consistently actionable feedback?
O que a pergunta pede: most reliably produce consistently actionable feedback → consistência + feedback acionável.

A pegadinha: Instruções explícitas já foram tentadas e falharam → a solução tem que ser outra técnica.

Raciocínio: O enunciado diz que instruções explícitas já falharam — isso elimina C ("mais do mesmo"). Few-shot examples mostram em vez de descrever — a forma mais confiável de fixar um formato. A não resolve o formato; B é mais complexo que o necessário. D .

---
[ ] A - Expand the context window to include more of the surrounding codebase.
[ ] B - Implement a two-pass approach: one prompt identifies issues, a second generates fixes.
[ ] C - Further refine the instructions with more explicit requirements for each part of the feedback.
[ ] D - Add 3-4 few-shot examples showing the exact format: issue identified, code location, specific fix.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
