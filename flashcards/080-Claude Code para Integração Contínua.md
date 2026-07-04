Title: Claude Code para Integração Contínua
---

Seu script de pipeline executa `claude "Analyze this pull request for security issues"`, mas o job trava indefinidamente. Logs mostram que o Claude Code está esperando entrada interativa. Qual é a abordagem correta para rodar Claude Code em pipeline automatizado?

---
[ ] A - Adicionar a flag `--batch`: `claude --batch "Analyze this pull request for security issues"`.
[ ] B - Adicionar a flag `-p`: `claude -p "Analyze this pull request for security issues"`.
[ ] C - Redirecionar stdin de `/dev/null`: `claude "Analyze this pull request for security issues" < /dev/null`.
[ ] D - Definir a variável de ambiente `CLAUDE_HEADLESS=true` antes de executar o comando.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
