Title: Geração de Código com Claude Code
---

Seu time criou uma skill `/analyze-codebase` que faz análise profunda de código — varredura de dependências, contagem de cobertura de testes e métricas de qualidade. Após rodar o comando, membros do time relatam que Claude fica menos responsivo na sessão e perde o contexto da tarefa original.

Como você corrige isso de forma mais efetiva mantendo as capacidades plenas de análise?

---
[ ] A - Adicionar `context: fork` no frontmatter da skill para rodar a análise em contexto isolado de subagente.
[ ] B - Adicionar `model: haiku` no frontmatter para usar um modelo mais rápido e barato para análise.
[ ] C - Dividir a skill em três skills menores, cada uma produzindo menos saída.
[ ] D - Adicionar instruções à skill para comprimir todos os resultados em um sumário curto antes de exibi-los.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
