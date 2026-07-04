Title: How does the asynchronous Message Batches API behave with respect to iterative tool use?
---

How does the asynchronous Message Batches API behave with respect to iterative tool use?
[Resposta correta: O modelo fire-and-forget quebra workflows iterativos que dependem de resultados mid-request. A é falso, pois o batch não faz execução mid-request. C exagera, pois o batch consegue definir e gerar tool calls. D condiciona à velocidade, que não é o critério.]

---
[ ] A - It fully supports iterative tool use, executing tools mid-request.
[ ] B - The fire-and-forget model prevents executing tools in the middle of the request and returning results for Claude to continue.
[ ] C - It does not support defining tool calls at all.
[ ] D - It only works with tool use if completion is fast.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
