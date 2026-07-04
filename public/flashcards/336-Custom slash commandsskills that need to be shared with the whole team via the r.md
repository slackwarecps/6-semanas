Title: Custom slash commands/skills that need to be shared with the whole team via the repository should go where?
---

Custom slash commands/skills that need to be shared with the whole team via the repository should go where?
[Resposta correta: O escopo de projeto (.claude/commands/ ou .claude/skills/) é versionado e chega a todos via Git. ~/.claude/ é para comandos pessoais não compartilhados; CLAUDE.md é contexto, não define comandos; settings.local.json não é commitado.]

---
[ ] A - In ~/.claude/commands, user scope
[ ] B - In the project directory (.claude/commands/ or .claude/skills/), versioned and available to whoever clones
[ ] C - In the project's CLAUDE.md, as text
[ ] D - In the project's settings.local.json

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
