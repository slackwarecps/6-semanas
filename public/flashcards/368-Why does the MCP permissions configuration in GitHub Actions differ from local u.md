Title: Why does the MCP permissions configuration in GitHub Actions differ from local use?
---

Why does the MCP permissions configuration in GitHub Actions differ from local use?
[Resposta correta: Em GitHub Actions cada tool precisa ser listada individualmente em allowed_tools. A descreve o atalho local, que não existe em Actions. C e D são falsos sobre o comportamento em Actions.]

---
[ ] A - Because in Actions it is enough to use the mcp__playwright prefix to allow everything.
[ ] B - Because in Actions there is no shortcut: each tool must be listed individually in allowed_tools, e.g., mcp__playwright__browser_click.
[ ] C - Because in Actions permissions are always granted automatically.
[ ] D - Because in Actions Claude does not use MCP servers.

---
Tags: Domain_2::Tool_Design_MCP_Integration
