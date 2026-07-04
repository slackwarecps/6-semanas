Title: What is the mechanism by which the prefill with "```json" combined with the stop sequence "```" results in JSON without comments?
---

What is the mechanism by which the prefill with "```json" combined with the stop sequence "```" results in JSON without comments?
[Resposta correta: O prefill coloca Claude no meio de um bloco de código, então ele só continua com o conteúdo, e a stop sequence corta a geração no fechamento. A stop sequence não apaga texto posterior (A), o prefill não faz validação de schema (C) e a user message isolada não garante ausência de explicação (D).]

---
[ ] A - The stop sequence deletes the generated markdown after the response ends.
[ ] B - The prefilled assistant message makes Claude continue from inside a block that has already started, generating only the JSON, and the stop sequence ends the generation when it tries to close the block.
[ ] C - The prefill instructs the model to validate the JSON schema before responding.
[ ] D - The user message alone is enough to prevent any explanation.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
