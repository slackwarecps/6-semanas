Title: The web search subagent times out.
---

The web search subagent times out. Which error propagation approach best enables intelligent recovery?
O que a pergunta pede: best enables intelligent recovery → melhor recuperação inteligente.

A pegadinha: Recuperação inteligente exige contexto estruturado e rico , não um status genérico.

Raciocínio: Recuperação inteligente precisa de informação suficiente para o coordenador decidir (retry? fonte alternativa? seguir sem?). B esconde o contexto num status genérico; C mascara falha como sucesso (perigoso); D mata o fluxo inteiro. A .

---
[ ] A - Return structured error context to the coordinator: failure type, attempted query, partial results, and alternative approaches.
[ ] B - Retry with exponential backoff internally, returning a generic "search unavailable" only after all retries.
[ ] C - Catch the timeout and return an empty result set marked as successful.
[ ] D - Propagate the exception to a top-level handler that terminates the whole workflow.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
