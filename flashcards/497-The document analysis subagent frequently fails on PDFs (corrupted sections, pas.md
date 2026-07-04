Title: The document analysis subagent frequently fails on PDFs (corrupted sections, password-protected, library timeouts).
---

The document analysis subagent frequently fails on PDFs (corrupted sections, password-protected, library timeouts). Currently any exception terminates the subagent and returns an error to the coordinator, causing excessive coordinator involvement in routine error handling. What's the most effective architectural improvement?
O que a pergunta pede: most effective architectural improvement → melhoria de arquitetura.

A pegadinha: O coordenador é sobrecarregado com erros rotineiros → o subagente deveria tratar localmente o que consegue.

Raciocínio: A causa é o coordenador envolvido em erros rotineiros. Dar ao subagente autonomia para resolver o transitório localmente, propagando só o irresolúvel (com contexto) reduz a sobrecarga mantendo a visibilidade. B mascara falhas como sucesso (perigoso). C joga o trabalho para o coordenador. D adiciona complexidade desnecessária. A .

---
[ ] A - Have the subagent do local recovery for transient failures and only propagate errors it can't resolve, including what was attempted and partial results.
[ ] B - Have the subagent always return success with errors in metadata; the coordinator filters during synthesis.
[ ] C - Have the coordinator validate all documents before dispatching.
[ ] D - Create a dedicated error-handling agent monitoring all failures via a shared queue.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
