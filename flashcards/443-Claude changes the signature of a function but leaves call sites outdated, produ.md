Title: Claude changes the signature of a function but leaves call sites outdated, producing type errors.
---

Claude changes the signature of a function but leaves call sites outdated, producing type errors. Which configuration fixes this immediately?
[Resposta correta: O padrão é um PostToolUse hook rodando o type checker (ex: tsc --noEmit) após cada edição e devolvendo os erros ao Claude na hora. PreToolUse (A) roda antes da edição e não vê o resultado; rodar só no fim (C) perde o feedback imediato; reverter (D) não corrige os outros arquivos.]

---
[ ] A - A PreToolUse hook that blocks the edit before it happens.
[ ] B - A PostToolUse hook that runs the type checker after each edit, captures the errors and returns them to Claude to fix.
[ ] C - A hook that runs the type checker only at the end of the session, aggregating all the errors.
[ ] D - A hook that automatically reverts any edit with a type error.

---
Tags: Domain_5::Context_Management_Reliability
