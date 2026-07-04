Title: A team guideline is not reaching all the developers.
---

A team guideline is not reaching all the developers. What is the likely cause and the fix?
[Resposta correta: Arquivos de usuário (~/.claude/CLAUDE.md) só afetam aquele dev; mover para o nível de projeto faz a diretriz chegar a todos. Não há cache persistente (A e D erram isso), e não é preciso escalar para enterprise (C).]

---
[ ] A - The CLAUDE.md persistent cache is out of date; clear the cache
[ ] B - The guideline is in the ~/.claude/CLAUDE.md (user level) of whoever wrote it; move it to the project's .claude/CLAUDE.md
[ ] C - The guideline needs to become an enterprise skill
[ ] D - The CLAUDE.md is only read on the first session; recreate the file

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
