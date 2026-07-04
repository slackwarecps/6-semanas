Title: Executar Claude Code em pipeline automatizado sem input interativo
---
Your pipeline script runs claude "Analyze this pull request for security issues" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?
---
[ ] A - Redirect stdin from /dev/null: claude "Analyze this pull request for security issues" < /dev/null
[ ] B - Set the environment variable CLAUDE_HEADLESS=true before running the command
[ ] C - Add the -p flag: claude -p "Analyze this pull request for security issues"
[ ] D - Add the --batch flag: claude --batch "Analyze this pull request for security issues"
---
Tags: Domain_3::Claude_Code_Configuration_Workflows Domain_1::Agentic_Architecture_Orchestration
