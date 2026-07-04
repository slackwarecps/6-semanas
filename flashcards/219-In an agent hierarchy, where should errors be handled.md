Title: In an agent hierarchy, where should errors be handled?
---

In an agent hierarchy, where should errors be handled?
[Resposta correta: O tratamento deve ocorrer no nível mais baixo capaz de resolver. A aumenta o ônus do coordenador. C esconde problemas e D adiciona complexidade desnecessária.]

---
[ ] A - Always in the coordinator, which validates everything centrally.
[ ] B - At the lowest level capable of resolving them, with the subagent recovering transient failures and propagating only what it cannot resolve.
[ ] C - By masking the error as success so as not to interrupt the flow.
[ ] D - In an extra layer dedicated exclusively to errors.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
