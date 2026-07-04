Title: An /analyze-codebase skill performs comprehensive analysis (dependency scanning, coverage, quality metrics).
---

An /analyze-codebase skill performs comprehensive analysis (dependency scanning, coverage, quality metrics). After running it, Claude becomes less responsive and loses track of the original task. What's the most effective way to address this while preserving full analysis capability?
O que a pergunta pede: most effective way... while preserving full analysis capability → restrição dupla.

A pegadinha: A saída da análise entope o contexto principal → isole-a num subagente.

Raciocínio: A causa é o contexto principal entupido pela análise volumosa. context: fork isola a execução, preservando toda a capacidade de análise sem poluir a sessão. A muda o modelo (não resolve o entupimento); B perde detalhe (não preserva análise completa); C fragmenta sem resolver o acúmulo. D .

---
[ ] A - Add model: haiku to the frontmatter for a faster model.
[ ] B - Compress all outputs into a brief summary before displaying.
[ ] C - Split into three smaller skills that each generate less output.
[ ] D - Add context: fork to run the analysis in an isolated sub-agent context.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
