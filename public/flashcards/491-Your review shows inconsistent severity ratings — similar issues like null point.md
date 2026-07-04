Title: Your review shows inconsistent severity ratings — similar issues like null pointer risks get "critical" in some PRs but "medium" in others.
---

Your review shows inconsistent severity ratings — similar issues like null pointer risks get "critical" in some PRs but "medium" in others. What's the most effective way to improve severity consistency?
O que a pergunta pede: most effective way to improve severity consistency → consistência nas notas de gravidade.

A pegadinha: O mesmo problema recebe notas diferentes → falta uma âncora estável.

Raciocínio: A inconsistência vem da falta de âncoras objetivas. Critérios explícitos com exemplos de código por nível dão referência estável entre PRs. B torna tudo relativo (o mesmo bug muda de nota conforme o PR — piora a consistência). C é uma lista estática que perde nuance. D exige trabalho manual. A .

---
[ ] A - Include explicit severity criteria in your prompt with concrete code examples for each level.
[ ] B - Ask Claude to rate severity relative to other issues in the same PR.
[ ] C - Add a CLAUDE.md listing issue types and default severities to reference.
[ ] D - Request Claude include its reasoning for each severity, then calibrate manually.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
