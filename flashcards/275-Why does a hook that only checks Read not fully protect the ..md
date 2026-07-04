Title: Why does a hook that only checks Read not fully protect the .
---

Why does a hook that only checks Read not fully protect the .env, and what is the more robust alternative?
[Resposta correta: Como Grep e Bash não enviam file_path, um hook de Read não cobre grep nem cat .env; regras permissions.deny (ex.: Read(**/.env)) dão cobertura uniforme. As demais erram a causa ou negam a necessidade de proteção.]

---
[ ] A - Because hooks cannot read stdin; use a subagent
[ ] B - Because each tool has a different input (Grep uses pattern, Bash uses command), so the file_path check does not catch grep or cat; use permissions.deny
[ ] C - Because the Read matcher does not exist; use matcher *
[ ] D - Because .env is ignored by default; no protection is needed

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
