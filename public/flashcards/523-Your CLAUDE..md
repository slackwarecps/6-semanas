Title: Your CLAUDE.
---

Your CLAUDE.md (400+ lines) has coding standards, testing, a PR review checklist, deployment, migrations. You want coding/testing always applied, but PR/deployment/migration guidance only during those tasks. What's the most effective restructuring approach?
O que a pergunta pede: most effective restructuring → reestruturar.

A pegadinha: sempre (universais) vs só ao executar essas tarefas (específicos de tarefa).

Raciocínio: A divisão pedida é sempre vs sob demanda por tarefa . Universais ficam no CLAUDE.md (sempre carregados); fluxos de tarefa viram Skills acionadas quando necessário. B é por tipo de arquivo (não por tarefa); C mantém tudo sempre carregado; D tira até o que deveria ser sempre aplicado. A .

---
[ ] A - Keep universal standards in CLAUDE.md and create Skills for task-specific workflows (PR, deploy, migrations) with trigger keywords.
[ ] B - Split into .claude/rules/ with path-specific glob patterns per file type.
[ ] C - Keep all content in CLAUDE.md using @import to organize into files.
[ ] D - Move all guidance into Skills, keeping only a brief project description in CLAUDE.md.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
