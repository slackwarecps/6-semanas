Title: Adding error handling across 120 files in three phases: (1) discovery, (2) collaborative design, (3) implementation.
---

Adding error handling across 120 files in three phases: (1) discovery, (2) collaborative design, (3) implementation. In Phase 1 Claude generates verbose output that fills the context window before discovery finishes. What's the most effective approach to complete this while maintaining implementation consistency?
O que a pergunta pede: most effective approach... while maintaining consistency → restrição dupla (terminar a descoberta + manter consistência).

A pegadinha: A Fase 1 é verbosa e enche o contexto → isole a verbosidade num subagente.

Raciocínio: A descoberta verbosa deve rodar isolada (subagente Explore) , devolvendo só um resumo ao contexto principal, que fica limpo para o design e a implementação consistentes. A e B fragmentam o estado (risco à consistência); C só adia o estouro de contexto. D .

---
[ ] A - Headless mode with --continue, passing explicit summaries between batches.
[ ] B - Define the pattern in CLAUDE.md, process files in batches across sessions, relying on the shared file.
[ ] C - Continue all phases in the main conversation, using /compact periodically.
[ ] D - Use the Explore subagent for Phase 1 to isolate verbose output and return a summary, then continue Phases 2-3 in the main conversation.

---
Tags: Domain_5::Context_Management_Reliability
