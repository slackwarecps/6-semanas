Title: Integrar findings de Claude Code em PRs com structured output
---
Your CI pipeline runs the Claude Code CLI (with --print mode) using CLAUDE.md to provide project context for code reviews, and developers generally find the reviews insightful. However, they report that integrating findings into your workflow is difficult—Claude produces narrative paragraphs that must be manually copied into PR comments. Your team wants to automatically post each finding as a separate inline PR comment at the relevant code location, which requires structured data with file path, line number, severity, and suggested fix.
What's the most effective approach?
---
[ ] A - Include explicit formatting instructions in your review prompt requiring each finding to follow a parseable template like [FILE:path] [LINE:n] [SEVERITY:level] ... .
[ ] B - Use CLI flags --output-format json and --json-schema to enforce structured findings, then parse output to post inline comments via the GitHub API.
[ ] C - Keep the narrative review format but add a summarization step that uses Claude to generate a structured JSON summary of the findings.
[ ] D - Add a "Review Output Format" section to CLAUDE.md with examples showing structured findings, so Claude learns the expected format from project context.
---
Tags: Domain_3::Claude_Code_Configuration_Workflows Domain_4::Prompt_Engineering_Structured_Output Domain_2::Tool_Design_MCP_Integration
