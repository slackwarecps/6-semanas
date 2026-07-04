Title: You want a /review slash command available to every developer when they clone/pull the repo.
---

You want a /review slash command available to every developer when they clone/pull the repo. Where should you create this command file?
O que a pergunta pede: where should you create o comando para que todos recebam ao clonar → versionado no projeto.

A pegadinha: available to every developer when they clone/pull → tem que viver no projeto versionado.

Raciocínio: Para que todos recebam o comando ao clonar, ele precisa estar versionado no projeto : .claude/commands/ . C é pessoal (não compartilha); A e D não são onde comandos vivem. B .

---
[ ] A - In a .claude/config.json with a commands array.
[ ] B - In the .claude/commands/ directory in the project repository.
[ ] C - In ~/.claude/commands/ in each developer's home directory.
[ ] D - In the CLAUDE.md at the project root.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
