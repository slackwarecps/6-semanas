Title: Three developers report Claude follows the "always include comprehensive error handling" guideline, but a fourth (new) developer reports it isn't followed.
---

Three developers report Claude follows the "always include comprehensive error handling" guideline, but a fourth (new) developer reports it isn't followed. All four are in the same repo with the latest code. What's the most likely cause and fix?
O que a pergunta pede: most likely cause and fix → a causa e a correção.

A pegadinha: Funciona para os veteranos, não para o novato → a regra está numa config pessoal , não no projeto .

Raciocínio: Padrão clássico: a regra está nas configs pessoais dos veteranos, então o novato nunca a recebe. A correção é mover para o nível de projeto (versionado), onde todos herdam. A inverte a lógica; C e D descrevem mecanismos que não funcionam assim. B .

---
[ ] A - The new dev's ~/.claude/CLAUDE.md has conflicting instructions; remove them.
[ ] B - The guideline lives in the original devs' ~/.claude/CLAUDE.md (user-level), not the project's .claude/CLAUDE.md. Move it to the project file so everyone gets it.
[ ] C - Claude caches CLAUDE.md; clear the cache.
[ ] D - Claude builds per-user preference models; the new dev must repeat the requirement until learned.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
