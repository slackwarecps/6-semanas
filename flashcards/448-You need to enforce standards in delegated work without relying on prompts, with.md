Title: You need to enforce standards in delegated work without relying on prompts, with separate frontend and backend reviewers.
---

You need to enforce standards in delegated work without relying on prompts, with separate frontend and backend reviewers. Which pattern meets this need?
[Resposta correta: O padrão usa subagents customizados distintos, cada um com suas próprias skills no frontmatter (reviewer frontend vs backend), garantindo isolamento e expertise específica. Um subagent genérico (A) ou um prompt longo (D) dependem de prompts, exatamente o que se quer evitar; um hook (C) não fornece o isolamento por expertise dos subagents.]

---
[ ] A - A single generic subagent that receives instructions for frontend and backend in the prompt.
[ ] B - Distinct custom subagents, each with its own skills in the skills field of the frontmatter.
[ ] C - A shared PostToolUse hook that decides the type of review at runtime.
[ ] D - A long system prompt that describes all the frontend and backend rules.

---
Tags: Domain_5::Context_Management_Reliability
