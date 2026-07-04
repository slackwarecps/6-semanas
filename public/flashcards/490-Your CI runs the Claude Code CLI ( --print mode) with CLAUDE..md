Title: Your CI runs the Claude Code CLI ( --print mode) with CLAUDE.
---

Your CI runs the Claude Code CLI ( --print mode) with CLAUDE.md. Reviews are insightful but produce narrative paragraphs that must be manually copied into PR comments. You want to auto-post each finding as a separate inline comment, requiring structured data (file path, line, severity, fix). What's the most effective approach?
O que a pergunta pede: most effective approach para obter dados estruturados que possam ser postados automaticamente.

A pegadinha: Postagem automática exige estrutura garantida — um formato de texto que o modelo "tenta" seguir não basta.

Raciocínio: Para automação confiável, a estrutura garantida por flags nativas ( --output-format json com schema) é a mais robusta. A e B dependem de o modelo seguir um formato textual (frágil). C adiciona um passo extra e ainda parseia texto. D usa o recurso feito exatamente para isso.

---
[ ] A - Add a "Review Output Format" section to CLAUDE.md with examples of structured findings.
[ ] B - Include formatting instructions in the prompt requiring a parseable template like [FILE:path] [LINE:n] [SEVERITY:level].
[ ] C - Keep the narrative format but add a summarization step that generates a structured JSON summary.
[ ] D - Use CLI flags --output-format json and --json-schema to enforce structured findings, then parse and post via the GitHub API.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
