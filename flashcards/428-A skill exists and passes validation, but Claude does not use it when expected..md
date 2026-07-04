Title: A skill exists and passes validation, but Claude does not use it when expected.
---

A skill exists and passes validation, but Claude does not use it when expected. What is the most likely cause and fix?
[Resposta correta: Se a skill valida mas não é usada, a causa quase sempre é a description, corrigida com frases de gatilho alinhadas aos pedidos reais. A lógica interna passou na validação (A), o tamanho do modelo não é o gargalo (B) e o effort não controla seleção de skill (D).]

---
[ ] A - The skill is poorly implemented; rewrite its logic.
[ ] B - The model is too small; swap it for a larger one.
[ ] C - The cause is almost always the description; fix it by adding trigger phrases that match how you phrase your requests, since the matching is semantic.
[ ] D - The effort is low; increase it to max.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
