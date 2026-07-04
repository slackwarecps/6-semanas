Title: Seu esquema inclui um campo skills: string[].
---

Seu esquema inclui um campo skills: string[]. O monitoramento em produção revela três problemas de consistência: (1) frases compostas como "Python and SQL" às vezes são mantidas como uma única entrada, às vezes divididas; (2) habilidades implícitas, mas não declaradas, ocasionalmente aparecem nas extrações; (3) documentos semelhantes produzem comprimentos de array muito diferentes (5-10 vs. 40+ entradas). Seu prompt atualmente diz "Extract all skills mentioned."

Qual é a melhoria mais eficaz?

---
[ ] A - Adicionar exemplos few-shot demonstrando o tratamento de frases compostas, critérios explícitos de menção e a granularidade adequada das entradas.
[ ] B - Adicionar restrições: "Extract 10-20 skills maximum, one skill per entry, only explicitly named skills."
[ ] C - Adicionar uma normalização pós-extração que mapeia as habilidades para uma taxonomia canônica e deduplica entradas semelhantes.
[ ] D - Enriquecer o esquema para {skill: string, confidence: float, `source_quote`: string}[] para capturar metadados da extração.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
