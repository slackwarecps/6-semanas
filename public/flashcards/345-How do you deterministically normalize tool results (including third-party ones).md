Title: How do you deterministically normalize tool results (including third-party ones) in the Agent SDK?
---

How do you deterministically normalize tool results (including third-party ones) in the Agent SDK?
[Resposta correta: Um hook PostToolUse é ponto único, determinístico e uniforme para normalizar resultados. Depender do LLM é probabilístico (A); modificar cada ferramenta é inconsistente (C); uma ferramenta extra dobra chamadas e depende de comportamento não confiável (D).]

---
[ ] A - Instruct the LLM to normalize each result in the prompt
[ ] B - Use a PostToolUse hook to intercept and transform the results before the agent's processing
[ ] C - Modify the code of each tool individually
[ ] D - Ask for an extra tool that does the normalization on each call

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
