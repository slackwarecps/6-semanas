Title: A /commit skill exists at .
---

A /commit skill exists at .claude/skills/commit/SKILL.md . One developer wants to customize it personally without affecting teammates. What should you recommend?
O que a pergunta pede: what should you recommend para customizar sem afetar os colegas .

A pegadinha: without affecting teammates → mudança pessoal , não no projeto.

Raciocínio: Uma skill pessoal de mesmo nome em ~/.claude/skills/ tem precedência sobre a do projeto para aquele usuário, sem tocar no repositório compartilhado. D funcionaria mas cria um comando diferente (perde a ergonomia de /commit ); B inventa uma flag; C polui a skill do time. A . (D é aceitável se você quer um comando paralelo, mas a pergunta pede customizar o /commit .)

---
[ ] A - Create a personal version at ~/.claude/skills/commit/SKILL.md with the same name.
[ ] B - Set override: true in the personal skill's frontmatter.
[ ] C - Add username-based conditional logic to the project skill.
[ ] D - Create a personal version in ~/.claude/skills/ with a different name like /my-commit.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
