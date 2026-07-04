Title: Your pipeline runs claude "Analyze this pull request.
---

Your pipeline runs claude "Analyze this pull request..." but the job hangs indefinitely, waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?
O que a pergunta pede: correct approach to run Claude Code in an automated pipeline → rodar de forma não interativa.

A pegadinha: hangs... waiting for interactive input = trava esperando entrada interativa.

Raciocínio: O modo não interativo (print/headless) é ativado pela flag -p (ou --print ), que faz o Claude Code executar e sair sem prompt interativo. --batch , CLAUDE_HEADLESS e o redirecionamento de stdin não são o mecanismo oficial. B .

---
[ ] A - Add the --batch flag.
[ ] B - Add the -p flag: claude -p "Analyze this pull request..."
[ ] C - Redirect stdin from /dev/null.
[ ] D - Set CLAUDE_HEADLESS=true before running.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
