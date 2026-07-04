Title: Geração de Código com Claude Code
---

Você cria uma skill customizada `/explore-alternatives` que seu time usa para fazer brainstorming e avaliar abordagens de implementação antes de escolher uma. Devs reportam que após rodar a skill, respostas subsequentes do Claude são influenciadas pela discussão de alternativas — às vezes referenciando abordagens rejeitadas ou retendo contexto de exploração que interfere na implementação real.

Como configurar essa skill de forma mais efetiva?

---
[ ] A - Usar o prefixo `!` na skill para rodar lógica de exploração como subprocesso bash.
[ ] B - Adicionar `context: fork` no frontmatter da skill.
[ ] C - Dividir em duas skills — `/explore-start` e `/explore-end` — para marcar fronteiras quando o contexto de exploração deve ser descartado.
[ ] D - Criar a skill em `~/.claude/skills/` em vez de `.claude/skills/`.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
