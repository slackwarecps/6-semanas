Title: How should a subagent report a failure to the coordinator?
---

How should a subagent report a failure to the coordinator?
[Resposta correta: O contexto de erro estruturado permite ao coordenador decidir retry, alternativa ou prosseguir. A esconde informação, B impede recuperação e D é desproporcional para uma falha localizada.]

---
[ ] A - With a generic "failure" status, without details.
[ ] B - By marking the failure as success so as not to interrupt the flow.
[ ] C - By returning structured error context: type of failure, attempted query, partials and alternatives.
[ ] D - By aborting the whole workflow immediately.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
