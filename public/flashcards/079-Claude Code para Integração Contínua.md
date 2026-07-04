Title: Claude Code para Integração Contínua
---

Seu pipeline de CI executa o Claude Code CLI (em modo `--print`) usando CLAUDE.md para fornecer contexto do projeto para code review, e os devs em geral acham as reviews substantivas. Porém, eles relatam que integrar achados ao workflow é difícil — Claude emite parágrafos narrativos que precisam ser copiados manualmente para comentários no PR. O time quer postar automaticamente cada achado como comentário inline separado no local relevante do código, o que exige dados estruturados com path do arquivo, número da linha, nível de severidade e correção sugerida. Qual abordagem é mais efetiva?

---
[ ] A - Adicionar uma seção "Output Format for Review" ao CLAUDE.md com exemplos de achados estruturados para que Claude aprenda o formato esperado a partir do contexto do projeto.
[ ] B - Usar as flags do CLI `--output-format json` e `--json-schema` para forçar achados estruturados, depois parsear a saída para postar comentários inline via API do GitHub.
[ ] C - Incluir instruções explícitas de formatação no prompt de review exigindo que cada achado siga um template parseável como `[FILE:path] [LINE:n] [SEVERITY:level] ...`.
[ ] D - Manter o formato narrativo de review mas adicionar um passo de sumarização que use Claude para gerar um sumário JSON estruturado dos achados.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
