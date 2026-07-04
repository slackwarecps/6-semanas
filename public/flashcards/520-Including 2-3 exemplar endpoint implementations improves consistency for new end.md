Title: Including 2-3 exemplar endpoint implementations improves consistency for new endpoints — but this context is only useful for creating new endpoints, not bug fixes or reviews.
---

Including 2-3 exemplar endpoint implementations improves consistency for new endpoints — but this context is only useful for creating new endpoints, not bug fixes or reviews. What's the most efficient configuration approach?
O que a pergunta pede: most efficient configuration → eficiente = carregar o contexto só quando necessário.

A pegadinha: Útil só para criar endpoints → carregar sob demanda , não sempre.

Raciocínio: "Eficiente" + "só um caso" = carregar sob demanda . Uma skill invocada quando se cria endpoint traz o contexto só nessa hora. A polui todo contexto (ineficiente); C é trabalho manual repetitivo; D ativa para qualquer trabalho na API (inclui bug fixes/reviews, onde o contexto é inútil). B . (D é tentadora, mas ativa amplo demais.)

---
[ ] A - Put the exemplars in CLAUDE.md (always available).
[ ] B - Create a skill referencing the exemplars with pattern instructions, invoked on-demand via slash command.
[ ] C - Copy the exemplars manually into each generation request.
[ ] D - Path-specific rules in .claude/rules/api/ that activate when working in the API directory.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
