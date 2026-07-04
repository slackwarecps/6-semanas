Title: A single corrupted file causes an error in the pipeline.
---

A single corrupted file causes an error in the pipeline. How do you propagate this error?
[Resposta correta: Propagar o erro com contexto ao coordenador é a resposta correta. A é inútil, pois corrupção é falha permanente, não transitória. C esconde informação e D é desproporcional.]

---
[ ] A - Retry a few times, because retry usually solves it.
[ ] B - Return the error with context to the coordinator and let it decide to skip, use an alternative or warn the user.
[ ] C - Fail silently and continue with the other files.
[ ] D - Shut down the whole workflow immediately.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
