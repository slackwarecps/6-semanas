Title: Geração de Código com Claude Code
---

Você descobre que incluir 2–3 implementações completas de endpoint como contexto melhora significativamente a consistência ao gerar novos endpoints de API. Porém, esse contexto só é útil ao criar novos endpoints — não ao depurar, revisar código ou outros trabalhos no diretório de API.

Qual abordagem de configuração é mais efetiva?

---
[ ] A - Adicionar exemplos de endpoint e documentação de padrão ao CLAUDE.md do projeto para que estejam sempre disponíveis.
[ ] B - Referenciar manualmente exemplos de endpoint em cada solicitação de geração copiando código no prompt.
[ ] C - Configurar regras path-specific em `.claude/rules/api/` que incluam exemplos de endpoint e ativem ao trabalhar no diretório de API.
[ ] D - Criar uma skill que referencie os exemplos de endpoint e contenha instruções de seguimento de padrão, invocada sob demanda via slash command.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
