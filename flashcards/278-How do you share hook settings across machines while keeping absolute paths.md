Title: How do you share hook settings across machines while keeping absolute paths?
---

How do you share hook settings across machines while keeping absolute paths?
[Resposta correta: Um settings.example.json com $PWD e um script de setup gera o settings.local.json com o caminho absoluto local. Commitar caminhos fixos não funciona em outras máquinas; caminhos relativos perdem a proteção; CLAUDE_HEADLESS não existe.]

---
[ ] A - Commit the settings.json with fixed absolute paths from your machine
[ ] B - Use settings.example.json with a $PWD placeholder and an init script that generates the local settings.local.json
[ ] C - Use relative paths, giving up security
[ ] D - Set the CLAUDE_HEADLESS variable to resolve the paths

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
