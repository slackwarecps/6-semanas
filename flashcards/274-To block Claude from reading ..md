Title: To block Claude from reading .
---

To block Claude from reading .env files via a hook, which configuration do you use?
[Resposta correta: É um PreToolUse com matcher Read que inspeciona file_path e, ao encontrar .env, escreve em stderr e faz exit(2) para bloquear. PostToolUse não bloqueia; exit 0 sempre permite; skill não é o mecanismo desse cenário.]

---
[ ] A - PostToolUse with matcher Read, exit 2
[ ] B - PreToolUse with matcher Read that checks tool_input.file_path; if it contains .env, write to stderr and exit(2)
[ ] C - PreToolUse with matcher * and exit 0 always
[ ] D - A skill with disallowed-tools listing Read

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
