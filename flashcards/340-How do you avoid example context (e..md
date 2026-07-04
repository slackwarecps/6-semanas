Title: How do you avoid example context (e.
---

How do you avoid example context (e.g. example endpoints) being loaded when it is not needed?
[Resposta correta: Uma skill invocada sob demanda carrega o material só quando chamada. CLAUDE.md carrega sempre; regra por caminho carrega para qualquer tarefa naquele diretório; @ no CLAUDE.md inclui em toda requisição.]

---
[ ] A - Put it in the CLAUDE.md, which loads always
[ ] B - Create a skill that references the material and is invoked on demand via slash command
[ ] C - Create a path-based rule in .claude/rules/
[ ] D - Reference it with @ in the CLAUDE.md

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
