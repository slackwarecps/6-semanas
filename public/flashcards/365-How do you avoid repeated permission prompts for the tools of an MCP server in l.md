Title: How do you avoid repeated permission prompts for the tools of an MCP server in local use?
---

How do you avoid repeated permission prompts for the tools of an MCP server in local use?
[Resposta correta: A entrada vai no array allow de .claude/settings.local.json com o prefixo mcp__ (dois underscores). A erra o número de underscores. B descreve o caso do GitHub Actions, não o local. D é inseguro e não é o mecanismo indicado.]

---
[ ] A - Add "mcp_playwright" with one underscore to the allow array.
[ ] B - List each tool individually in allowed_tools in the workflow.
[ ] C - In .claude/settings.local.json, add "mcp__playwright" with two underscores to the permissions allow array.
[ ] D - Completely disable Claude Code's permission system.

---
Tags: Domain_2::Tool_Design_MCP_Integration
