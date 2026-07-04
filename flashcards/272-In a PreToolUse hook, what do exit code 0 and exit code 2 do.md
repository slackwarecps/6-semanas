Title: In a PreToolUse hook, what do exit code 0 and exit code 2 do?
---

In a PreToolUse hook, what do exit code 0 and exit code 2 do?
[Resposta correta: Exit 0 permite; exit 2 bloqueia e manda o texto de stderr ao Claude como feedback. A A inverte; a C ignora o bloqueio; a D troca os papéis e os canais.]

---
[ ] A - 0 blocks; 2 allows
[ ] B - 0 allows the tool call; 2 blocks and sends the stderr as feedback to Claude
[ ] C - Both allow; the difference is only in logging
[ ] D - 2 allows and sends stdout to the user; 0 blocks silently

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
