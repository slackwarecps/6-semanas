Title: How do you tell Claude, in GitHub Actions, that the server is already running and how to query the database?
---

How do you tell Claude, in GitHub Actions, that the server is already running and how to query the database?
[Resposta correta: O campo custom_instructions do workflow transmite o contexto de ambiente (URL do server, logs, ferramentas). CLAUDE.md não é o canal para instruir o Actions; CLAUDE_HEADLESS não existe; hook não é o mecanismo descrito.]

---
[ ] A - By writing in the repository's CLAUDE.md
[ ] B - By the workflow's custom_instructions field, describing server, logs and how to access resources
[ ] C - By an environment variable CLAUDE_HEADLESS
[ ] D - By a SessionStart hook

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
