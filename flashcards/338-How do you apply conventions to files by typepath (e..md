Title: How do you apply conventions to files by type/path (e.
---

How do you apply conventions to files by type/path (e.g. test files scattered across the codebase)?
[Resposta correta: Regras em .claude/rules/ com glob patterns aplicam convenções de forma automática e determinística por caminho, independente de diretório. CLAUDE.md é vinculado a diretório; skill exige invocação; nenhum resolve regras condicionais por caminho como o glob.]

---
[ ] A - Put the conventions in the root directory's CLAUDE.md
[ ] B - Create files in .claude/rules/ with YAML frontmatter and glob patterns, applied according to the path
[ ] C - Create a skill invoked by slash command
[ ] D - Create a PostToolUse hook per file type

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
