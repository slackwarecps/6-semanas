Title: You want file protection that applies equally to Read, Grep and Bash.
---

You want file protection that applies equally to Read, Grep and Bash. What do you use?
[Resposta correta: permissions.deny aplica-se de forma uniforme a todas as tools, sem precisar de um matcher por tool. Hook de Read não cobre Grep/Bash; PostToolUse não bloqueia; prosa no CLAUDE.md não tem enforcement.]

---
[ ] A - A PreToolUse hook with matcher Read
[ ] B - permissions.deny rules, which apply uniformly to all tools
[ ] C - A PostToolUse hook with matcher *
[ ] D - A prose instruction in the CLAUDE.md

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
